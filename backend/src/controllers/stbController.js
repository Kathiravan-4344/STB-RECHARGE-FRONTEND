const User = require("../models/User");

// @desc Validate STB ID
// @route POST /api/stb/validate
const validateStb = async (req, res) => {
  try {
    const { stbId } = req.body;
    if (!stbId || typeof stbId !== "string" || stbId.trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid STB ID format. STB ID must be at least 6 characters.",
      });
    }

    const cleanStbId = stbId.trim().toUpperCase();
    const existingUser = await User.findOne({ stbId: cleanStbId });

    return res.status(200).json({
      success: true,
      valid: true,
      stbId: cleanStbId,
      customerName: existingUser ? existingUser.name : "STB Subscriber",
      currentPlan: existingUser ? existingUser.currentPlan : null,
      expiryDate: existingUser ? existingUser.expiryDate : null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  validateStb,
};
