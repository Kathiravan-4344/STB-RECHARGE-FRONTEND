const mongoose = require("mongoose");
const RechargeRequest = require("./RechargeRequest");

module.exports = mongoose.models.Recharge || RechargeRequest;
