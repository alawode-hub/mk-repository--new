const express = require("express");
const { registerUser, loginUser, verifyEmail } = require("../controllers/authController");

const router = express.Router();

// Test route so you can check it in browser
router.get("/", (req, res) => {
  res.json({ message: "Auth routes working" });
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email", verifyEmail);

module.exports = router;