const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

// @route   POST /api/auth/register
router.post("/register", registerUser);

// @route   POST /api/auth/login  
router.post("/login", loginUser);

// @route   GET /api/auth/verify-email
router.get("/verify-email", verifyEmail);

module.exports = router;