const Attendance = require("../models/Attendance");
const Worker = require("../models/Worker");

// Utility to calculate hours from entry/exit time
const calculateHours = (entry, exit) => {
  const [h1, m1] = entry.split(":").map(Number);
  const [h2, m2] = exit.split(":").map(Number);
  const start = h1 * 60 + m1;
  const end = h2 * 60 + m2;
  return Math.max(0, ((end - start) / 60).toFixed(2));
};

// ✅ Add attendance
exports.markAttendance = async (req, res) => {
  try {
    const { workerId, date, status, entryTime, exitTime } = req.body;
    const companyId = req.user.companyId;

    if (!workerId || !date || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Attendance.findOne({ workerId, date });
    if (existing) {
      return res.status(409).json({ message: "Attendance already marked" });
    }

    let hoursWorked = 0;
    if (status === "Present" && entryTime && exitTime) {
      hoursWorked = calculateHours(entryTime, exitTime);
    }

    const record = await Attendance.create({
      workerId,
      date,
      status,
      entryTime,
      exitTime,
      hoursWorked,
      companyId,
    });

    res.status(201).json({ message: "Attendance marked", record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all attendance logs
exports.getAllAttendance = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const logs = await Attendance.find({ companyId }).populate("workerId", "name role");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance" });
  }
};

// ✅ Get attendance for 1 worker
exports.getWorkerAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const logs = await Attendance.find({ workerId: id, companyId }).sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Error fetching worker attendance" });
  }
};

// ✅ Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, entryTime, exitTime } = req.body;

    let hoursWorked = 0;
    if (status === "Present" && entryTime && exitTime) {
      hoursWorked = calculateHours(entryTime, exitTime);
    }

    const updated = await Attendance.findByIdAndUpdate(id, {
      status,
      entryTime,
      exitTime,
      hoursWorked,
    }, { new: true });

    if (!updated) return res.status(404).json({ message: "Record not found" });

    res.json({ message: "Attendance updated", updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update attendance" });
  }
};

// ✅ Delete attendance
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Record not found" });

    res.json({ message: "Attendance deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete attendance" });
  }
};
