const mongoose = require("mongoose");
const dns = require("dns");

try {
  if (dns && typeof dns.setServers === "function") {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
} catch (e) {}

const DEFAULT_ATLAS_URI =
  "mongodb+srv://kathir_stb_recharge:V.Kathiravan.4344@cluster0.eusikww.mongodb.net/stb_recharge?retryWrites=true&w=majority&appName=Cluster0";

const DIRECT_ATLAS_FALLBACK_URI =
  "mongodb://kathir_stb_recharge:V.Kathiravan.4344@ac-n49efns-shard-00-00.eusikww.mongodb.net:27017,ac-n49efns-shard-00-01.eusikww.mongodb.net:27017,ac-n49efns-shard-00-02.eusikww.mongodb.net:27017/stb_recharge?ssl=true&replicaSet=atlas-13w1i2-shard-0&authSource=admin&retryWrites=true&w=majority";

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || DEFAULT_ATLAS_URI;
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log(`[MongoDB] Successfully Connected to Atlas Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB SRV Error] ${error.message}`);
    try {
      console.info("[MongoDB] Attempting connection via direct replicaSet connection string...");
      const conn2 = await mongoose.connect(DIRECT_ATLAS_FALLBACK_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      isConnected = true;
      console.log(`[MongoDB Direct] Successfully Connected to Atlas Host: ${conn2.connection.host}`);
    } catch (fallbackErr) {
      console.error(`[MongoDB Direct Error] ${fallbackErr.message}`);
      throw fallbackErr;
    }
  }
};

module.exports = connectDB;
