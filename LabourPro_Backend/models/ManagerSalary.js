const mongoose = require("mongoose");

const ManagerSalarySchema = new mongoose.Schema({
  companyId: { type: String, ref: "Company", required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: "Manager", required: true },

  month: { type: String, required: true },
  year: { type: Number, required: true },

  baseSalary: { type: Number, required: true, default: 0 },
  advance: { type: Number, default: 0 },
  loanTaken: { type: Number, default: 0 },
  loanPaid: { type: Number, default: 0 },
  loanRemaining: { type: Number, default: 0 },
  
  finalSalary: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("ManagerSalary", ManagerSalarySchema);
