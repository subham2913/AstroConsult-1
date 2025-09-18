const express = require("express");
const { 
  addSubcategory, 
  getSubcategories, 
  updateSubcategory, 
  deleteSubcategory,
  getSubcategoriesByCategory 
} = require("../controllers/subcategoryController");
const {authMiddleware} = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", authMiddleware(), addSubcategory);
router.get("/", authMiddleware(), getSubcategories);
router.get("/category/:categoryId", authMiddleware(), getSubcategoriesByCategory);
router.put("/:id", authMiddleware(), updateSubcategory);
router.delete("/:id", authMiddleware(), deleteSubcategory);

module.exports = router;