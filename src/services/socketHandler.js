const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

// Handle authentication for socket connections
const authenticateSocket = async (socket, next) => {
    try {
        // Get token from socket handshake
        const token =
            socket.handshake.auth.token ||
            socket.handshake.headers.authorization?.split(" ")[1];

        if (!token) {
            return next(new Error("Not authenticated. No token provided."));
        }

        // Verify token
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );

        // Check if user exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new Error("User not found"));
        }

        // Add user data to socket object
        socket.userId = user._id;
        socket.userData = {
            id: user._id,
            name: user.name,
        };

        next();
    } catch (error) {
        next(new Error("Authentication error: " + error.message));
    }
};

module.exports = (io) => {
    // Apply authentication middleware
    io.use(authenticateSocket);

    // Handle connections
    io.on("connection", async (socket) => {
        console.log(`User connected: ${socket.userId}`);

        try {
            // Update user online status
            await User.findByIdAndUpdate(socket.userId, { online: true });

            // Join personal room for private messages
            socket.join(socket.userId.toString());

            // Join all chat rooms user is a participant in
            const chats = await Chat.find({ participants: socket.userId });
            chats.forEach((chat) => {
                socket.join(`chat:${chat._id}`);
            });

            // Notify other users that this user is online
            io.emit("user:status", {
                userId: socket.userId,
                status: "online",
            });

            // Handle joining a chat room
            socket.on("chat:join", async (chatId) => {
                try {
                    const chat = await Chat.findById(chatId);

                    // Verify user is a participant
                    if (
                        !chat ||
                        !chat.participants.some(
                            (p) => p._id.toString() === socket.userId.toString()
                        )
                    ) {
                        socket.emit("error", {
                            message: "Not authorized to join this chat",
                        });
                        return;
                    }

                    socket.join(`chat:${chatId}`);
                } catch (error) {
                    socket.emit("error", { message: error.message });
                }
            });

            // Handle sending a message
            socket.on("chat:message", async ({ chatId, content }) => {
                try {
                    const chat = await Chat.findById(chatId);

                    // Verify user is a participant
                    if (
                        !chat ||
                        !chat.participants.some(
                            (p) => p._id.toString() === socket.userId.toString()
                        )
                    ) {
                        socket.emit("error", {
                            message:
                                "Not authorized to send messages in this chat",
                        });
                        return;
                    }

                    // Create new message
                    const newMessage = {
                        sender: socket.userId,
                        content,
                        createdAt: Date.now(),
                    };

                    // Update chat with new message
                    chat.messages.push(newMessage);
                    chat.lastMessage = {
                        content,
                        createdAt: Date.now(),
                        sender: socket.userId,
                    };

                    await chat.save();

                    // Broadcast message to all users in the chat
                    io.to(`chat:${chatId}`).emit("chat:message", {
                        chatId,
                        message: {
                            ...newMessage,
                            sender: {
                                _id: socket.userId,
                                name: socket.userData.name,
                            },
                        },
                    });
                } catch (error) {
                    socket.emit("error", { message: error.message });
                }
            });

            // Handle location updates
            socket.on("location:update", async ({ longitude, latitude }) => {
                try {
                    await User.findByIdAndUpdate(socket.userId, {
                        location: {
                            type: "Point",
                            coordinates: [longitude, latitude],
                            lastUpdated: Date.now(),
                        },
                    });

                    socket.emit("location:updated", { success: true });
                } catch (error) {
                    socket.emit("error", { message: error.message });
                }
            });

            // Handle typing indicators
            socket.on("chat:typing", ({ chatId, isTyping }) => {
                socket.to(`chat:${chatId}`).emit("chat:typing", {
                    chatId,
                    userId: socket.userId,
                    isTyping,
                });
            });

            // Handle disconnect
            socket.on("disconnect", async () => {
                console.log(`User disconnected: ${socket.userId}`);

                try {
                    // Update user online status
                    await User.findByIdAndUpdate(socket.userId, {
                        online: false,
                        "location.lastUpdated": Date.now(),
                    });

                    // Notify other users that this user is offline
                    io.emit("user:status", {
                        userId: socket.userId,
                        status: "offline",
                    });
                } catch (error) {
                    console.error(
                        "Error updating user status on disconnect:",
                        error
                    );
                }
            });
        } catch (error) {
            console.error("Error in socket connection:", error);
        }
    });
};
