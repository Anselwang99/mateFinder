const express = require("express");
const locationController = require("../controllers/locationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All location routes are protected
router.use(protect);

router.patch("/update", locationController.updateLocation);
router.get("/nearby", locationController.getNearbyUsers);

module.exports = router;
