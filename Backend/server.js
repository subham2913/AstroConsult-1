const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const clientRoutes = require("./routes/clientRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const subcategoryRoutes = require("./routes/subcategoryRoutes");
const consultationRoutes = require("./routes/consultationRoutes");
const consultationHistoryRoutes = require('./routes/consultationHistory');
const createDefaultAdmin = require('./utils/seedAdmin');

// Load environment variables
dotenv.config();

const app = express();

// ✅ Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/consultations", consultationRoutes);
app.use('/api/consultation-history', consultationHistoryRoutes);

// Start server function
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    console.log("✅ Database connected successfully");
    
    // Create default admin after database connection
    await createDefaultAdmin();
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Frontend URL: http://localhost:5173`);
      console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    });
    
  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    process.exit(1); // Exit if critical error
  }
};

// Start the application
startServer();