const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide your name"],
        },
        email: {
            type: String,
            required: [true, "Please provide your email"],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, "Please provide a valid email"],
        },
        photo: {
            type: String,
            default: "default.jpg",
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: 8,
            select: false,
        },
        passwordConfirm: {
            type: String,
            required: [true, "Please confirm your password"],
            validate: {
                // This only works on CREATE and SAVE!
                validator: function (el) {
                    return el === this.password;
                },
                message: "Passwords are not the same!",
            },
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
            },
            lastUpdated: {
                type: Date,
                default: Date.now,
            },
        },
        online: {
            type: Boolean,
            default: false,
        },
        bio: String,
        interests: [String],
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
            type: Boolean,
            default: true,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Create geospatial index on location
userSchema.index({ "location.coordinates": "2dsphere" });

// Password encryption middleware
userSchema.pre("save", async function (next) {
    // Only run this function if password was modified
    if (!this.isModified("password")) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    next();
});

// Update passwordChangedAt property when password changes
userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    // Set passwordChangedAt to now minus 1 second
    // (ensuring the token is created after the password has been changed)
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Only show active users
userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

// Instance method to check if password is correct
userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    // False means NOT changed
    return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
