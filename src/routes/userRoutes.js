const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Auth routes
router.post("/signup", authController.signup);
router.post("/login", authController.login);

// Protected routes (require authentication)
router.use(protect);

router.get("/me", authController.getMe);
router.patch("/updateMe", authController.updateMe);
router.patch("/updateMyPassword", authController.updatePassword);

module.exports = router;
