const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/orderModel");
const crypto = require("crypto");

const router = express.Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// 1. Initialize payment
router.post("/initialize", protect, async (req, res) => {
  const { email, amount, orderId } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // kobo
        currency: "NGN",
        metadata: { orderId }, // MUST send orderId here
        callback_url: `${process.env.FRONTEND_URL}/payment/verify` // match frontend route
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error.response?.data);
    res.status(500).json({ message: error.response?.data?.message || "Payment init failed" });
  }
});

// 2. Verify payment - UPDATE ORDER HERE TOO
router.get("/verify/:reference", protect, async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      }
    );

    const paymentData = response.data;

    if (paymentData.status === "success") {
      const orderId = paymentData.metadata.orderId;

      // Update order immediately so user sees it
      const order = await Order.findById(orderId);
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: paymentData.reference,
          status: paymentData.status,
          update_time: paymentData.paid_at,
          email_address: paymentData.customer.email
        };
        await order.save();
      }

      res.json({ success: true, data: paymentData });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.response?.data);
    res.status(500).json({ message: "Verification failed" });
  }
});

// 3. Webhook - backup in case verify fails
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const hash = crypto
   .createHmac("sha512", PAYSTACK_SECRET)
   .update(req.body)
   .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "charge.success") {
    const orderId = event.data.metadata.orderId;
    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: Date.now(),
      paymentResult: {
        id: event.data.reference,
        status: event.data.status,
        update_time: event.data.paid_at,
        email_address: event.data.customer.email
      }
    });
  }

  res.sendStatus(200);
});

module.exports = router;