const express = require("express");
const {
  addConsultationHistory,
  getConsultationHistory,
  getConsultationHistoryById,
  updateConsultationHistory,
  deleteConsultationHistory,
  getMyConsultationHistory // NEW: Import the new controller method
} = require("../controllers/consultationHistoryController");
const {authMiddleware} = require("../middleware/authmiddleware");

const router = express.Router();

// NEW: Get all consultation history for current user
router.get("/my", authMiddleware(), getMyConsultationHistory);

// Get all consultation history for a specific consultation
router.get("/consultation/:consultationId", authMiddleware(), getConsultationHistory);

// Get specific consultation history entry
router.get("/:historyId", authMiddleware(), getConsultationHistoryById);

// Add new consultation history entry
router.post("/consultation/:consultationId", authMiddleware(), addConsultationHistory);

// Update consultation history entry
router.put("/:historyId", authMiddleware(), updateConsultationHistory);

// Delete consultation history entry
router.delete("/:historyId", authMiddleware(), deleteConsultationHistory);

module.exports = router;