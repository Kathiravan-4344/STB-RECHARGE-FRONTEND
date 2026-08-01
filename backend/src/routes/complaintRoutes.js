const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getUserComplaints,
  updateComplaintStatus,
} = require("../controllers/complaintController");

router.post("/create", createComplaint);
router.get("/user/:id", getUserComplaints);
router.post("/update/:id", updateComplaintStatus);

module.exports = router;
