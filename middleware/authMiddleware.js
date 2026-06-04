const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel"); 

const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log("Auth header:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretKey");
      console.log("Decoded:", decoded);

      req.user = await User.findById(decoded.id).select("-password");
      console.log("User:", req.user?.email);

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      console.log("AUTH ERROR:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" }); // ← Use.json() not throw
    }
  } else {
    console.log("NO TOKEN SENT");
    res.status(401).json({ message: "Not authorized, no token" }); // ← Use.json() not throw
  }
});

const admin = (req, res, next) => {
  console.log("Checking admin for:", req.user?.email, "Role:", req.user?.role);
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" }); // ← Use.json() not throw
  }
};

module.exports = { protect, admin };