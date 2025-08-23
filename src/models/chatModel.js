const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: [true, "Chat must have participants"],
            },
        ],
        messages: [
            {
                sender: {
                    type: mongoose.Schema.ObjectId,
                    ref: "User",
                    required: [true, "Message must have a sender"],
                },
                content: {
                    type: String,
                    required: [true, "Message must have content"],
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                read: {
                    type: Boolean,
                    default: false,
                },
                // Media support
                media: {
                    type: {
                        type: String,
                        enum: ["image", "video", "audio", null],
                        default: null,
                    },
                    url: String,
                    thumbnail: String,
                    metadata: {
                        size: Number,
                        width: Number,
                        height: Number,
                        duration: Number, // for videos/audio in seconds
                        mimeType: String,
                    },
                },
            },
        ],
        lastMessage: {
            content: String,
            createdAt: Date,
            sender: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
            },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index to find chats by participant
chatSchema.index({ participants: 1 });

// Populate participants when finding chats
chatSchema.pre(/^find/, function (next) {
    this.populate({
        path: "participants",
        select: "name photo",
    });

    next();
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
