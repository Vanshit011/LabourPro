const express = require("express");
const { createOrder } = require("../controllers/paymentController");
// const { protect, isAdmin } = require("../middlewares/auth");

const router = express.Router();

router.post("/create-order", createOrder);
// router.post("/renew", protect, isAdmin, renewPlan);
// router.post("/verify-renew", protect, isAdmin, verifyRenewal);

module.exports = router;
