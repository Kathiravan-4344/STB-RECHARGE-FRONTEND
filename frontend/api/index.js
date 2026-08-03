const app = require("../../backend/src/server.js");
const connectDB = require("../../backend/src/config/db.js");

module.exports = async (req, res) => {
  await connectDB();
  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? "" : "/") + req.url;
  }
  return app(req, res);
};
