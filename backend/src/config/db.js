const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stb_recharge",
    );
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    // Non-fatal warning if invalid URI password placeholder is present
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.warn("Please replace <db_password> in backend/.env with your actual MongoDB Atlas password.");
    }
  }
};

module.exports = connectDB;
