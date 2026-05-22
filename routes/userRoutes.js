const express = require("express");
const { 
  registerUser, 
  loginUser, 
  updateUserProfile, 
  getUserProfile 
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser); // ← ADD THIS
router.post("/login", loginUser);       // ← ADD THIS

router.route("/profile")
 .get(protect, getUserProfile)
 .put(protect, updateUserProfile);

module.exports = router;