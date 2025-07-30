const Attendance = require("../models/Attendance");
const Worker = require("../models/Worker");
const moment = require("moment");

exports.addAttendance = async (req, res) => {
  try {
    const { worker: workerId, entryTime, exitTime } = req.body;
    const companyId = req.user.companyId;

    // 1. Find the worker
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }

    // 2. Parse times
    const entry = moment(entryTime, "HH:mm");
    const exit = moment(exitTime, "HH:mm");

    if (!entry.isValid() || !exit.isValid()) {
      return res.status(400).json({ error: "Invalid time format" });
    }

    const totalHours = parseFloat(exit.diff(entry, "hours", true).toFixed(2));
    const rojPerHour = parseFloat(worker.rojPerHour);

    if (isNaN(totalHours) || isNaN(rojPerHour)) {
      return res.status(400).json({ error: "Invalid hours or roj/hour" });
    }

    const dailyRoj = parseFloat((totalHours * rojPerHour).toFixed(2));

    // 3. Create attendance
    const attendance = new Attendance({
      companyId,
      worker: workerId,
      entryTime,
      exitTime,
      totalHours,
      dailyRoj,
      date: new Date(), // today by default
    });

    await attendance.save();
    res.status(201).json(attendance);

  } catch (error) {
    console.error("Error in addAttendance:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const attendance = await Attendance.find({ companyId }).populate("worker", "name role");

    res.json({ attendance });
  } catch (err) {
    console.error("Error in getAllAttendance:", err);
    res.status(500).json({ error: "Error fetching attendance" });
  }
};
// Update attendance by ID
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Attendance.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Attendance not found' });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance', error });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Attendance.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Attendance not found' });

    res.status(200).json({ message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting attendance', error });
  }
};

// GET /api/attendance?date=YYYY-MM-DD
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query; // Format: 2025-07-30
    const companyId = req.user.companyId;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      companyId,
      date: { $gte: start, $lte: end },
    }).populate("worker");

    res.json({ attendance });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get attendance by date" });
  }
};