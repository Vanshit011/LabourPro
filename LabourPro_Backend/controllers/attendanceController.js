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

exports.addAttendance = async (req, res) => {
  try {
    const { worker, entryTime, exitTime } = req.body;
    const companyId = req.user.companyId;

    if (!worker || !entryTime || !exitTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const start = new Date(`1970-01-01T${entryTime}`);
    const end = new Date(`1970-01-01T${exitTime}`);

    const diffMs = end - start;
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    if (isNaN(totalHours) || totalHours <= 0) {
      return res.status(400).json({ message: "Invalid entry/exit time" });
    }

    // Fetch worker rojRate
    const workerData = await Worker.findOne({ _id: worker, companyId });
    if (!workerData) {
      return res.status(404).json({ message: "Worker not found" });
    }

    const dailyRoj = parseFloat((workerData.rojRate * totalHours).toFixed(2));

    const attendance = new Attendance({
      worker,
      entryTime,
      exitTime,
      totalHours,
      dailyRoj,
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      companyId,
    });

    await attendance.save();
    res.status(201).json({ message: "Attendance recorded", attendance });
  } catch (error) {
    console.error("❌ Error in addAttendance:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
