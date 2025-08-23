const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const { uploadToS3 } = require("../services/mediaService");
const sharp = require("sharp"); // For image processing

// Get all chats for current user
exports.getMyChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: { $in: [req.user.id] },
        }).sort({ updatedAt: -1 });

        res.status(200).json({
            status: "success",
            results: chats.length,
            data: {
                chats,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Get a specific chat by ID
exports.getChat = async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId);

        // Check if chat exists
        if (!chat) {
            return res.status(404).json({
                status: "fail",
                message: "No chat found with that ID",
            });
        }

        // Check if current user is a participant
        if (!chat.participants.some((p) => p._id.toString() === req.user.id)) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to view this chat",
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                chat,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Create a new chat with another user
exports.createChat = async (req, res) => {
    try {
        const { receiverId } = req.body;

        if (!receiverId) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide a user to chat with",
            });
        }

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                status: "fail",
                message: "No user found with that ID",
            });
        }

        // Check if chat already exists between these users
        const existingChat = await Chat.findOne({
            participants: {
                $all: [req.user.id, receiverId],
            },
        });

        if (existingChat) {
            return res.status(200).json({
                status: "success",
                data: {
                    chat: existingChat,
                },
            });
        }

        // Create new chat
        const newChat = await Chat.create({
            participants: [req.user.id, receiverId],
            messages: [],
        });

        res.status(201).json({
            status: "success",
            data: {
                chat: newChat,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Send a message in a chat
exports.sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                status: "fail",
                message: "Message content is required",
            });
        }

        // Find the chat
        const chat = await Chat.findById(chatId);

        // Check if chat exists
        if (!chat) {
            return res.status(404).json({
                status: "fail",
                message: "No chat found with that ID",
            });
        }

        // Check if current user is a participant
        if (!chat.participants.some((p) => p._id.toString() === req.user.id)) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to send messages in this chat",
            });
        }

        // Add message to chat
        const newMessage = {
            sender: req.user.id,
            content,
            createdAt: Date.now(),
        };

        chat.messages.push(newMessage);
        chat.lastMessage = {
            content,
            createdAt: Date.now(),
            sender: req.user.id,
        };

        await chat.save();

        res.status(201).json({
            status: "success",
            data: {
                message: newMessage,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Upload media to a chat
exports.uploadMedia = async (req, res) => {
    try {
        // multer middleware should be applied before this controller method
        if (!req.file) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide a file to upload",
            });
        }

        const { chatId } = req.params;
        const { content } = req.body;

        // Find the chat
        const chat = await Chat.findById(chatId);

        // Check if chat exists
        if (!chat) {
            return res.status(404).json({
                status: "fail",
                message: "No chat found with that ID",
            });
        }

        // Check if current user is a participant
        if (!chat.participants.some((p) => p._id.toString() === req.user.id)) {
            return res.status(403).json({
                status: "fail",
                message: "You are not authorized to send messages in this chat",
            });
        }

        // Upload file to S3
        const mediaUrl = await uploadToS3(req.file);

        // Determine media type
        const mediaType = req.file.mimetype.startsWith("image/")
            ? "image"
            : req.file.mimetype.startsWith("video/")
            ? "video"
            : req.file.mimetype.startsWith("audio/")
            ? "audio"
            : null;

        // Generate metadata
        const metadata = {
            size: req.file.size,
            mimeType: req.file.mimetype,
        };

        // Generate thumbnail for images
        let thumbnailUrl = null;
        if (mediaType === "image") {
            try {
                // Get image dimensions
                const imageInfo = await sharp(req.file.buffer).metadata();
                metadata.width = imageInfo.width;
                metadata.height = imageInfo.height;

                // Generate thumbnail (could save to S3 as well)
                // This is simplified - in production you'd upload the thumbnail to S3 too
                thumbnailUrl = mediaUrl;
            } catch (err) {
                console.error("Error processing image:", err);
            }
        }

        // For videos, you might want to generate thumbnails using a service like AWS MediaConvert
        // This would be implemented separately

        // Add message to chat
        const newMessage = {
            sender: req.user.id,
            content: content || "Shared a " + mediaType,
            createdAt: Date.now(),
            media: {
                type: mediaType,
                url: mediaUrl,
                thumbnail: thumbnailUrl,
                metadata,
            },
        };

        chat.messages.push(newMessage);
        chat.lastMessage = {
            content: content || `Shared a ${mediaType}`,
            createdAt: Date.now(),
            sender: req.user.id,
        };

        await chat.save();

        res.status(201).json({
            status: "success",
            data: {
                message: newMessage,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
