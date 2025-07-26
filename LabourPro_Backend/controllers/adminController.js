const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, companyName } = req.body;

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.companyName = companyName || admin.companyName;

    await admin.save();
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
