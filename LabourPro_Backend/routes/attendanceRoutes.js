const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAllAttendance,
  getWorkerAttendance,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const { protect } = require("../middlewares/auth");

router.post("/", protect, markAttendance);
router.get("/", protect, getAllAttendance);
router.get("/:id", protect, getWorkerAttendance);
router.put("/:id", protect, updateAttendance);
router.delete("/:id", protect, deleteAttendance);

module.exports = router;
