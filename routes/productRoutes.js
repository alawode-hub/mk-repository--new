const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  submitProduct,
  getPendingProducts,
  approveProduct
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes - only show approved products
router.get("/", getProducts);

// User route - submit product for approval
router.post("/submit", protect, submitProduct);

// Admin routes - PUT SPECIFIC ROUTES BEFORE /:id
router.get("/pending", protect, admin, getPendingProducts); // ← MUST BE ABOVE /:id
router.put("/:id/approve", protect, admin, approveProduct);
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// Public route with ID - MUST BE LAST
router.get("/:id", getProductById); // ← PUT THIS LAST

module.exports = router;