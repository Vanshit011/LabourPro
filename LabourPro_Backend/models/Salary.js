// models/Salary.js
const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker",
    required: true,
  },
  companyId: {
    type: String,
    ref: "Company",
    required: true,
  },
  month: {
    type: String, // Format: "2025-07"
    required: true,
  },
  totalHours: {
    type: Number,
    required: true,
  },
  totalRoj: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Salary", salarySchema);
