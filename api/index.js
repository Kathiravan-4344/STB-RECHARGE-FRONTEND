const path = require("path");

let app;
let connectDB;

try {
  app = require("../backend/src/server.js");
} catch (e1) {
  try {
    app = require(path.join(process.cwd(), "backend/src/server.js"));
  } catch (e2) {
    console.error("Failed to require server.js:", e2);
  }
}

try {
  connectDB = require("../backend/src/config/db.js");
} catch (e1) {
  try {
    connectDB = require(path.join(process.cwd(), "backend/src/config/db.js"));
  } catch (e2) {
    console.error("Failed to require db.js:", e2);
  }
}

module.exports = async (req, res) => {
  // Enable CORS for Vercel Serverless execution
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (connectDB) {
      await connectDB();
    }

    // Clean and normalize req.url for Express app routes
    let url = req.url || "/";
    url = url.replace(/^\/api\/index(\.js)?/, "");
    if (!url.startsWith("/api")) {
      url = "/api" + (url.startsWith("/") ? "" : "/") + url;
    }
    req.url = url;

    // Pre-parse request body if delivered as string/buffer by Vercel runtime
    if (req.body && typeof req.body === "string") {
      try {
        req.body = JSON.parse(req.body);
      } catch (e) {}
    }

    if (!app) {
      return res.status(500).json({ success: false, message: "Backend application module could not be loaded." });
    }

    return app(req, res);
  } catch (err) {
    console.error("[Vercel Serverless Function Error]", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Serverless Function Execution Error",
    });
  }
};

