const express = require("express");
const router = express.Router();
const Recharge = require("../models/Recharge");
const RechargeRequest = require("../models/RechargeRequest");
const {
  operatorLogin,
  approveRecharge,
  rejectRecharge,
} = require("../controllers/operatorController");

router.post("/login", operatorLogin);

router.get("/requests", async (req, res) => {
  try {
    const recharges = await Recharge.find().sort({ createdAt: -1 });
    const rechargeRequests = await RechargeRequest.find().sort({ createdAt: -1 });
    
    // Combine and deduplicate
    const uniqueMap = new Map();
    for (const item of [...recharges, ...rechargeRequests]) {
      const key = String(item._id || item.id);
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
    const data = Array.from(uniqueMap.values());
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/approve/:id", approveRecharge);
router.post("/reject/:id", rejectRecharge);

module.exports = router;

