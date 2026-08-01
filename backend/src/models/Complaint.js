const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    assignedOperator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Operator",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
