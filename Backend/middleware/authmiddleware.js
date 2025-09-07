const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Your existing flexible middleware (enhanced)
const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token, access denied" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get full user data from database (needed for approval checks)
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ msg: "User not found" });
      }
      
      req.user = user;

      // Role-based access control
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ msg: "Forbidden: Access denied" });
      }

      next();
    } catch (error) {
      res.status(401).json({ msg: "Invalid token" });
    }
  };
};

// Admin-only middleware (uses your existing structure)
const adminAuth = authMiddleware(["admin"]);

// General authentication (no role restriction)
const auth = authMiddleware([]);

// Check if user is approved (for regular users only)
const checkApproval = (req, res, next) => {
  try {
    // Admins bypass approval check
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user is approved
    if (!req.user.isApproved || req.user.status !== "approved") {
      let message = "Your account is pending approval.";
      if (req.user.status === "rejected") {
        message = `Your account has been rejected. ${req.user.rejectionReason ? `Reason: ${req.user.rejectionReason}` : ''}`;
      }
      return res.status(403).json({ 
        msg: message,
        status: req.user.status 
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Combined middleware for routes that need both auth and approval
const authWithApproval = (roles = []) => {
  return [authMiddleware(roles), checkApproval];
};

module.exports = authMiddleware;  // Default export (backward compatibility)

// Named exports for new functionality
module.exports.authMiddleware = authMiddleware;
module.exports.auth = auth;
module.exports.adminAuth = adminAuth;
module.exports.checkApproval = checkApproval;
module.exports.authWithApproval = authWithApproval;