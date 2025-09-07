const User = require("../models/User");

// Get all pending users
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" })
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.json(pendingUsers);
  } catch (error) {
    console.error("Get pending users error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Get all users (with pagination and filtering)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const role = req.query.role;
    
    const skip = (page - 1) * limit;
    
    // Build filter
    let filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    
    const users = await User.find(filter)
      .select("-password")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Approve user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isApproved: true,
        status: "approved",
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: null
      },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json({ 
      msg: "User approved successfully", 
      user 
    });
  } catch (error) {
    console.error("Approve user error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Reject user
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isApproved: false,
        status: "rejected",
        approvedBy: req.user.id,
        approvedAt: new Date(),
        rejectionReason: reason || "No reason provided"
      },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json({ 
      msg: "User rejected successfully", 
      user 
    });
  } catch (error) {
    console.error("Reject user error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id.toString()) {
      return res.status(400).json({ msg: "Cannot delete your own account" });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    res.json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const total = await User.countDocuments();
    
    res.json({
      total,
      byStatus: stats,
      byRole: roleStats
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ msg: error.message });
  }
};