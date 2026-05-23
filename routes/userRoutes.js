const express = require("express");
const { 
  registerUser, 
  loginUser, 
  updateUserProfile, 
  getUserProfile 
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Test route so you can check it in browser
router.get("/", (req, res) => {
  res.json({ message: "User routes working" });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

router.route("/profile")
 .get(protect, getUserProfile)
 .put(protect, updateUserProfile);

module.exports = router;