const mongoose = require("mongoose");
const dns = require("dns");

// Set Google Public DNS for Node.js SRV resolution on Windows only
if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (e) {
    console.warn("Unable to override DNS servers:", e.message);
  }
}

const DEFAULT_ATLAS_URI =
  "mongodb+srv://kathir_stb_recharge:V.Kathiravan.4344@cluster0.eusikww.mongodb.net/stb_recharge?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Successfully Connected to Atlas Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    if (error.message.includes("bad auth") || error.message.includes("Authentication failed")) {
      console.warn("MongoDB Atlas Auth Failed. Please verify your MongoDB Atlas database username and password.");
    }
  }
};


module.exports = connectDB;
