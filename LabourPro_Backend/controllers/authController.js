const Admin = require("../models/Admin");
const Subscription = require("../models/Subscription");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { encryptPassword, decryptPassword } = require("../utils/cryptoUtil");

// ------------------ Trial Registration ------------------
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

    const companyId = uuidv4();
    const subscriptionExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const encryptedPassword = encryptPassword(password);

    const admin = await Admin.create({
      name,
      email,
      password: encryptedPassword,
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

// ------------------ Paid Registration ------------------
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

    const companyId = uuidv4();
    const days = planType === "yearly" ? 365 : 30;
    const subscriptionExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const encryptedPassword = encryptPassword(password);

    const admin = await Admin.create({
      name,
      email,
      password: encryptedPassword,
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

// ------------------ Admin Login ------------------
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    const decryptedPassword = decryptPassword(admin.password);
    if (decryptedPassword !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const now = new Date();
    if (admin.subscriptionExpiry && admin.subscriptionExpiry < now) {
      return res.status(403).json({ message: "Subscription expired. Please renew your plan." });
    }

    const token = jwt.sign(
      { id: admin._id, companyId: admin.companyId, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        name: admin.name,
        email: admin.email,
        companyId: admin.companyId,
        planType: admin.planType,
        subscriptionExpiry: admin.subscriptionExpiry,
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
