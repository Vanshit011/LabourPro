const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
require("./config/db")();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/worker", require("./routes/workerRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes.js"));
app.use("/api/salary", require("./routes/salaryRoutes"));
// app.use("/api/loan", require("./routes/loanRoutes"));
// app.use("/api/notifications", require("./routes/notificationRoutes"));
// app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/razorpay", require("./routes/paymentRoutes.js"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
