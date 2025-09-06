const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  workerId: {
    type:  mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  workerName: {
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
  rojRate: {
    type: Number,
    required: true,
  },
  totalRojEarned: {
    type: Number,
    required: true,
  },
  date: {
    type: String, // format: YYYY-MM-DD
    required: true,
  },
  companyId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
