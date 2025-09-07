const express = require("express");
const { registerUser, loginUser, getProfile } = require("../controllers/authController");
const { auth } = require("../middleware/authmiddleware");
const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/profile", auth, getProfile);

module.exports = router;