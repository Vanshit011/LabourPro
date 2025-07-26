const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  date: {
    type: String, // Store as YYYY-MM-DD for uniqueness
    required: true,
  },
  status: {
    type: String,
    enum: ["Present", "Absent"],
    required: true,
  },
  entryTime: {
    type: String, // "09:00"
  },
  exitTime: {
    type: String, // "18:00"
  },
  hoursWorked: {
    type: Number,
    default: 0,
  },
  companyId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

attendanceSchema.index({ workerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
