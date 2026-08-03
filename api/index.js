const app = require("../backend/src/server.js");
const connectDB = require("../backend/src/config/db.js");

module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
