const express = require("express");
const { adminAuth } = require("../middleware/authmiddleware");
const {
  getPendingUsers,
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
  getUserStats
} = require("../controllers/adminController");

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Get user statistics
router.get("/stats", getUserStats);

// Get all pending users
router.get("/users/pending", getPendingUsers);

// Get all users with pagination and filtering
router.get("/users", getAllUsers);

// Approve user
router.put("/users/:userId/approve", approveUser);

// Reject user
router.put("/users/:userId/reject", rejectUser);

// Delete user
router.delete("/users/:userId", deleteUser);

module.exports = router;