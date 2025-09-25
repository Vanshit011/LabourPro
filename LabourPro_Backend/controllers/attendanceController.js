const Attendance = require("../models/Attendance");
const Worker = require("../models/Worker");
const WorkerSalary = require("../models/WorkerSalary");
// const mongoose = require('mongoose');

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

    // 🛑 Check if attendance already exists for SAME worker + SAME date
    const existingAttendance = await Attendance.findOne({
      workerId,
      date,
      companyId,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: `⚠️ Attendance already exists for ${worker.name} on ${date}`,
      });
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
      companyId,
    });

    await attendance.save();

    res.status(201).json({ message: "✅ Attendance added successfully", attendance });
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
    const { entryTime, exitTime, totalHours, rojRate, totalRojEarned } = req.body;

    // Basic validation
    if (!entryTime || !exitTime) {
      return res.status(400).json({ error: "Entry and Exit times are required" });
    }

    // Fetch record
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return res.status(404).json({ error: "Attendance not found" });
    }

    // Auto-calculate if not provided
    let calcHours = totalHours;
    let calcRate = rojRate || attendance.rojRate || 50; // Default to 50 if missing
    let calcRoj = totalRojEarned;

    if (!totalHours || !totalRojEarned) {
      const start = new Date(`${attendance.date}T${entryTime}`);
      const end = new Date(`${attendance.date}T${exitTime}`);

      if (isNaN(start) || isNaN(end) || end <= start) {
        return res.status(400).json({ error: "Invalid time format or exit before entry" });
      }

      calcHours = (end - start) / (1000 * 60 * 60); // ms to hours
      calcRoj = calcHours * calcRate;
    }

    // Update fields
    attendance.entryTime = entryTime;
    attendance.exitTime = exitTime;
    attendance.totalHours = calcHours;
    attendance.rojRate = calcRate;
    attendance.totalRojEarned = calcRoj;

    // Save and respond
    const updated = await attendance.save();
    res.status(200).json({
      message: "Attendance updated successfully",
      attendance: updated,
    });
  } catch (err) {
    console.error("Update Attendance Error:", err.message, err.stack); // Log for debugging
    res.status(500).json({ error: "Server error while updating attendance", details: err.message });
  }
};

const deleteAttendance = async (req, res) => {
  try {
    // 1. Find the attendance first
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) return res.status(404).json({ msg: "Attendance not found" });

    const { workerId, month, year, hoursWorked, dayWorked, wage } = attendance;

    // 2. Delete the attendance
    await attendance.deleteOne();

    // 3. Find corresponding salary record
    let salary = await WorkerSalary.findOne({ workerId, month, year });
    if (salary) {
      // Deduct hours, days, and base salary
      salary.totalHours = Math.max(0, (salary.totalHours || 0) - (hoursWorked || 0));
      salary.daysWorked = Math.max(0, (salary.daysWorked || 0) - (dayWorked ? 1 : 0));
      salary.baseSalary = Math.max(0, (salary.baseSalary || 0) - (wage || 0));

      // Optionally recalc finalSalary
      salary.finalSalary = Math.max(
        0,
        salary.baseSalary - (salary.advance || 0) - (salary.loanTaken || 0) + (salary.loanPaid || 0)
      );

      await salary.save();
    }

    res.json({ success: true, message: "Attendance deleted and salary updated ✅", salary });
  } catch (err) {
    console.error("❌ Error deleting attendance:", err);
    res.status(500).json({ msg: "Error deleting attendance" });
  }
};

//get monthly salary summary
// const getMonthlySalary = async (req, res) => {
//   try {
//     const { month, year } = req.query;
//     const companyId = req.user.companyId;

//     // console.log("CompanyId from token:", companyId);

//     if (!month || !year) {
//       return res.status(400).json({ message: "month and year are required" });
//     }

//     // if (!mongoose.Types.ObjectId.isValid(companyId)) {
//     //   return res.status(400).json({ message: "Invalid companyId" });
//     // }
//     const monthStr = month.toString().padStart(2, "0");

//     // handle rollover (Dec → Jan next year)
//     const nextMonth = (Number(month) % 12) + 1;
//     const nextMonthYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
//     const nextMonthStr = nextMonth.toString().padStart(2, "0");

//     const summary = await Attendance.aggregate([
//       {
//         $match: {
//           companyId,
//           date: {
//             $gte: `${year}-${monthStr}-01`,
//             $lt: `${nextMonthYear}-${nextMonthStr}-01`,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: "$workerId",
//           workerName: { $first: "$workerName" },
//           totalHours: { $sum: "$totalHours" },
//           totalRojEarned: { $sum: "$totalRojEarned" },
//           daysWorked: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           workerId: "$_id",
//           workerName: 1,
//           totalHours: 1,
//           totalRojEarned: 1,
//           daysWorked: 1,
//         },
//       },
//       {
//         $sort: { workerName: 1 },
//       },
//     ]);

//     return res.json({ month, year, summary });
//   } catch (error) {
//     console.error("Monthly Salary API Error:", error.message, error.stack);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

const getMonthlySalary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const companyId = req.user.companyId;

    if (!month || !year) {
      return res.status(400).json({ message: "month and year are required" });
    }

    const monthStr = month.toString().padStart(2, "0");
    const nextMonth = (Number(month) % 12) + 1;
    const nextMonthYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
    const nextMonthStr = nextMonth.toString().padStart(2, "0");

    // Step 1: Get attendance summary
    const summary = await Attendance.aggregate([
      {
        $match: {
          companyId,
          date: {
            $gte: `${year}-${monthStr}-01`,
            $lt: `${nextMonthYear}-${nextMonthStr}-01`,
          },
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
    ]);

    // Step 2: Upsert into WorkerSalary
    const workerSalaries = [];
    for (const worker of summary) {
      // fetch existing salary if any
      let existing = await WorkerSalary.findOne({
        workerId: worker._id,
        companyId,
        month,
        year,
      });

      const baseSalary = worker.totalRojEarned;
      const totalHours = worker.totalHours;
      const daysWorked = worker.daysWorked;

      // keep previous values if exist, else 0
      const advance = existing?.advance || 0;
      const loanTaken = existing?.loanTaken || 0;
      const loanPaid = existing?.loanPaid || 0;
      const loanRemaining = existing?.loanRemaining || 0;

      // recalc final salary
      const finalSalary = baseSalary - advance - loanPaid;

      const updated = await WorkerSalary.findOneAndUpdate(
        {
          workerId: worker._id,
          companyId,
          month,
          year,
        },
        {
          $set: {
            workerName: worker.workerName,
            baseSalary,
            totalHours,
            daysWorked,
            advance,
            loanTaken,
            loanPaid,
            loanRemaining,
            finalSalary,
          },
        },
        { upsert: true, new: true }
      );

      workerSalaries.push(updated);
    }

    return res.json({
      message: "Monthly salary summary updated ✅",
      month,
      year,
      salaries: workerSalaries,
    });
  } catch (error) {
    console.error("Monthly Salary API Error:", error.message, error.stack);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  addAttendance,
  getAttendanceByDate,
  updateAttendance,
  deleteAttendance,
  getMonthlySalary,

};
