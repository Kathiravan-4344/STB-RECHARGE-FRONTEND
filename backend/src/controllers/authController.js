const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "stb_recharge_jwt_super_secret_key_2026";

// Generate JWT Helper
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

// @desc Send OTP to user mobile
// @route POST /api/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    if (!mobileNumber || mobileNumber.trim().length < 10) {
      return res.status(400).json({ message: "Valid 10-digit mobile number is required" });
    }

    const cleanMobile = mobileNumber.trim();
    // Default fixed 4-digit OTP 1234
    const otp = "1234";

    let user = await User.findOne({ mobileNumber: cleanMobile });
    if (!user) {
      user = new User({ mobileNumber: cleanMobile, otp });
    } else {
      user.otp = otp;
    }
    await user.save();

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${cleanMobile}`,
      otp, // Included for development/testing ease
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc Verify OTP & Register/Login User
// @route POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { mobileNumber, otp, name, stbId } = req.body;
    if (!mobileNumber || !otp) {
      return res.status(400).json({ message: "Mobile number and OTP are required" });
    }

    const cleanMobile = mobileNumber.trim();
    const user = await User.findOne({ mobileNumber: cleanMobile });

    if (!user || user.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    if (name) user.name = name.trim();
    if (stbId) user.stbId = stbId.trim();
    await user.save();

    const token = generateToken({
      id: user._id,
      mobileNumber: user.mobileNumber,
      role: user.mobileNumber === "9080864542" ? "admin" : "customer",
    });

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        mobileNumber: user.mobileNumber,
        name: user.name,
        stbId: user.stbId,
        currentPlan: user.currentPlan,
        expiryDate: user.expiryDate,
        status: user.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};
