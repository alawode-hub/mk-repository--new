const express = require("express");
const { createOrder, getOrders, getMyOrders } = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/")
  .post(protect, createOrder)
  .get(protect, admin, getOrders);

router.route("/myorders")
  .get(protect, getMyOrders);

module.exports = router;