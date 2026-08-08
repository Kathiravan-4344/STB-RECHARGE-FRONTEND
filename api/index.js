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
    userId: { type: mongoose.Schema.Types.Mixed, ref: "User" },
    stbId: { type: String, required: true },
    customerName: { type: String, default: "Customer" },
    customerMobile: { type: String, default: "" },
    operatorMobile: { type: String, default: "" },
    planId: { type: mongoose.Schema.Types.Mixed, ref: "Plan" },
    planName: { type: String, default: "" },
    amount: { type: Number, required: true },
    paymentStatus: { type: String, default: "Success" },
    status: { type: String, default: "Pending" },
    requestTime: { type: Date, default: Date.now },
    approvedTime: { type: Date, default: null },
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    stbId: { type: String, default: "STB-UNKNOWN" },
    customerName: { type: String, default: "Customer" },
    customerMobile: { type: String, default: "" },
    category: { type: String, required: true, default: "General Issues" },
    issueType: { type: String, default: "" },
    description: { type: String, required: true },
    mediaUrl: { type: String, default: "" },
    preferredTime: { type: String, default: "Anytime" },
    status: { type: String, enum: ["Pending", "Assigned", "In Progress", "Resolved"], default: "Pending" },
    technicianName: { type: String, default: "" },
    technicianMobile: { type: String, default: "" },
    assignedAt: { type: String, default: "" },
    expectedArrival: { type: String, default: "" },
    resolvedAt: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

const productRequestSchema = new mongoose.Schema(
  {
    stbId: { type: String, default: "STB-UNKNOWN" },
    customerName: { type: String, default: "Customer" },
    customerMobile: { type: String, default: "" },
    productId: { type: String, default: "" },
    productName: { type: String, default: "Accessory / Service" },
    category: { type: String, default: "accessory" },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    status: { type: String, default: "Pending" },
    technicianName: { type: String, default: "" },
    technicianMobile: { type: String, default: "" },
    scheduledDate: { type: String, default: "" },
    operatorNote: { type: String, default: "" },
  },
  { timestamps: true }
);

const operatorSchema = new mongoose.Schema(
  {
    mobileNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const StbMapping = mongoose.models.StbMapping || mongoose.model("StbMapping", stbMappingSchema);
const RechargeRequest = mongoose.models.RechargeRequest || mongoose.model("RechargeRequest", rechargeSchema);
const Recharge = mongoose.models.Recharge || mongoose.model("Recharge", rechargeSchema);
const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
const ProductRequest = mongoose.models.ProductRequest || mongoose.model("ProductRequest", productRequestSchema);
const Operator = mongoose.models.Operator || mongoose.model("Operator", operatorSchema);

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-operator-mobile");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    await connectDB();

    let url = req.url || "/";
    url = url.replace(/^\/api\/index(\.js)?/, "");
    if (!url.startsWith("/api")) url = "/api" + (url.startsWith("/") ? "" : "/") + url;

    let body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch (e) {}
    }

    // Auth: Profile
    if (url.includes("/auth/profile/") && req.method === "GET") {
      const mob = String(url.split("/").pop()).trim();
      const user = await User.findOne({ mobileNumber: mob });
      const recharges = await RechargeRequest.find({ customerMobile: mob }).sort({ createdAt: -1 });
      const productRequests = await ProductRequest.find({ customerMobile: mob }).sort({ createdAt: -1 });
      const complaints = await Complaint.find({ customerMobile: mob }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        user,
        recharges,
        productRequests,
        complaints,
      });
    }

    // STB Validation Endpoint: POST /api/stb/validate
    if (url.includes("/stb/validate") && req.method === "POST") {
      const { stbId } = body;
      if (!stbId || String(stbId).trim().length < 3) {
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
      const { stbId, operatorMobile, operatorName, customerName, customerMobile, currentPlan, expiryDate } = body;
      if (!stbId || !operatorMobile) {
        return res.status(400).json({ success: false, message: "STB ID and Operator Mobile are required" });
      }
      const cleanStb = String(stbId).trim().toUpperCase();
      const cleanOpMobile = String(operatorMobile).trim();
      let mapping = await StbMapping.findOne({ stbId: cleanStb });
      if (mapping) {
        mapping.operatorMobile = cleanOpMobile;
        if (operatorName) mapping.operatorName = operatorName.trim();
        if (customerName) mapping.customerName = customerName.trim();
        if (customerMobile) mapping.customerMobile = customerMobile.trim();
        if (currentPlan) mapping.currentPlan = currentPlan.trim();
        if (expiryDate) mapping.expiryDate = new Date(expiryDate);
        await mapping.save();
      } else {
        mapping = await StbMapping.create({
          stbId: cleanStb,
          operatorMobile: cleanOpMobile,
          operatorName: operatorName ? operatorName.trim() : "Operator",
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
      const opMobile = String(url.split("/").pop()).trim();
      let mappings = [];
      if (opMobile === "9080864542" || !opMobile) {
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
      const opMobile = String(searchParams.get("operatorMobile") || req.headers["x-operator-mobile"] || "").trim();

      let filter = {};
      if (opMobile && opMobile !== "9080864542") {
        const mappedStbs = await StbMapping.find({ operatorMobile: opMobile }).distinct("stbId");
        const mappedRegex = mappedStbs.map((s) => new RegExp("^" + s + "$", "i"));
        filter = {
          $or: [
            { operatorMobile: opMobile },
            { stbId: { $in: mappedRegex } },
            { stbId: { $in: mappedStbs } },
          ],
        };
      }

      const requests1 = await RechargeRequest.find(filter).sort({ requestTime: -1, createdAt: -1 });
      const requests2 = await Recharge.find(filter).sort({ requestTime: -1, createdAt: -1 });

      const combined = [...requests1, ...requests2];
      const uniqueMap = new Map();
      const resultList = [];
      for (const item of combined) {
        const idKey = String(item._id || item.id);
        if (idKey && !uniqueMap.has(idKey)) {
          uniqueMap.set(idKey, true);
          resultList.push(item);
        }
      }

      return res.status(200).json({ success: true, count: resultList.length, requests: resultList });
    }

    // 2. POST /api/recharge/create
    if (url.includes("/recharge/create") && req.method === "POST") {
      const { stbId, planName, amount, customerName, customerMobile, operatorMobile } = body;
      const cleanStb = (stbId || "1234567890").trim().toUpperCase();
      const mob = customerMobile ? String(customerMobile).trim() : "9" + Date.now().toString().slice(-9);

      let opMob = operatorMobile ? String(operatorMobile).trim() : "";
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

      const newReqData = {
        userId: user._id,
        stbId: cleanStb,
        customerName: customerName || user.name || "Customer",
        customerMobile: mob,
        operatorMobile: opMob,
        planName: planName || "Basic Tamil Pack Monthly Rs 220",
        amount: Number(amount) || 240,
        paymentStatus: "Success",
        status: "Pending",
        requestTime: new Date(),
      };

      const request = await RechargeRequest.create(newReqData);
      await Recharge.create(newReqData).catch(() => {});

      return res.status(201).json({ success: true, rechargeRequest: request });
    }

    // Approve Recharge
    if ((url.includes("/approve") || url.includes("/operator/approve")) && req.method === "POST") {
      const reqId = body.id || url.split("/").pop();
      if (reqId && reqId.match(/^[0-9a-fA-F]{24}$/)) {
        await RechargeRequest.findByIdAndUpdate(reqId, { status: "Approved", approvedTime: new Date() });
        await Recharge.findByIdAndUpdate(reqId, { status: "Approved", approvedTime: new Date() }).catch(() => {});
      }
      return res.status(200).json({ success: true, message: "Recharge approved" });
    }

    // Reject Recharge
    if ((url.includes("/reject") || url.includes("/operator/reject")) && req.method === "POST") {
      const reqId = body.id || url.split("/").pop();
      if (reqId && reqId.match(/^[0-9a-fA-F]{24}$/)) {
        await RechargeRequest.findByIdAndUpdate(reqId, { status: "Rejected" });
        await Recharge.findByIdAndUpdate(reqId, { status: "Rejected" }).catch(() => {});
      }
      return res.status(200).json({ success: true, message: "Recharge rejected" });
    }

    // Complaints: Create
    if (url.includes("/complaint/create") && req.method === "POST") {
      const {
        stbId,
        customerName,
        customerMobile,
        category,
        issueType,
        description,
        mediaUrl,
        preferredTime,
      } = body;

      if (!description) {
        return res.status(400).json({ success: false, message: "Description is required" });
      }

      const complaint = await Complaint.create({
        stbId: stbId || "STB-UNKNOWN",
        customerName: customerName || "Customer",
        customerMobile: customerMobile || "",
        category: category || "General Issues",
        issueType: issueType || "",
        description,
        mediaUrl: mediaUrl || "",
        preferredTime: preferredTime || "Anytime",
        status: "Pending",
      });

      return res.status(201).json({ success: true, message: "Complaint registered successfully", complaint });
    }

    // Complaints: Get All
    if (url.includes("/complaint/all") && req.method === "GET") {
      const searchParams = new URLSearchParams(url.includes("?") ? url.split("?")[1] : "");
      const opMobile = String(searchParams.get("operatorMobile") || req.headers["x-operator-mobile"] || "").trim();

      let complaints = [];
      if (opMobile && opMobile !== "9080864542") {
        const mappedStbs = await StbMapping.find({ operatorMobile: opMobile }).distinct("stbId");
        const mappedRegex = mappedStbs.map((s) => new RegExp("^" + s + "$", "i"));
        complaints = await Complaint.find({
          $or: [
            { stbId: { $in: mappedRegex } },
            { stbId: { $in: mappedStbs } },
            { customerMobile: opMobile },
          ],
        }).sort({ createdAt: -1 });

        if (complaints.length === 0) {
          complaints = await Complaint.find().sort({ createdAt: -1 });
        }
      } else {
        complaints = await Complaint.find().sort({ createdAt: -1 });
      }
      return res.status(200).json({ success: true, count: complaints.length, complaints });
    }

    // Complaints: Update Status / Assignment
    if (url.includes("/complaint/update/") && req.method === "POST") {
      const compId = url.split("/").pop();
      if (compId && compId.match(/^[0-9a-fA-F]{24}$/)) {
        const updated = await Complaint.findByIdAndUpdate(compId, body, { new: true });
        return res.status(200).json({ success: true, complaint: updated });
      }
      return res.status(400).json({ success: false, message: "Invalid complaint ID" });
    }

    // Product Requests: Create
    if (url.includes("/product-request/create") && req.method === "POST") {
      const productReq = await ProductRequest.create(body);
      return res.status(201).json({ success: true, productRequest: productReq });
    }

    // Product Requests: Get All
    if (url.includes("/product-request/all") && req.method === "GET") {
      const requests = await ProductRequest.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: requests.length, requests });
    }

    // Product Requests: Update Status
    if (url.includes("/product-request/update/") && req.method === "POST") {
      const prId = url.split("/").pop();
      if (prId && prId.match(/^[0-9a-fA-F]{24}$/)) {
        const updated = await ProductRequest.findByIdAndUpdate(prId, body, { new: true });
        return res.status(200).json({ success: true, productRequest: updated });
      }
      return res.status(400).json({ success: false, message: "Invalid product request ID" });
    }

    // Admin: Operators list
    if (url.includes("/admin/operators") && req.method === "GET") {
      const operators = await Operator.find().sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: operators.length, operators });
    }

    // Admin: Add Operator
    if (url.includes("/admin/operator/add") && req.method === "POST") {
      const { mobileNumber, name } = body;
      const op = await Operator.create({
        mobileNumber: String(mobileNumber).trim(),
        name: name ? String(name).trim() : "Operator",
      });
      return res.status(201).json({ success: true, operator: op });
    }

    // Admin: Toggle Operator Status
    if (url.includes("/admin/operator/toggle") && req.method === "POST") {
      const { mobileNumber } = body;
      const op = await Operator.findOne({ mobileNumber: String(mobileNumber).trim() });
      if (op) {
        op.isActive = !op.isActive;
        await op.save();
      }
      return res.status(200).json({ success: true, operator: op });
    }

    // Default Fallback
    return res.status(200).json({ success: true, status: "online", time: new Date().toISOString() });
  } catch (err) {
    console.error("[Vercel Native Handler Error]", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Serverless Function Execution Error",
    });
  }
};
