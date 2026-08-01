const express = require("express");
const router = express.Router();
const {
  operatorLogin,
  getPendingRequests,
  approveRecharge,
  rejectRecharge,
} = require("../controllers/operatorController");
const { protectOperator } = require("../middleware/authMiddleware");

router.post("/login", operatorLogin);
router.get("/requests", protectOperator, getPendingRequests);
router.post("/approve/:id", protectOperator, approveRecharge);
router.post("/reject/:id", protectOperator, rejectRecharge);

module.exports = router;
