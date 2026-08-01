const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    otp: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    stbId: {
      type: String,
      default: null,
      trim: true,
    },
    name: {
      type: String,
      default: "Customer",
      trim: true,
    },
    currentPlan: {
      type: String,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
