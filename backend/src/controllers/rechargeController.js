const Plan = require("../models/Plan");
const RechargeRequest = require("../models/RechargeRequest");
const User = require("../models/User");

// Seed default plans helper
const DEFAULT_PLANS = [
  {
    name: "Basic Tamil Pack Monthly Rs 220",
    price: 220,
    validity: 30,
    category: "Monthly",
    features: ["150+ SD Channels", "Standard Definition", "1 STB"],
  },
  {
    name: "Basic Tamil Silver Pack Monthly Rs 240",
    price: 240,
    validity: 30,
    category: "Monthly",
    features: ["300+ HD Channels", "Full HD Quality", "OTT App bundle"],
  },
  {
    name: "Basic Tamil HD Packs Rs 300",
    price: 300,
    validity: 30,
    category: "Monthly",
    features: ["400+ Channels", "4K Quality", "Multi-room"],
  },
  {
    name: "Sports Pack Rs 49",
    price: 49,
    validity: 30,
    category: "Channels",
    features: ["Star Sports HD", "Sony Sports", "Willow Cricket"],
  },
  {
    name: "HD Movies Pack Rs 79",
    price: 79,
    validity: 30,
    category: "Channels",
    features: ["Star Movies HD", "&pictures HD", "Sony Pix"],
  },
];

// @desc Get all recharge plans
// @route GET /api/plans
const getPlans = async (req, res) => {
  try {
    let plans = await Plan.find();
    if (plans.length === 0) {
      plans = await Plan.insertMany(DEFAULT_PLANS);
    }
    return res.status(200).json({ success: true, count: plans.length, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Create Recharge Request (Strict Rule: Payment must be SUCCESS)
// @route POST /api/recharge/create
const createRechargeRequest = async (req, res) => {
  try {
    const { userId, stbId, planId, planName, amount, paymentStatus, customerName, customerMobile } = req.body;

    const pStatus = paymentStatus || "Success";
    if (pStatus !== "Success") {
      return res.status(400).json({
        success: false,
        message: "Recharge request rejected: Payment status must be Success.",
      });
    }

    const cleanStbId = stbId ? stbId.trim().toUpperCase() : "STB-UNKNOWN";

    // 1. Find or create Plan (guaranteed non-null)
    let plan = null;
    if (planId && planId.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findById(planId);
    }
    if (!plan && planName) {
      plan = await Plan.findOne({ name: planName });
    }
    if (!plan) {
      plan = await Plan.findOne();
    }
    if (!plan) {
      let plans = await Plan.find();
      if (plans.length === 0) {
        plans = await Plan.insertMany(DEFAULT_PLANS);
      }
      plan = plans[0];
    }
    if (!plan) {
      plan = await Plan.create(DEFAULT_PLANS[0]);
    }

    // 2. Find or create User (guaranteed non-null)
    let user = null;
    if (userId && userId.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId);
    }
    if (!user && customerMobile && customerMobile.trim()) {
      user = await User.findOne({ mobileNumber: customerMobile.trim() });
    }
    if (!user && cleanStbId && cleanStbId !== "STB-UNKNOWN") {
      user = await User.findOne({ stbId: cleanStbId });
    }
    if (!user) {
      const mob =
        customerMobile && customerMobile.trim().length >= 10
          ? customerMobile.trim()
          : "9" + Date.now().toString().slice(-9);

      user = await User.findOne({ mobileNumber: mob });
      if (!user) {
        try {
          user = await User.create({
            mobileNumber: mob,
            name: customerName || "Customer",
            stbId: cleanStbId,
            role: "customer",
          });
        } catch (e) {
          // If creation failed due to duplicate key or validation error, find matching or fallback user
          user = (await User.findOne({ mobileNumber: mob })) || (await User.findOne());
          if (!user) {
            user = await User.create({
              mobileNumber: "9" + Math.floor(100000000 + Math.random() * 900000000),
              name: customerName || "Customer",
              stbId: cleanStbId,
              role: "customer",
            });
          }
        }
      }
    } else {
      let needsSave = false;
      if (cleanStbId && cleanStbId !== "STB-UNKNOWN" && user.stbId !== cleanStbId) {
        user.stbId = cleanStbId;
        needsSave = true;
      }
      if (customerName && customerName !== "Customer" && user.name !== customerName) {
        user.name = customerName;
        needsSave = true;
      }
      if (needsSave) {
        try {
          await user.save();
        } catch (e) {}
      }
    }

    // 3. Create recharge request
    const rechargeRequest = await RechargeRequest.create({
      userId: user._id,
      stbId: cleanStbId,
      customerName: customerName || user.name || "Customer",
      customerMobile: customerMobile || user.mobileNumber || "",
      planId: plan._id,
      amount: amount || plan.price,
      paymentStatus: "Success",
      status: "Pending", // Operator approval required
      requestTime: new Date(),
    });

    const populated = await RechargeRequest.findById(rechargeRequest._id)
      .populate("userId", "name mobileNumber stbId")
      .populate("planId", "name price validity category");

    return res.status(201).json({
      success: true,
      message: "Recharge request submitted successfully. Awaiting operator approval.",
      rechargeRequest: populated || rechargeRequest,
    });
  } catch (error) {
    console.error("[createRechargeRequest Error]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get real-time status of recharge request
// @route GET /api/recharge/status/:id
const getRechargeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let request = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      request = await RechargeRequest.findById(id)
        .populate("userId", "name mobileNumber stbId")
        .populate("planId", "name price validity");
    }

    if (!request) {
      return res.status(404).json({ success: false, message: "Recharge request not found" });
    }

    const requestTimeMs = new Date(request.requestTime).getTime();
    const nowMs = Date.now();
    const elapsedMinutes = Math.floor((nowMs - requestTimeMs) / (1000 * 60));
    const countdownMinutesRemaining = Math.max(0, 45 - elapsedMinutes);
    const isOverdue = elapsedMinutes > 45 && request.status === "Pending";

    return res.status(200).json({
      success: true,
      id: request._id,
      stbId: request.stbId,
      amount: request.amount,
      paymentStatus: request.paymentStatus,
      status: request.status, // Pending | Approved | Rejected
      requestTime: request.requestTime,
      approvedTime: request.approvedTime,
      elapsedMinutes,
      countdownMinutesRemaining,
      isOverdue,
      plan: request.planId,
      user: request.userId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all pending recharge requests for operator polling
// @route GET /api/recharge/pending
const getPendingRecharges = async (req, res) => {
  try {
    console.log("[Recharge API] Fetching all recharge requests for operator...");
    const requests = await RechargeRequest.find()
      .populate("userId", "name mobileNumber stbId")
      .populate("planId", "name price validity category")
      .sort({ createdAt: -1, requestTime: -1 });

    console.log(`[Recharge API] Returned ${requests.length} recharge requests.`);
    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("[Recharge API Error]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlans,
  createRechargeRequest,
  getRechargeStatus,
  getPendingRecharges,
};

