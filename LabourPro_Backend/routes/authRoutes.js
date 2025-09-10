const express = require("express");
const router = express.Router();
const { registerTrial, forgotPassword, verifyOtp,resetPassword,loginManager, loginWorker  } = require("../controllers/authController");
const { registerPaid } = require("../controllers/authController");
const { loginAdmin } = require("../controllers/authController");

router.post("/register-trial", registerTrial);
router.post("/register-paid", registerPaid);
router.post("/login", loginAdmin);
router.post("/manager-login", loginManager);
router.post("/helper-login", loginWorker);

// Routes - Ensure handlers are functions
router.post('/forgot-password', forgotPassword); // Line 14-ish
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);


module.exports = router;
