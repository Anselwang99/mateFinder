const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Helper function to create JWT token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// Helper function to send token and user data response
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};

// Register new user
exports.signup = async (req, res, next) => {
    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            location: req.body.location || {
                type: "Point",
                coordinates: [0, 0],
            },
            bio: req.body.bio,
            interests: req.body.interests,
        });

        createSendToken(newUser, 201, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide email and password!",
            });
        }

        // 2) Check if user exists && password is correct
        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: "fail",
                message: "Incorrect email or password",
            });
        }

        // 3) If everything ok, send token to client
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Get current user profile
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Update current user's data
exports.updateMe = async (req, res, next) => {
    try {
        // 1) Create error if user tries to update password
        if (req.body.password || req.body.passwordConfirm) {
            return res.status(400).json({
                status: "fail",
                message:
                    "This route is not for password updates. Please use /updateMyPassword",
            });
        }

        // 2) Filter out unwanted fields that should not be updated
        const filteredBody = {};
        const allowedFields = [
            "name",
            "email",
            "photo",
            "bio",
            "interests",
            "location",
        ];

        Object.keys(req.body).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredBody[key] = req.body[key];
            }
        });

        // 3) Update user document
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            filteredBody,
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: {
                user: updatedUser,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Update password
exports.updatePassword = async (req, res, next) => {
    try {
        // 1) Get user from collection
        const user = await User.findById(req.user.id).select("+password");

        // 2) Check if POSTed current password is correct
        if (
            !(await user.correctPassword(
                req.body.currentPassword,
                user.password
            ))
        ) {
            return res.status(401).json({
                status: "fail",
                message: "Your current password is wrong",
            });
        }

        // 3) If so, update password
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        await user.save();

        // 4) Log user in, send JWT
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
