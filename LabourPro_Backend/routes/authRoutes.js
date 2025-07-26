const express = require("express");
const router = express.Router();
const { registerTrial } = require("../controllers/authController");
const { registerPaid } = require("../controllers/authController");
const { loginAdmin } = require("../controllers/authController");

router.post("/register-trial", registerTrial);
router.post("/register-paid", registerPaid);
router.post("/login", loginAdmin);

module.exports = router;
