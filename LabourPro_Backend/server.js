const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");          // ✅ for socket server
const { Server } = require("socket.io");

dotenv.config();
const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",   // local dev
  "https://labourpro.netlify.app",
  "http://labourpro.in" // deployed frontend
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

// ✅ Create HTTP server & attach socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Store io globally (accessible in controllers)
app.set("io", io);

// Socket.io connection
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
