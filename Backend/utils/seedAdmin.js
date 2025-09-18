const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      await User.create({
        name: "System Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isApproved: true,
        status: "approved"
      });
      
      console.log("✅ Default admin created");
      console.log(`📧 Email: ${adminEmail}`);
    }
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
};

module.exports = createDefaultAdmin;