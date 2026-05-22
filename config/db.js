const mongoose = require("mongoose");
const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
  try {
    console.log("DB URI:", process.env.DB_URI);
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.log("MongoDB Error ❌", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;