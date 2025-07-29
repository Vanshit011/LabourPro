const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  companyId: {
    type: String,
    ref: "Company",
    required: true,
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  date: {
    type: String,
    required: true, // Format: YYYY-MM-DD
  },
  entryTime: String,  // Format: HH:mm
  exitTime: String,   // Format: HH:mm
  totalHours: Number,
  dailyRoj: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
