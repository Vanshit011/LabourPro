const express = require("express");
const router = express.Router();
const {addAttendance,getAllAttendance,getAttendanceByWorker,updateAttendance} = require("../controllers/attendanceController");
const {protect,isAdmin} = require("../middlewares/auth");

router.post("/", protect,isAdmin, addAttendance);
router.get("/", protect,isAdmin, getAllAttendance);
router.get("/:workerId", protect,isAdmin, getAttendanceByWorker);
router.put("/:id", protect,isAdmin, updateAttendance);

module.exports = router;
