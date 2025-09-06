// models/WorkerSalary.js (example schema)
const mongoose = require("mongoose");

const WorkerSalarySchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  baseSalary: { type: Number, required: true }, // Total roj earned
  advance: { type: Number, default: 0 },
  loanTaken: { type: Number, default: 0 },
  loanPaid: { type: Number, default: 0 },
  loanRemaining: { type: Number, default: 0 },
  finalSalary: { type: Number, required: true },
  totalHours: { type: Number, default: 0 },
  daysWorked: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("WorkerSalary", WorkerSalarySchema);
