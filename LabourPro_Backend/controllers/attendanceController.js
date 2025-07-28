const Attendance = require("../models/Attendance");
const Worker = require("../models/Worker");

const calculateHoursAndRoj = (entry, exit, rojPerHour) => {
  const [eH, eM] = entry.split(":").map(Number);
  const [xH, xM] = exit.split(":").map(Number);

  const entryMinutes = eH * 60 + eM;
  const exitMinutes = xH * 60 + xM;

  const totalMinutes = exitMinutes - entryMinutes;
  const totalHours = totalMinutes / 60;
  const roj = Math.round(totalHours * rojPerHour);

  return { totalHours, roj };
};

// Add Attendance
exports.addAttendance = async (req, res) => {
  try {
    const { workerId, date, entryTime, exitTime } = req.body;
    const companyId = req.user?.companyId;

    // console.log("Incoming body:", req.body);
    // console.log("Auth user:", req.user);

    const worker = await Worker.findById(workerId);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const { totalHours, roj } = calculateHoursAndRoj(entryTime, exitTime, worker.rojPerHour);
    // console.log("Calculated Hours:", totalHours, "ROJ:", roj);

    const attendance = await Attendance.create({
      workerId,
      companyId,
      date,
      entryTime,
      exitTime,
      totalHours,
      dailyRoj: roj,
    });

    res.status(201).json({ message: "Attendance added", attendance });
  } catch (err) {
    console.error("❌ Error in addAttendance:", err.message, err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllAttendance = async (req, res) => {
  try {
    const companyId = req.user?.companyId;

    const attendanceRecords = await Attendance.find({ companyId })
      .populate("workerId", "name role rojPerHour") // only include needed fields
      .sort({ date: -1 }); // latest first

    res.status(200).json({ attendance: attendanceRecords });
  } catch (err) {
    console.error("❌ Error in getAllAttendance:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all Attendance (per worker)
exports.getAttendanceByWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const records = await Attendance.find({ workerId }).populate("workerId");
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch records" });
  }
};

// Update Attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { entryTime, exitTime } = req.body;

    const attendance = await Attendance.findById(id).populate("workerId");
    if (!attendance) return res.status(404).json({ message: "Record not found" });

    const { totalHours, roj } = calculateHoursAndRoj(entryTime, exitTime, attendance.workerId.rojPerHour);

    attendance.entryTime = entryTime;
    attendance.exitTime = exitTime;
    attendance.totalHours = totalHours;
    attendance.dailyRoj = roj;

    await attendance.save();

    res.status(200).json({ message: "Attendance updated", attendance });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
