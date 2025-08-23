const aws = require("aws-sdk");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Configure AWS SDK
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Accept images and videos only
    if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/")
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Unsupported file type! Please upload only images or videos."
            ),
            false
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
    },
});

// Upload to S3
const uploadToS3 = async (file) => {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `uploads/${fileName}`,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: "public-read",
    };

    const result = await s3.upload(params).promise();
    return result.Location; // Return the URL of the uploaded file
};

// Helper function to determine if a file is a video
const isVideo = (mimetype) => mimetype.startsWith("video/");

module.exports = {
    upload,
    uploadToS3,
    isVideo,
};
