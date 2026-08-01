const express = require("express");
const router = express.Router();
const { validateStb } = require("../controllers/stbController");

router.post("/validate", validateStb);

module.exports = router;
