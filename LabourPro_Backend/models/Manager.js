const mongoose = require("mongoose");

const ManagerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    role: {
        type: String,
        enum: ["Worker", "Supervisor", "Manager"], // Added Manager
        required: true
    },
    salary: { type: Number, required: true }, // ✅ single salary field
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    companyId: { type: String, ref: "Company", required: true }
}, { timestamps: true });

module.exports = mongoose.model("manager", ManagerSchema);
