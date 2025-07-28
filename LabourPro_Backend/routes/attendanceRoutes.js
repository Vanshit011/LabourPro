const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const {protect,isAdmin} = require("../middlewares/auth");

router.post("/", protect,isAdmin, attendanceController.addAttendance);
router.get("/", protect,isAdmin, attendanceController.getAllAttendance);
router.get("/:workerId", protect,isAdmin, attendanceController.getAttendanceByWorker);
router.put("/:id", protect,isAdmin, attendanceController.updateAttendance);

module.exports = router;
