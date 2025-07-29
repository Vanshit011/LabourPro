const express = require("express");
const router = express.Router();
const { addAttendance, getAllAttendance, deleteAttendanceById, updateAttendanceById } = require("../controllers/attendanceController");
const { protect, isAdmin } = require("../middlewares/auth");

router.post("/", protect, isAdmin, addAttendance);
router.get("/", protect, isAdmin, getAllAttendance); // ✅ just GET /attendance
router.put("/:id", protect, isAdmin, updateAttendanceById); // Update attendance by ID
router.delete("/:id", protect, isAdmin, deleteAttendanceById); // Delete attendance by ID

module.exports = router;
