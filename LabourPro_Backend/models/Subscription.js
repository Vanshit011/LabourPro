const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    required: true,
  },
  planType: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
