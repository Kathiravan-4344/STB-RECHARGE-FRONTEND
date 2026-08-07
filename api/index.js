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
    console.error("[Vercel DB Connection Error]", e.message);
  }
}

// Inline Mongoose Schemas for standalone Vercel Serverless execution
const userSchema = new mongoose.Schema(
  {
    mobileNumber: { type: String, required: true },
    name: { type: String, default: "Customer" },
    stbId: { type: String, default: "1234567890" },
    role: { type: String, default: "customer" },
  },
  { timestamps: true }
);

const stbMappingSchema = new mongoose.Schema(
  {
    stbId: { type: String, required: true, uppercase: true, trim: true },
    operatorMobile: { type: String, required: true, trim: true },
    operatorName: { type: String, default: "Operator" },
    customerName: { type: String, default: "Customer" },
    customerMobile: { type: String, default: "" },
    currentPlan: { type: String, default: "Basic Tamil Pack Monthly Rs 220" },
    expiryDate: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    isApproved: { type: Boolean, default: true },
    status: { type: String, default: "Approved" },
  },
  { timestamps: true }
);

const rechargeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stbId: { type: String, required: true },
    customerName: { type: String, default: "Customer" },
    customerMobile: { type: String, default: "" },
    operatorMobile: { type: String, default: "" },
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
const StbMapping = mongoose.models.StbMapping || mongoose.model("StbMapping", stbMappingSchema);
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

    // STB Validation Endpoint: POST /api/stb/validate
    if (url.includes("/stb/validate") && req.method === "POST") {
      const { stbId } = body;
      if (!stbId || String(stbId).trim().length < 4) {
        return res.status(400).json({ success: false, valid: false, message: "Invalid STB ID" });
      }
      const cleanStb = String(stbId).trim().toUpperCase();
      const mapping = await StbMapping.findOne({ stbId: cleanStb });
      if (mapping) {
        if (!mapping.isApproved || mapping.status === "Blocked") {
          return res.status(403).json({ success: false, valid: false, message: "STB ID is blocked or inactive" });
        }
        return res.status(200).json({
          success: true,
          valid: true,
          stbId: cleanStb,
          customerName: mapping.customerName,
          customerMobile: mapping.customerMobile,
          operatorMobile: mapping.operatorMobile,
          currentPlan: mapping.currentPlan,
          expiryDate: mapping.expiryDate,
        });
      }
      const existingUser = await User.findOne({ stbId: cleanStb });
      if (existingUser) {
        return res.status(200).json({
          success: true,
          valid: true,
          stbId: cleanStb,
          customerName: existingUser.name,
          currentPlan: existingUser.currentPlan,
          expiryDate: existingUser.expiryDate,
        });
      }
      return res.status(404).json({
        success: false,
        valid: false,
        message: "STB ID is not registered with any operator. Please contact your local operator.",
      });
    }

    // Map STB Endpoint: POST /api/stb/map
    if (url.includes("/stb/map") && req.method === "POST") {
      const { stbId, operatorMobile, customerName, customerMobile, currentPlan, expiryDate } = body;
      if (!stbId || !operatorMobile) {
        return res.status(400).json({ success: false, message: "STB ID and Operator Mobile are required" });
      }
      const cleanStb = String(stbId).trim().toUpperCase();
      const cleanOpMobile = String(operatorMobile).trim();
      let mapping = await StbMapping.findOne({ stbId: cleanStb });
      if (mapping) {
        mapping.operatorMobile = cleanOpMobile;
        if (customerName) mapping.customerName = customerName.trim();
        if (customerMobile) mapping.customerMobile = customerMobile.trim();
        if (currentPlan) mapping.currentPlan = currentPlan.trim();
        if (expiryDate) mapping.expiryDate = new Date(expiryDate);
        await mapping.save();
      } else {
        mapping = await StbMapping.create({
          stbId: cleanStb,
          operatorMobile: cleanOpMobile,
          customerName: customerName ? customerName.trim() : "Customer",
          customerMobile: customerMobile ? customerMobile.trim() : "",
          currentPlan: currentPlan ? currentPlan.trim() : "Basic Tamil Pack Monthly Rs 220",
          expiryDate: expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isApproved: true,
          status: "Approved",
        });
      }
      return res.status(200).json({ success: true, mapping });
    }

    // Get STBs by Operator: GET /api/stb/operator/:mobile
    if (url.includes("/stb/operator/") && req.method === "GET") {
      const opMobile = url.split("/").pop();
      let mappings = [];
      if (opMobile === "9080864542") {
        mappings = await StbMapping.find().sort({ createdAt: -1 });
      } else {
        mappings = await StbMapping.find({ operatorMobile: opMobile }).sort({ createdAt: -1 });
      }
      return res.status(200).json({ success: true, mappings });
    }

    // Delete STB Mapping: DELETE /api/stb/map/:id
    if (url.includes("/stb/map/") && req.method === "DELETE") {
      const mapId = url.split("/").pop();
      if (mapId && mapId.match(/^[0-9a-fA-F]{24}$/)) {
        await StbMapping.findByIdAndDelete(mapId);
      }
      return res.status(200).json({ success: true, message: "Deleted" });
    }

    // 1. GET /api/recharge/pending or /api/operator/requests
    if ((url.includes("/recharge/pending") || url.includes("/operator/requests")) && req.method === "GET") {
      const searchParams = new URLSearchParams(url.includes("?") ? url.split("?")[1] : "");
      const opMobile = searchParams.get("operatorMobile") || "";
      let filter = {};
      if (opMobile && opMobile !== "9080864542") {
        const mappedStbs = await StbMapping.find({ operatorMobile: opMobile }).distinct("stbId");
        filter = { $or: [{ operatorMobile: opMobile }, { stbId: { $in: mappedStbs } }] };
      }
      const requests = await RechargeRequest.find(filter).sort({ requestTime: -1 });
      return res.status(200).json({ success: true, count: requests.length, requests });
    }

    // 2. POST /api/recharge/create
    if (url.includes("/recharge/create") && req.method === "POST") {
      const { stbId, planName, amount, customerName, customerMobile, operatorMobile } = body;
      const cleanStb = (stbId || "1234567890").trim().toUpperCase();
      const mob = customerMobile || "9" + Date.now().toString().slice(-9);

      let opMob = operatorMobile || "";
      if (!opMob) {
        const mapping = await StbMapping.findOne({ stbId: cleanStb });
        if (mapping) opMob = mapping.operatorMobile;
      }

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
        operatorMobile: opMob,
        amount: amount || 240,
        paymentStatus: "Success",
        status: "Pending",
        requestTime: new Date(),
      });

      return res.status(201).json({ success: true, rechargeRequest: request });
    }

    // 3. Approve Recharge
    if (url.includes("/approve") && req.method === "POST") {
      const { id } = body;
      const reqId = id || url.split("/").pop();
      if (reqId && reqId.match(/^[0-9a-fA-F]{24}$/)) {
        await RechargeRequest.findByIdAndUpdate(reqId, { status: "Approved", approvedTime: new Date() });
      }
      return res.status(200).json({ success: true, message: "Recharge approved" });
    }

    return res.status(200).json({ success: true, status: "online", time: new Date().toISOString() });
  } catch (err) {
    console.error("[Vercel Native Handler Error]", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Serverless Function Execution Error",
    });
  }
};
