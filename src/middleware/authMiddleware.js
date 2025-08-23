const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/userModel");

// Middleware to protect routes - only authenticated users can access
exports.protect = async (req, res, next) => {
    try {
        // 1) Check if token exists
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                status: "fail",
                message: "You are not logged in! Please log in to get access",
            });
        }

        // 2) Verify token
        const decoded = await promisify(jwt.verify)(
            token,
            process.env.JWT_SECRET
        );

        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: "fail",
                message: "The user belonging to this token no longer exists",
            });
        }

        // 4) Check if user changed password after token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                status: "fail",
                message: "User recently changed password! Please log in again",
            });
        }

        // Grant access to protected route
        req.user = currentUser;
        next();
    } catch (error) {
        return res.status(401).json({
            status: "fail",
            message: "Authentication failed",
        });
    }
};

// Middleware to restrict access to certain roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // Check if user role is included in the roles array
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "fail",
                message: "You do not have permission to perform this action",
            });
        }
        next();
    };
};
