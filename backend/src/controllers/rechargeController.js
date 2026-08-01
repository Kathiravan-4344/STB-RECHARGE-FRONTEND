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
    const { userId, stbId, planId, amount, paymentStatus } = req.body;

    // Strict Rule: Payment MUST be SUCCESS
    if (paymentStatus !== "Success") {
      return res.status(400).json({
        success: false,
        message: "Recharge request rejected: Payment status must be Success.",
      });
    }

    if (!stbId || stbId.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid STB ID provided for recharge request.",
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: "Selected plan not found" });
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne({ stbId: stbId.trim().toUpperCase() });
    }

    // Create recharge request
    const rechargeRequest = await RechargeRequest.create({
      userId: user ? user._id : req.user ? req.user._id : undefined,
      stbId: stbId.trim().toUpperCase(),
      planId: plan._id,
      amount: amount || plan.price,
      paymentStatus: "Success",
      status: "Pending", // Operator approval required
      requestTime: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Recharge request submitted successfully. Awaiting operator approval.",
      rechargeRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get real-time status of recharge request
// @route GET /api/recharge/status/:id
const getRechargeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RechargeRequest.findById(id)
      .populate("userId", "name mobileNumber stbId")
      .populate("planId", "name price validity");

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

module.exports = {
  getPlans,
  createRechargeRequest,
  getRechargeStatus,
};
