const express = require("express");
const { 
  registerUser, 
  loginUser, 
  updateUserProfile, 
  getUserProfile,
  updateUserPassword  
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "User routes working" });
});

router.post("/register", registerUser);
router.post("/login", loginUser);

router.route("/profile")
 .get(protect, getUserProfile)
 .put(protect, updateUserProfile);

//  PASSWORD CHANGE ROUTE
router.put("/password", protect, updateUserPassword);

module.exports = router;