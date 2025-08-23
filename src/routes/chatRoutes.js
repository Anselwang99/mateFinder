const express = require("express");
const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../services/mediaService");

const router = express.Router();

// All chat routes are protected
router.use(protect);

// Regular chat routes
router.get("/", chatController.getMyChats);
router.post("/", chatController.createChat);
router.get("/:chatId", chatController.getChat);
router.post("/:chatId/messages", chatController.sendMessage);

// Media upload route - using the upload middleware from mediaService
// Note: You'll need to merge the controller code from chatController.media.js
router.post(
    "/:chatId/media",
    upload.single("media"), // 'media' is the field name for the file upload
    chatController.uploadMedia
);

module.exports = router;
