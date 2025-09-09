const Admin = require("../models/Admin");
const Worker = require("../models/Worker"); // Assuming you have a Worker model for workers and managers
const Manager = require("../models/Manager");
const Salary = require("../models/ManagerSalary");
const Subscription = require("../models/Subscription");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");


exports.registerTrial = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const companyId = uuidv4();
    const subscriptionExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      companyName,
      companyId,
      isTrial: true,
      planType: "trial",
      subscriptionExpiry,
    });

    const token = jwt.sign(
      { id: admin._id, companyId: admin.companyId, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Trial Registration Successful",
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        companyId: admin.companyId,
        planType: admin.planType,
        subscriptionExpiry: admin.subscriptionExpiry,
      },
    });
  } catch (err) {
    console.error("Trial Registration Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.registerPaid = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      companyName,
      planType,
      amount,
      razorpayOrderId,
      razorpayPaymentId
    } = req.body;

    if (!name || !email || !password || !companyName || !planType || !amount || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const companyId = uuidv4();

    const days = planType === "yearly" ? 365 : 30;
    const subscriptionExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      companyName,
      companyId,
      isTrial: false,
      planType,
      subscriptionExpiry,
    });

    await Subscription.create({
      adminId: admin._id,
      razorpayOrderId,
      razorpayPaymentId,
      planType,
      amount,
      endDate: subscriptionExpiry,
    });

    const token = jwt.sign(
      { id: admin._id, companyId: admin.companyId, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Paid Registration Successful",
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        planType: admin.planType,
        subscriptionExpiry: admin.subscriptionExpiry,
        companyId: admin.companyId,
      }
    });

  } catch (error) {
    console.error("Paid Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    let user;
    let role;

    // Check if Admin
    user = await Admin.findOne({ email });
    if (user) {
      role = "admin";
    } else {
      // Check if Manager (role: "manager" in Worker model)
      user = await Worker.findOne({ email, role: "manager" });
      if (user) {
        role = "manager";
      }
    }

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid password" });

    // For managers, get companyId from Worker model (assuming it exists)
    const companyId = role === "admin" ? user.companyId : user.companyId; // Adjust if different

    // Subscription check (for both admin and manager via company)
    const admin = role === "admin" ? user : await Admin.findOne({ companyId });
    if (!admin) {
      return res.status(404).json({ message: "Company not found" });
    }

    const now = new Date();
    if (admin.subscriptionExpiry && admin.subscriptionExpiry < now) {
      return res.status(403).json({ message: "Subscription expired. Please renew your plan." });
    }

    // Generate token with role and companyId
    const token = jwt.sign(
      { id: user._id, companyId, role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        companyId,
        role,
        ...(role === "admin" ? {
          planType: admin.planType,
          subscriptionExpiry: admin.subscriptionExpiry,
        } : {}), // Add admin-specific fields if needed
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Worker Login (for regular workers)
exports.loginWorker = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const worker = await Worker.findOne({ email });
    if (!worker)
      return res.status(404).json({ message: "Worker not found" });

    // Ensure it's not a manager (if you want to distinguish; adjust as needed)
    if (worker.role === "manager") {
      return res.status(403).json({ message: "Use manager login endpoint" });
    }

    const isMatch = worker.password
      ? await bcrypt.compare(password, worker.password)
      : false;

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Optional: Check company's subscription expiry via admin (assuming worker has companyId)
    const admin = await Admin.findOne({ companyId: worker.companyId });
    if (admin) {
      const now = new Date();
      if (admin.subscriptionExpiry && admin.subscriptionExpiry < now) {
        return res.status(403).json({ message: "Company subscription expired. Contact admin." });
      }
    }

    const token = jwt.sign(
      { id: worker._id, companyId: worker.companyId, role: "worker" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Worker login successful",
      token,
      worker: {
        name: worker.name,
        email: worker.email,
        companyId: worker.companyId,
        role: worker.role,
      }
    });
  } catch (err) {
    console.error("Worker Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Manager Login (for managers)
exports.loginManager = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find manager by email and role
    const manager = await Manager.findOne({ email, role: "Manager" });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Verify password (plain text comparison - INSECURE; use hashing in production)
    const isMatch = password === manager.password; // Direct string compare
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    // Rest of your code

    // Company-wise check: Validate company's subscription
    const admin = await Admin.findOne({ companyId: manager.companyId });
    if (!admin) {
      return res.status(404).json({ message: "Company not found" });
    }

    const now = new Date();
    if (admin.subscriptionExpiry && admin.subscriptionExpiry < now) {
      return res.status(403).json({ message: "Company subscription expired. Contact admin." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: manager._id, companyId: manager.companyId, role: "manager" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Fetch salary details (current and previous month)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentSalary = await Salary.findOne({
      managerId: manager._id,
      month: currentMonth,
      year: currentYear,
      companyId: manager.companyId // Company-wise filter
    });

    const previousSalary = await Salary.findOne({
      managerId: manager._id,
      month: previousMonth,
      year: previousYear,
      companyId: manager.companyId // Company-wise filter
    });

    // Fetch other details (e.g., manager profile; expand as needed)
    const managerDetails = {
      name: manager.name,
      email: manager.email,
      role: manager.role,
      companyId: manager.companyId,
      // Add more fields like number, etc., if available in model
    };

    res.json({
      message: "Manager login successful",
      token,
      manager: managerDetails,
      salary: {
        current: currentSalary || { message: "No data for current month" },
        previous: previousSalary || { message: "No data for previous month" }
      }
    });
  } catch (err) {
    console.error("Manager Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// In-memory OTP storage (temporary; expires after use or timeout)
const otps = {}; // { email: { otp: string, expires: Date } }

// Configure email transporter (update with your email service details)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your provider (e.g., SendGrid)
  auth: {
    user: 'vanshitpatel10@gmail.com', // Replace with your email
    pass: 'cqfl pvsq vqnt jzkn' // Use app-specific password for Gmail
  }
});

// Send OTP API
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    otps[email] = { otp, expires };

    // Send email with OTP
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It expires in 10 minutes.`
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify OTP API
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const stored = otps[email];
  if (!stored || stored.expires < new Date() || stored.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  // OTP valid; remove it to prevent reuse
  delete otps[email];

  res.json({ message: "OTP verified" });
};

// Reset Password API
exports.resetPassword = async (req, res) => {

  const { email, newPassword } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



