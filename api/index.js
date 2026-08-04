const mongoose = require("mongoose");

const DEFAULT_ATLAS_URI =
  "mongodb+srv://kathir_stb_recharge:V.Kathiravan.4344@cluster0.eusikww.mongodb.net/stb_recharge?retryWrites=true&w=majority&appName=Cluster0";

let isConnected = false;
async function connectDB() {
  if (isConnected || mongoose.connection.readyState === 1) return;
  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    isConnected = true;
  } catch (e) {
    console.error("[Vercel DB Error]", e);
  }
}

// Inline Mongoose Schemas for high-performance serverless execution
const userSchema = new mongoose.Schema(
  {
    mobileNumber: { type: String, required: true },
    name: { type: String, default: "Customer" },
    stbId: { type: String, default: "1234567890" },
    role: { type: String, default: "customer" },
  },
  { timestamps: true }
);

const rechargeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stbId: { type: String, required: true },
    customerName: { type: String, default: "Customer" },
    customerMobile: { type: String, default: "" },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, default: "Success" },
    status: { type: String, default: "Pending" },
    requestTime: { type: Date, default: Date.now },
    approvedTime: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const RechargeRequest =
  mongoose.models.RechargeRequest || mongoose.model("RechargeRequest", rechargeSchema);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();

    let url = req.url || "/";
    url = url.replace(/^\/api\/index(\.js)?/, "");
    if (!url.startsWith("/api")) url = "/api" + (url.startsWith("/") ? "" : "/") + url;

    // Parse Body
    let body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    // 1. GET /api/recharge/pending
    if (url.includes("/recharge/pending") && req.method === "GET") {
      const requests = await RechargeRequest.find().sort({ requestTime: -1 });
      return res.status(200).json({ success: true, count: requests.length, requests });
    }

    // 2. POST /api/recharge/create
    if (url.includes("/recharge/create") && req.method === "POST") {
      const { stbId, planName, amount, customerName, customerMobile } = body;
      const cleanStb = stbId || "1234567890";
      const mob = customerMobile || "9" + Date.now().toString().slice(-9);

      let user = await User.findOne({ mobileNumber: mob });
      if (!user) {
        user = await User.create({
          mobileNumber: mob,
          name: customerName || "Customer",
          stbId: cleanStb,
        });
      }

      const request = await RechargeRequest.create({
        userId: user._id,
        stbId: cleanStb,
        customerName: customerName || user.name || "Customer",
        customerMobile: mob,
        amount: amount || 240,
        paymentStatus: "Success",
        status: "Pending",
        requestTime: new Date(),
      });

      return res.status(201).json({ success: true, rechargeRequest: request });
    }

    // 3. Fallback to Express app for other routes
    try {
      const app = require("../backend/src/server.js");
      req.url = url;
      return app(req, res);
    } catch (expressErr) {
      return res.status(200).json({ success: true, status: "online", time: new Date().toISOString() });
    }
  } catch (err) {
    console.error("[Vercel Native Handler Error]", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Serverless Function Execution Error",
    });
  }
};

