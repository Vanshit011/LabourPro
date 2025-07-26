const SubAdmin = require("../models/SubAdmin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// controllers/subadminController.js
// const SubAdmin = require("../models/SubAdmin"); // Adjust if using different model name

exports.getSubAdminProfile = async (req, res) => {
  try {
    const subAdminId = req.user.id; // assuming your authMiddleware sets `req.user`
    const subAdmin = await SubAdmin.findById(subAdminId).select("-password");

    if (!subAdmin) {
      return res.status(404).json({ message: "Sub admin not found" });
    }

    res.status(200).json(subAdmin);
  } catch (err) {
    console.error("Error fetching subadmin profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.loginSubAdmin = async (req, res) => {
    const { email, password } = req.body;

    const subAdmin = await SubAdmin.findOne({ email });
    if (!subAdmin) return res.status(404).json({ message: "Sub Admin not found" });

    const isMatch = await bcrypt.compare(password, subAdmin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        { id: subAdmin._id, companyId: subAdmin.companyId, role: "subadmin" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.json({ token, subadmin: { name: subAdmin.name, email: subAdmin.email } });
};


exports.createSubAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const companyId = req.user.companyId;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await SubAdmin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Sub Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSubAdmin = await SubAdmin.create({ name, email, password: hashedPassword, companyId });

    res.status(201).json({ message: "Sub Admin created", subAdmin: newSubAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllSubAdmins = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const subAdmins = await SubAdmin.find({ companyId });
    res.json(subAdmins);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sub admins" });
  }
};

exports.updateSubAdmin = async (req, res) => {
  try {
    const { name, email } = req.body;
    const subAdminId = req.params.id;
    const companyId = req.user.companyId;

    const updated = await SubAdmin.findOneAndUpdate(
      { _id: subAdminId, companyId },
      { name, email },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Sub Admin not found" });

    res.json({ message: "Sub Admin updated", subAdmin: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update sub admin" });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const subAdminId = req.params.id;
    const companyId = req.user.companyId;

    const deleted = await SubAdmin.findOneAndDelete({ _id: subAdminId, companyId });
    if (!deleted) return res.status(404).json({ message: "Sub Admin not found" });

    res.json({ message: "Sub Admin deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete sub admin" });
  }
};

