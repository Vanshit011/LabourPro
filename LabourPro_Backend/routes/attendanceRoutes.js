const express = require("express");
const router = express.Router();
const { addAttendance, getAllAttendance, deleteAttendance, updateAttendance,getAttendanceByDate } = require("../controllers/attendanceController");
const { protect, isAdmin } = require("../middlewares/auth");

router.post("/", protect, isAdmin, addAttendance);
router.get("/", protect, isAdmin, getAllAttendance); // ✅ just GET /attendance
router.put("/:id", protect, isAdmin, updateAttendance); // Update attendance by ID
router.delete("/:id", protect, isAdmin, deleteAttendance); // Delete attendance by ID
router.get("/date",protect, isAdmin, getAttendanceByDate); // Get attendance by date

module.exports = router;
