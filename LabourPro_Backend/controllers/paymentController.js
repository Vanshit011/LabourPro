const razorpay = require("../utils/razorpayInstance");
// const Company = require("../models/Company");
// const crypto = require("crypto");

const createOrder = async (req, res) => {
  try {
    const { amount, planType } = req.body;

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        plan: planType,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};




module.exports = {
  createOrder
};
