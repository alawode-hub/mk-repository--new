const express = require("express");
const axios = require("axios");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/orderModel");
const crypto = require("crypto");

const router = express.Router();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Initialize needs user - keep protect
router.post("/initialize", protect, async (req, res) => {
  const { email, amount, orderId, callback_url } = req.body;

  if (!email ||!amount ||!orderId) {
    return res.status(400).json({ message: "Email, amount, and orderId are required" });
  }

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100,
        currency: "NGN",
        metadata: { orderId },
        callback_url: callback_url || `${process.env.FRONTEND_URL}/payment/verify`
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
    console.log("PAYSTACK INIT ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: error.response?.data?.message || "Payment init failed" });
  }
});

//verify

router.get("/verify/:reference", async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`
        }
      }
    );

    const paymentData = response.data.data;

    if (paymentData.status === "success") {
      const orderId = paymentData.metadata?.orderId;

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

      return res.json({
        success: true,
        data: paymentData
      });
    }

    return res.json({
      success: false
    });

  } catch (error) {
    console.log(
      "PAYSTACK VERIFY ERROR:",
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: "Verification failed"
    });
  }
});

// Webhook needs signature verification - keep as is
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(req.body).digest("hex");

  if (hash!== req.headers["x-paystack-signature"]) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "charge.success") {
    const orderId = event.data.metadata?.orderId;
    if (orderId) {
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
  }

  res.sendStatus(200);
});

module.exports = router;