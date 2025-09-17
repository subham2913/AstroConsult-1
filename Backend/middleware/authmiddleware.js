const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware factory, supports optional role restriction
const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "No token, access denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ msg: "User not found" });
      }

      req.user = user;

      // Role-based authorization
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ msg: "Forbidden: Access denied" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ msg: "Invalid token" });
    }
  };
};

// Specific middlewares for common use-cases
const auth = authMiddleware(); // No role restrictions, just authenticated users
const adminAuth = authMiddleware(["admin"]); // Only admin users

// Check user approval status middleware (for non-admins)
const checkApproval = (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return next(); // Admin bypass approval
    }

    if (!req.user.isApproved || req.user.status !== "approved") {
      let message = "Your account is pending approval.";
      if (req.user.status === "rejected") {
        message = `Your account has been rejected. ${
          req.user.rejectionReason ? `Reason: ${req.user.rejectionReason}` : ""
        }`;
      }
      return res.status(403).json({ msg: message, status: req.user.status });
    }

    next();
  } catch (err) {
    return res.status(500).json({ msg: "Server error" });
  }
};

// Combined middleware for auth + approval checks with optional roles
const authWithApproval = (roles = []) => [authMiddleware(roles), checkApproval];

// Exports
module.exports = {
  authMiddleware,
  auth,
  adminAuth,
  checkApproval,
  authWithApproval,
};
