const mongoose = require("mongoose");

const operatorSchema = new mongoose.Schema(
  {
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      default: "Operator",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Operator", operatorSchema);
