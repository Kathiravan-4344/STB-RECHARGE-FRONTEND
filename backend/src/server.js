const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Models for initial seeding
const Admin = require("./models/Admin");
const Operator = require("./models/Operator");
const Plan = require("./models/Plan");
const Product = require("./models/Product");

// Route modules
const authRoutes = require("./routes/authRoutes");
const stbRoutes = require("./routes/stbRoutes");
const rechargeRoutes = require("./routes/rechargeRoutes");
const operatorRoutes = require("./routes/operatorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const productRoutes = require("./routes/productRoutes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Seed initial database defaults
const seedInitialData = async () => {
  try {
    // Seed Admin (9080864542)
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        mobileNumber: "9080864542",
        name: "Super Admin (Kathiravan V)",
      });
      console.log("[DB Seed] Default Admin (9080864542) created.");
    }

    // Seed Operators
    const opCount = await Operator.countDocuments();
    if (opCount === 0) {
      await Operator.create({
        mobileNumber: "9080864542",
        name: "Kathiravan V",
        isActive: true,
      });
      console.log("[DB Seed] Default Admin Operator (9080864542) created.");
    }
  } catch (err) {
    console.error("[DB Seed Error]", err.message);
  }
};

// Connect Database & Seed
connectDB().then(() => {
  seedInitialData();
});

// Root Health Check Route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    server: "STB RECHARGE API Server",
    time: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      stb: "/api/stb",
      plans: "/api/plans",
      recharge: "/api/recharge",
      operator: "/api/operator",
      admin: "/api/admin",
      complaint: "/api/complaint",
    },
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/stb", stbRoutes);
app.use("/api", rechargeRoutes);
app.use("/api/operator", operatorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaint", complaintRoutes);
app.use("/api", productRoutes);

// Global 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Start Express Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` 🚀 STB RECHARGE Backend running on port ${PORT}`);
    console.log(` 🔗 URL: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;
