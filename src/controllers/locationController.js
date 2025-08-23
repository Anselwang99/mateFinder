const User = require("../models/userModel");

// Update user's location
exports.updateLocation = async (req, res) => {
    try {
        const { longitude, latitude } = req.body;

        if (!longitude || !latitude) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide longitude and latitude coordinates",
            });
        }

        // Update user's location
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                location: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                    lastUpdated: Date.now(),
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: {
                location: user.location,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// Find nearby users
exports.getNearbyUsers = async (req, res) => {
    try {
        const { longitude, latitude, distance = 10 } = req.query;

        // If coordinates not provided in query, use user's stored location
        let coordinates;
        if (!longitude || !latitude) {
            const user = await User.findById(req.user.id);
            coordinates = user.location.coordinates;
        } else {
            coordinates = [parseFloat(longitude), parseFloat(latitude)];
        }

        // Convert distance from km to meters
        const radius = parseFloat(distance) * 1000;

        // Find users near the specified location
        const users = await User.find({
            _id: { $ne: req.user._id }, // Exclude the current user
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates,
                    },
                    $maxDistance: radius,
                },
            },
        }).select("name photo location bio interests");

        res.status(200).json({
            status: "success",
            results: users.length,
            data: {
                users,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
