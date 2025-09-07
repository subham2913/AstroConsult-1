const Category = require("../models/Category");

exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(400).json({ msg: "Category already exists" });
    }
    
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }
    
    await Category.findByIdAndDelete(id);
    res.json({ msg: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }
    
    // Check if new name already exists (excluding current category)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      return res.status(400).json({ msg: "Category name already exists" });
    }
    
    const updatedCategory = await Category.findByIdAndUpdate(
      id, 
      { name }, 
      { new: true }
    );
    
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};