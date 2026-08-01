const express = require("express");
const router = express.Router();
const {
  addOperator,
  toggleOperator,
  getCustomers,
  getRecharges,
  deleteRecharge,
  addProduct,
  updateProduct,
  deleteProduct,
  getComplaints,
  clearAllData,
} = require("../controllers/adminController");
const { protectAdmin } = require("../middleware/authMiddleware");

router.use(protectAdmin); // Protect all admin endpoints for 9080864542

router.post("/operator/add", addOperator);
router.post("/operator/toggle", toggleOperator);
router.get("/customers", getCustomers);
router.get("/recharges", getRecharges);
router.delete("/recharge/:id", deleteRecharge);

router.post("/product/add", addProduct);
router.put("/product/update/:id", updateProduct);
router.delete("/product/delete/:id", deleteProduct);

router.get("/complaints", getComplaints);
router.delete("/clear-all", clearAllData);

module.exports = router;
