const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const {
  getSubscriptionStatus,
  upgradeTrial,
} = require("../controllers/subscriptionController"); // ✅ make sure these are exported

router.get("/status", protect, getSubscriptionStatus);   // ✅ correct
router.post("/upgrade", protect, upgradeTrial);          // ✅ correct

module.exports = router;
