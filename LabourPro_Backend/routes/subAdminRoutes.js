const express = require("express");
const router = express.Router();
const {
  loginSubAdmin ,
  createSubAdmin,
  getAllSubAdmins,
  updateSubAdmin,
  deleteSubAdmin,
  getSubAdminProfile,
} = require("../controllers/subAdminController");
const { protect, isAdmin } = require("../middlewares/auth");

router.get("/me",protect, isAdmin , getSubAdminProfile);

router.post("/login", loginSubAdmin);

router.post("/", protect, isAdmin, createSubAdmin);
router.get("/", protect, isAdmin, getAllSubAdmins);
router.put("/:id", protect, isAdmin, updateSubAdmin);
router.delete("/:id", protect, isAdmin, deleteSubAdmin);

module.exports = router;