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
exports.updateAttendanceById = async (req, res) => {
  try {
    const { entryTime, exitTime, totalHours, dailyRoj } = req.body;

    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        entryTime,
        exitTime,
        totalHours,
        dailyRoj,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update attendance', error: err.message });
  }
}
// Delete attendance by ID
exports.deleteAttendanceById = async (req, res) => {
  try {
    const deleted = await Attendance.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete attendance', error: err.message });
  }
}
