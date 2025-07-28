const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["forger", "helper", "welder", "cnc operator", "foreman", "manager"],
    required: true,
  },
  rojPerHour: {
    type: Number,
    required: true,
  },
  companyId: {
    type: String, // ✅ Change from ObjectId to String
    ref: "Company",
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Worker", workerSchema);
