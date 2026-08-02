const express = require("express");
const router = express.Router();
const {
  operatorLogin,
  getPendingRequests,
  approveRecharge,
  rejectRecharge,
} = require("../controllers/operatorController");

router.post("/login", operatorLogin);
router.get("/requests", getPendingRequests);
router.post("/approve/:id", approveRecharge);
router.post("/reject/:id", rejectRecharge);

module.exports = router;

