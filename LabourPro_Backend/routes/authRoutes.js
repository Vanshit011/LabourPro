const express = require("express");
const router = express.Router();
const { registerTrial, forgotPassword, verifyOtp,resetPassword,loginManager, loginWorker  } = require("../controllers/authController");
const { registerPaid } = require("../controllers/authController");
const { loginAdmin } = require("../controllers/authController");

router.post("/register-trial", registerTrial);
router.post("/register-paid", registerPaid);
router.post("/login", loginAdmin);
router.post("/managerlogin", loginManager);
router.post("/helperlogin", loginWorker);

// Routes - Ensure handlers are functions
router.post('/forgotpassword', forgotPassword); // Line 14-ish
router.post('/verifyotp', verifyOtp);
router.post('/resetpassword', resetPassword);


module.exports = router;
