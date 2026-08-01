const mongoose = require("mongoose");
const dns = require("dns");

// Set Google Public DNS for Node.js SRV resolution on Windows
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Unable to override DNS servers:", e.message);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stb_recharge",
    );
    console.log(`[MongoDB] Successfully Connected to Atlas Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.warn("MongoDB Atlas Auth Failed. Please verify your MongoDB Atlas database username and password.");
    }
  }
};

module.exports = connectDB;
