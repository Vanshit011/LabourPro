const Attendance = require("../models/Attendance");
const Worker = require("../models/Worker");
const mongoose = require('mongoose');

// Add attendance

const addAttendance = async (req, res) => {
  try {
    const { workerId, entryTime, exitTime, date } = req.body;
    const companyId = req.user.companyId;

    if (!workerId || !entryTime || !exitTime || !date) {
      return res.status(400).json({ message: "All fields required" });
    }

    // ✅ Find the worker
    const worker = await Worker.findOne({ _id: workerId, companyId });
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // ✅ Calculate total hours
    const [eh, em] = entryTime.split(":").map(Number);
    const [xh, xm] = exitTime.split(":").map(Number);
    const entry = eh * 60 + em;
    const exit = xh * 60 + xm;
    const totalMinutes = exit - entry;
    const totalHours = parseFloat((totalMinutes / 60).toFixed(2));

    // ✅ Get rojRate from worker model
    const rojRate = worker.rojPerHour || 0;
    const totalRojEarned = parseFloat((rojRate * totalHours).toFixed(2));

    // ✅ Save Attendance
    const attendance = new Attendance({
      workerId,
      workerName: worker.name,
      entryTime,
      exitTime,
      totalHours,
      rojRate,
      totalRojEarned,
      date,
      companyId
    });

    await attendance.save();

    res.status(201).json({ message: "Attendance added", attendance });

  } catch (error) {
    console.error("Add Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const companyId = req.user.companyId;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const records = await Attendance.find({ date, companyId });

    res.status(200).json({ attendance: records });
  } catch (error) {
    console.error("Get Attendance Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/attendanceController.js
const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, date, entryTime, exitTime } = req.body;

    if (!workerId || !date || !entryTime || !exitTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Parse entry and exit into Date objects
    const start = new Date(`${date}T${entryTime}`);
    const end = new Date(`${date}T${exitTime}`);

    // Calculate total hours and roj
    const totalHours = Math.max(0, Math.abs((end - start) / 36e5)); // in hours
    const roj = totalHours * 50;

    const updated = await Attendance.findByIdAndUpdate(
      id,
      {
        worker: workerId,
        date,
        entryTime,
        exitTime,
        totalHours,
        roj,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Attendance not found" });
    }

    res.status(200).json({ message: "Attendance updated", attendance: updated });
  } catch (err) {
    console.error("Update Attendance Error:", err);
    res.status(500).json({ error: "Server error while updating attendance" });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ msg: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting attendance" });
  }
};

//get monthly salary summary
const getMonthlySalary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const companyId = req.user.companyId;

    // console.log("CompanyId from token:", companyId);

    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    // if (!mongoose.Types.ObjectId.isValid(companyId)) {
    //   return res.status(400).json({ message: "Invalid companyId" });
    // }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);

    const summary = await Attendance.aggregate([
      {
        $match: {
          companyId: companyId,
          date: { $gte: `${year}-${month.toString().padStart(2, '0')}-01`, $lt: `${year}-${(month + 1).toString().padStart(2, '0')}-01` },
        },
      },
      {
        $group: {
          _id: "$workerId",
          workerName: { $first: "$workerName" },
          totalHours: { $sum: "$totalHours" },
          totalRojEarned: { $sum: "$totalRojEarned" },
          daysWorked: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          workerId: "$_id",
          workerName: 1,
          totalHours: 1,
          totalRojEarned: 1,
          daysWorked: 1,
        },
      },
      {
        $sort: { workerName: 1 },
      },
    ]);

    return res.json({ month, year, summary });
  } catch (error) {
    console.error("Monthly Salary API Error:", error.message, error.stack);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  addAttendance,
  getAttendanceByDate,
  updateAttendance,
  deleteAttendance,
  getMonthlySalary,
  
};
