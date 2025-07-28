const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  companyId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  entryTime: {
    type: String,
    required: true,
  },
  exitTime: {
    type: String,
    required: true,
  },
  totalHours: {
    type: Number,
    required: true,
  },
  dailyRoj: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
