const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (will be pending approval by default)
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || "user" 
    });

    res.status(201).json({ 
      msg: "Registration successful! Your account is pending admin approval.",
      userId: user._id,
      status: "pending"
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ msg: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check if user is approved (except for admins)
    if (user.role !== "admin" && (!user.isApproved || user.status !== "approved")) {
      let message = "Your account is pending approval.";
      if (user.status === "rejected") {
        message = `Your account has been rejected. ${user.rejectionReason ? `Reason: ${user.rejectionReason}` : ''}`;
      }
      return res.status(403).json({ 
        msg: message,
        status: user.status 
      });
    }

    // Generate token
    const token = jwt.sign({ 
      id: user._id, 
      role: user.role 
    }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        isApproved: user.isApproved,
        status: user.status
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ msg: error.message });
  }
};