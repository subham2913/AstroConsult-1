const Subcategory = require("../models/Subcategory");

exports.addSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    
    // Check if subcategory already exists for this category
    const existingSubcategory = await Subcategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      categoryId: categoryId
    });
    
    if (existingSubcategory) {
      return res.status(400).json({ msg: "Subcategory already exists for this category" });
    }
    
    const subcategory = await Subcategory.create({ name, categoryId });
    const populatedSubcategory = await Subcategory.findById(subcategory._id).populate("categoryId");
    
    res.status(201).json(populatedSubcategory);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .populate("categoryId")
      .sort({ createdAt: -1 });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;
    
    // Check if subcategory exists
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ msg: "Subcategory not found" });
    }
    
    // Check if new name already exists for this category (excluding current subcategory)
    const existingSubcategory = await Subcategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      categoryId: categoryId,
      _id: { $ne: id }
    });
    
    if (existingSubcategory) {
      return res.status(400).json({ msg: "Subcategory name already exists for this category" });
    }
    
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      id, 
      { name, categoryId }, 
      { new: true }
    ).populate("categoryId");
    
    res.json(updatedSubcategory);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({ msg: "Subcategory not found" });
    }
    
    await Subcategory.findByIdAndDelete(id);
    res.json({ msg: "Subcategory deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({ categoryId })
      .populate("categoryId")
      .sort({ createdAt: -1 });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};