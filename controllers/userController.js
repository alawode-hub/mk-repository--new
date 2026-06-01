const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const generateToken = require("../utils/generateToken");

// PASSWORD VALIDATION 
const validatePassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  console.log("Register attempt:", { email, firstName, lastName });

  if (!email || !password || !firstName || !lastName) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  // STRONG PASSWORD CHECK
  if (!validatePassword(password)) {
    res.status(400);
    throw new Error("Password must be 8+ characters with 1 uppercase, 1 lowercase, 1 number & 1 special char @$!%*?&");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password, 
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  console.log("Login attempt:", req.body);
  
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    // EMAIL REMOVED - CANNOT BE CHANGED
    // user.email = req.body.email || user.email;

    // PASSWORD UPDATE WITH VALIDATION
    if (req.body.password) {
      if (!validatePassword(req.body.password)) {
        res.status(400);
        throw new Error("Password must be 8+ characters with 1 uppercase, 1 lowercase, 1 number & 1 special char @$!%*?&");
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      name: updatedUser.name,
      email: updatedUser.email, 
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// PASSWORD CHANGE ROUTE
const updateUserPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide current and new password");
  }

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // STRONG PASSWORD VALIDATION
  if (!validatePassword(newPassword)) {
    res.status(400);
    throw new Error("Password must be 8+ characters with 1 uppercase, 1 lowercase, 1 number & 1 special char @$!%*?&");
  }

  user.password = newPassword; // pre-save hook will hash
  await user.save();

  res.json({ message: "Password updated successfully" });
});

module.exports = { registerUser, loginUser, updateUserProfile, getUserProfile, updateUserPassword };