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
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["labour", "helper", "welder", "cnc operator", "foreman", "manager"],
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
