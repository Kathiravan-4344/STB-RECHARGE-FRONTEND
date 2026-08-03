const mongoose = require("mongoose");
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Unable to set custom DNS servers:", e.message);
}

const DEFAULT_ATLAS_URI =
  "mongodb+srv://kathir_stb_recharge:V.Kathiravan.4344@cluster0.eusikww.mongodb.net/stb_recharge?retryWrites=true&w=majority&appName=Cluster0";

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      family: 4,
    });
    isConnected = true;
    console.log(`[MongoDB] Successfully Connected to Atlas Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.warn("MongoDB Atlas Auth Failed. Please verify database credentials.");
    }
  }
};

module.exports = connectDB;
