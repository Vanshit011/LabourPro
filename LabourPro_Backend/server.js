const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",  // React dev server
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"], // 👈 allow Authorization
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
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
