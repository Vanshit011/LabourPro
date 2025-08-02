const express = require("express");
const router = express.Router();
const { addAttendance, getMonthlySalary, updateAttendance, deleteAttendance, getAttendanceByDate } = require("../controllers/attendanceController");
const { protect, isAdmin } = require("../middlewares/auth");

router.post("/", protect, isAdmin, addAttendance);
router.get("/", protect, isAdmin, getAttendanceByDate);
router.put("/:id", protect, isAdmin, updateAttendance);     // Edit attendance
router.delete("/:id", protect, isAdmin, deleteAttendance);  // Delete attendance

router.get("/monthly", protect, isAdmin, getMonthlySalary);


module.exports = router;
