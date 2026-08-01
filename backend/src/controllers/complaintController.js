const Complaint = require("../models/Complaint");
const User = require("../models/User");

// @desc Create Complaint
// @route POST /api/complaint/create
const createComplaint = async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    if (!type || !message) {
      return res.status(400).json({ message: "Complaint type and message are required" });
    }

    let targetUserId = userId;
    if (!targetUserId && req.user) {
      targetUserId = req.user._id;
    }

    if (!targetUserId) {
      return res.status(400).json({ message: "Valid userId or auth token is required" });
    }

    const complaint = await Complaint.create({
      userId: targetUserId,
      type,
      message,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get User Complaints
// @route GET /api/complaint/user/:id
const getUserComplaints = async (req, res) => {
  try {
    const { id } = req.params;
    const complaints = await Complaint.find({ userId: id })
      .populate("assignedOperator", "name mobileNumber")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: complaints.length, complaints });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Operator Update Complaint Status
// @route POST /api/complaint/update/:id
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedOperatorId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (status) complaint.status = status;
    if (assignedOperatorId) complaint.assignedOperator = assignedOperatorId;
    await complaint.save();

    return res.status(200).json({
      success: true,
      message: "Complaint status updated",
      complaint,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  updateComplaintStatus,
};
