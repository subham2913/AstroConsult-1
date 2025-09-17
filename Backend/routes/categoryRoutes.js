const express = require("express");
const { 
  addCategory, 
  getCategories, 
  deleteCategory, 
  updateCategory 
} = require("../controllers/categoryController");
const {authMiddleware} = require("../middleware/authMiddleware");

const router = express.Router();

// Allow any authenticated user to create categories
router.post("/", authMiddleware(), addCategory);
router.get("/", authMiddleware(), getCategories);
router.put("/:id", authMiddleware(), updateCategory);
router.delete("/:id", authMiddleware(), deleteCategory);

module.exports = router;