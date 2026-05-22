const mongoose = require('mongoose');
const Order = require("../models/orderModel");

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, totalPrice } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items" });
    }

    if (!shippingAddress || !shippingAddress.fullName) {
      return res.status(400).json({ message: "Shipping address required" });
    }

    for (let item of orderItems) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ 
          message: `Invalid product ID: ${item.product}` 
        });
      }
    }

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
    
  } catch (error) {
    console.log("ORDER CREATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    // Use lean() + populate with strictPopulate false to avoid crash if user deleted
    const orders = await Order.find({})
      .populate({ path: "user", select: "firstName email", strictPopulate: false })
      .lean();
    
    res.json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).lean();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, getMyOrders };