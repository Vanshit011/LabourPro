const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String },
  role: {
    type: String,
    enum: ["Helper", "Manager", "Forger", "Welder", "Electrician", "Operator"],
    required: true,
  },
  salary: { type: Number },
  companyId: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Worker", workerSchema);
