const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true },
  companyId: { type: String, required: true, unique: true },

  isTrial: { type: Boolean, default: true },
  planType: { type: String, enum: ["trial", "monthly", "yearly"], default: "trial" },
  subscriptionExpiry: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);
