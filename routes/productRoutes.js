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
router.get("/:id", getProductById);

// User route - submit product for approval
router.post("/submit", protect, submitProduct);

// Admin routes
router.post("/", protect, admin, createProduct);
router.get("/pending", protect, admin, getPendingProducts);
router.put("/:id", protect, admin, updateProduct);
router.put("/:id/approve", protect, admin, approveProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;