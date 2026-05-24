const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/orderModel");

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
        amount: amount * 100, // Paystack uses kobo
        currency: "NGN", // force Naira only
        metadata: { orderId },
        callback_url: `${process.env.FRONTEND_URL}/payment-success`
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
    res.status(500).json({ message: error.response?.data?.message || "Payment init failed" });
  }
});

// 2. Verify payment - called by frontend after redirect
router.get("/verify/:reference", protect, async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    if (response.data.status && response.data.status === "success") {
      res.json({ success: true, data: response.data });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
});

// 3. Webhook - called by Paystack server
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const hash = require("crypto")
   .createHmac("sha512", PAYSTACK_SECRET)
   .update(req.body)
   .digest("hex");

  if (hash!== req.headers["x-paystack-signature"]) {
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