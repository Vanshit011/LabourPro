const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/adminController");

const { protect, isAdmin } = require("../middlewares/auth");

router.get("/me", protect, isAdmin, getProfile);
router.put("/update", protect, isAdmin, updateProfile);
router.put("/change-password", protect, isAdmin, changePassword);

module.exports = router;
