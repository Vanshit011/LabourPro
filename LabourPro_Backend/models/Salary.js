const mongoose = require('mongoose');

const SalarySchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Worker', unique: true },
  rojRate: { type: Number, required: true },  // wage per roj/hour/day as per your system
  // You can add more fields like baseSalary, bonuses, etc.
});

module.exports = mongoose.model('Salary', SalarySchema);
