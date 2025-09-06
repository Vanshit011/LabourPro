const Manager = require("../models/Manager");
const ManagerSalary = require("../models/ManagerSalary");
const mongoose = require("mongoose");

// Manager Salary Controllers
// POST /salary/add
const addSalary = async (req, res) => {
  try {
    const { managerId, month, year } = req.body;

    // ✅ Fetch Manager details
    const manager = await Manager.findById(managerId);
    if (!manager) {
      return res.status(404).json({ error: "Manager not found" });
    }

    const companyId = manager.companyId;
    const baseSalary = manager.salary;

    // ✅ Prevent duplicate salary for same month
    const exists = await ManagerSalary.findOne({ managerId, month, year });
    if (exists) {
      return res.status(400).json({ error: "Salary already exists for this month" });
    }

    // ✅ Get last month's salary (loan carry forward)
    const lastSalary = await ManagerSalary.findOne({ managerId }).sort({ year: -1, month: -1 });

    let carryForwardLoan = 0;
    if (lastSalary) {
      // Previous month’s remaining loan = oldRemaining - paid
      const adjustedRemaining = lastSalary.loanRemaining;
      carryForwardLoan = adjustedRemaining > 0 ? adjustedRemaining : 0;
    }

    // ✅ Create new salary
    const newSalary = new ManagerSalary({
      companyId,
      managerId,
      month,
      year,
      baseSalary,
      advance: 0,
      loanTaken: 0,
      loanPaid: 0,
      loanRemaining: carryForwardLoan,
      finalSalary: baseSalary, // reduce from salary
    });

    await newSalary.save();

    res.json({ message: "Salary added successfully", salary: newSalary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /salary/:id/update
const updateSalary = async (req, res) => {
  try {
    const { advance, loanTaken, loanPaid } = req.body;

    let salary = await ManagerSalary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary entry not found" });

    salary.advance += advance || 0;
    salary.loanTaken += loanTaken || 0;
    salary.loanPaid += loanPaid || 0;

    // Calculate loan remaining
    salary.loanRemaining = (salary.loanTaken) - salary.loanPaid;

    // Calculate final salary
    salary.finalSalary = salary.baseSalary - salary.advance - salary.loanPaid;

    await salary.save();

    res.json({ message: "Salary updated successfully", salary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /salary/:managerId/:month/:year
const getSalary = async (req, res) => {
  const { managerId, month, year } = req.params;
  const salary = await ManagerSalary.findOne({ managerId, month, year });
  res.json(salary);
};

// Worker Salary Controllers
// controllers/workerSalaryController.js
const Worker = require("../models/Worker");
const WorkerSalary = require("../models/WorkerSalary");
const Attendance = require("../models/Attendance");

// POST /worker-salary/add
const addWorkerSalary = async (req, res) => {
  try {
    const { workerId, month, year } = req.body;

    // Validate worker
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: "Worker not found" });
    }

    const companyId = worker.companyId;

    // Format month/year
    const monthStr = month.toString().padStart(2, "0");
    const nextMonth = (Number(month) % 12) + 1;
    const nextMonthYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
    const nextMonthStr = nextMonth.toString().padStart(2, "0");

    // Actual date objects for filtering
    const startDate = new Date(`${year}-${monthStr}-01`);
    const endDate = new Date(`${nextMonthYear}-${nextMonthStr}-01`);

    const attendanceSummary = await Attendance.aggregate([
      {
        // ✅ Convert "YYYY-MM-DD" string into Date object inside pipeline
        $addFields: {
          dateObj: { $dateFromString: { dateString: "$date" } }
        }
      },
      {
        $match: {
          companyId: companyId,
          workerId: new mongoose.Types.ObjectId(workerId), // make sure ID type matches
          dateObj: { $gte: startDate, $lt: endDate }
        }
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
    ]);

    console.log("Matched Attendance:", attendanceSummary);

    const summary =
      attendanceSummary[0] || { totalHours: 0, totalRojEarned: 0, daysWorked: 0 };

    // Prevent duplicate
    const exists = await WorkerSalary.findOne({ workerId, month, year });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Salary already exists for this worker in this month" });
    }

    // Get last month's salary for loan carryover
    const lastSalary = await WorkerSalary.findOne({ workerId }).sort({
      year: -1,
      month: -1,
    });
    let carryForwardLoan =
      lastSalary?.loanRemaining > 0 ? lastSalary.loanRemaining : 0;

    // Create new salary record
    const newSalary = new WorkerSalary({
      companyId,
      workerId,
      month,
      year,
      baseSalary: summary.totalRojEarned,
      advance: 0,
      loanTaken: 0,
      loanPaid: 0,
      loanRemaining: carryForwardLoan,
      finalSalary: summary.totalRojEarned - carryForwardLoan,
      totalHours: summary.totalHours,
      daysWorked: summary.daysWorked,
    });

    await newSalary.save();

    res.json({
      message: "Salary added successfully",
      salary: newSalary,
    });
  } catch (error) {
    console.error("Add Salary Error:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

// PUT /worker-salary/:id/update
const updateWorkerSalary = async (req, res) => {
  try {
    const { advance, loanTaken, loanPaid } = req.body;

    let salary = await WorkerSalary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary entry not found" });

    salary.advance += advance || 0;
    salary.loanTaken += loanTaken || 0;
    salary.loanPaid += loanPaid || 0;

    // Recalculate loan remaining and final salary
    salary.loanRemaining = salary.loanTaken - salary.loanPaid;
    salary.finalSalary = salary.baseSalary - salary.advance - salary.loanPaid;

    await salary.save();

    res.json({ message: "Salary updated successfully", salary });
  } catch (error) {
    console.error("Update Salary Error:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};

// GET /worker-salary/:workerId/:month/:year
const getWorkerSalary = async (req, res) => {
  const { workerId, month, year } = req.params;
  try {
    const salary = await WorkerSalary.findOne({ workerId, month, year });
    if (!salary) return res.status(404).json({ error: "Salary not found" });
    res.json(salary);
  } catch (error) {
    console.error("Get Salary Error:", error.message, error.stack);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  addSalary,
  updateSalary,
  getSalary,
  addWorkerSalary,
  updateWorkerSalary,
  getWorkerSalary
};
