const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/userRoutes");
const locationRoutes = require("./routes/locationRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Import socket handler
const socketHandler = require("./services/socketHandler");

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/chats", chatRoutes);

// Socket.io initialization
socketHandler(io);

// Connect to MongoDB
const connectWithRetry = () => {
    console.log("Attempting to connect to MongoDB...");
    mongoose
        .connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        })
        .then(() => {
            console.log("Connected to MongoDB successfully");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err);
            console.log("Retrying connection in 5 seconds...");
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: "error",
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Catch all non-existing routes
app.all("*", (req, res) => {
    res.status(404).json({
        status: "fail",
        message: `Can't find ${req.originalUrl} on this server!`,
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
});

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
