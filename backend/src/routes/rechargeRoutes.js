const express = require("express");
const router = express.Router();
const {
  getPlans,
  createRechargeRequest,
  getRechargeStatus,
} = require("../controllers/rechargeController");

router.get("/plans", getPlans);
router.post("/recharge/create", createRechargeRequest);
router.get("/recharge/status/:id", getRechargeStatus);

module.exports = router;
