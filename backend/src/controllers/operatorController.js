const jwt = require("jsonwebtoken");
const Operator = require("../models/Operator");
const RechargeRequest = require("../models/RechargeRequest");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "stb_recharge_jwt_super_secret_key_2026";

// @desc Operator Login
// @route POST /api/operator/login
const operatorLogin = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber) {
      return res.status(400).json({ message: "Operator mobile number is required" });
    }

    const cleanMobile = mobileNumber.trim();
    const operator = await Operator.findOne({
      mobileNumber: cleanMobile,
      isActive: true,
    });

    if (!operator) {
      return res.status(403).json({
        success: false,
        message: "Not Authorized: Operator mobile number not registered or inactive",
      });
    }

    const token = jwt.sign(
      { id: operator._id, mobileNumber: operator.mobileNumber, role: "operator" },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      success: true,
      message: "Operator authentication successful",
      token,
      operator,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get Pending Requests (paymentStatus = Success AND status = Pending)
// @route GET /api/operator/requests
const getPendingRequests = async (req, res) => {
  try {
    console.log("[Backend Operator API] Fetching requests with paymentStatus = 'Success' AND status = 'Pending'...");
    const requests = await RechargeRequest.find({
      paymentStatus: "Success",
      status: "Pending",
    })
      .populate("userId", "name mobileNumber stbId")
      .populate("planId", "name price validity category")
      .sort({ createdAt: -1, requestTime: -1 });

    console.log(`[Backend Operator API] Found ${requests.length} matching pending recharge requests.`);
    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("[Backend Operator API Error]", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Approve Recharge Request
// @route POST /api/operator/approve/:id
const approveRecharge = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RechargeRequest.findById(id).populate("planId");

    if (!request) {
      return res.status(404).json({ success: false, message: "Recharge request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    request.status = "Approved";
    request.approvedTime = new Date();
    await request.save();

    // Update user's STB current plan and expiry date
    if (request.userId) {
      const user = await User.findById(request.userId);
      if (user) {
        user.currentPlan = request.planId ? request.planId.name : "Recharge Pack";
        const validityDays = request.planId ? request.planId.validity : 30;
        const currentExpiry = user.expiryDate && user.expiryDate > new Date() ? new Date(user.expiryDate) : new Date();
        user.expiryDate = new Date(currentExpiry.getTime() + validityDays * 24 * 60 * 60 * 1000);
        user.status = "Active";
        await user.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Recharge request approved successfully",
      request,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Reject Recharge Request
// @route POST /api/operator/reject/:id
const rejectRecharge = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await RechargeRequest.findById(id);

    if (!request) {
      return res.status(404).json({ success: false, message: "Recharge request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Request is already ${request.status}`,
      });
    }

    request.status = "Rejected";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Recharge request rejected",
      request,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  operatorLogin,
  getPendingRequests,
  approveRecharge,
  rejectRecharge,
};
