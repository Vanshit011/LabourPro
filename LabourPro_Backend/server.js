const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",   // local dev
  "https://labourpro.netlify.app" // deployed frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// DB connection
require("./config/db")();
require("./cron/salaryCron");

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/worker", require("./routes/workerRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes.js"));
app.use("/api/salary", require("./routes/salaryRoutes.js"));
app.use("/api/razorpay", require("./routes/paymentRoutes.js"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
