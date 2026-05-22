const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log("Auth header:", req.headers.authorization); // check this

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token:", token); // check this

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
      console.log("Decoded:", decoded); // check this

      req.user = await User.findById(decoded.id).select("-password");
      console.log("User:", req.user?.email); // check this

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      console.log("AUTH ERROR:", error.message); // THIS WILL SHOW THE REAL ERROR
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    console.log("NO TOKEN SENT");
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const admin = (req, res, next) => {
  console.log("Checking admin for:", req.user?.email, "Role:", req.user?.role);
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};

module.exports = { protect, admin };