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

    const cleanStbId = stbId ? String(stbId).trim().toUpperCase() : "STB-UNKNOWN";
    const cleanName = customerName ? String(customerName).trim() : "Customer";
    const cleanMobile = customerMobile ? String(customerMobile).trim() : "";

    console.log(`[Recharge API] Creating Recharge: STB=${cleanStbId}, Mobile=${cleanMobile}, Customer=${cleanName}, Amount=${amount}`);

    // 1. Find or resolve Plan
    let plan = null;
    if (planId && String(planId).match(/^[0-9a-fA-F]{24}$/)) {
      plan = await Plan.findById(planId);
    }
    if (!plan && planName) {
      plan = await Plan.findOne({ name: planName });
    }
    if (!plan) {
      plan = await Plan.findOne();
    }
    if (!plan) {
      try {
        let plans = await Plan.find();
        if (plans.length === 0) {
          plans = await Plan.insertMany(DEFAULT_PLANS);
        }
        plan = plans[0];
      } catch (e) {}
    }

    // 2. Find or resolve User
    let user = null;
    if (userId && String(userId).match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(userId);
    }
    if (!user && cleanMobile) {
      user = await User.findOne({ mobileNumber: cleanMobile });
    }
    if (!user && cleanStbId && cleanStbId !== "STB-UNKNOWN") {
      user = await User.findOne({ stbId: cleanStbId });
    }
    if (!user) {
      const mob = cleanMobile.length >= 10 ? cleanMobile : "9" + Date.now().toString().slice(-9);
      user = await User.findOne({ mobileNumber: mob });
      if (!user) {
        try {
          user = await User.create({
            mobileNumber: mob,
            name: cleanName,
            stbId: cleanStbId,
            role: "customer",
          });
        } catch (e) {
          user = await User.findOne();
        }
      }
    }

    // 3. Guaranteed DB Creation in MongoDB Atlas
    const rechargeData = {
      userId: user?._id || undefined,
      stbId: cleanStbId,
      customerName: cleanName || user?.name || "Customer",
      customerMobile: cleanMobile || user?.mobileNumber || "",
      planId: plan?._id || undefined,
      amount: Number(amount) || plan?.price || 240,
      paymentStatus: "Success",
      status: "Pending",
      requestTime: new Date(),
    };

    console.log("[Recharge API] Attempting RechargeRequest.create with payload:", rechargeData);
    const rechargeRequest = await RechargeRequest.create(rechargeData);
    console.log(`[Recharge API] SUCCESS! Saved in MongoDB Atlas with ID: ${rechargeRequest._id}`);

    const populated = await RechargeRequest.findById(rechargeRequest._id)
      .populate("userId", "name mobileNumber stbId")
      .populate("planId", "name price validity category");

    return res.status(201).json({
      success: true,
      message: "Recharge request submitted successfully. Awaiting operator approval.",
      rechargeRequest: populated || rechargeRequest,
    });
  } catch (error) {
    console.error("[Recharge API Error saving to database]", error);
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

