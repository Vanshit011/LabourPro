const mongoose = require("mongoose");

const ManagerSchema = new mongoose.Schema({
  companyId: { type: String, ref: "Company", required: true },
  name: { type: String, required: true },
  number: { type: String, required: true },
  role: {
    type: String,
    enum: ["Worker", "Supervisor", "Manager"], // 👈 fixed enum
    required: true
  },
  salary: { type: Number, required: true }, // ✅ single base salary field
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Manager", ManagerSchema);
