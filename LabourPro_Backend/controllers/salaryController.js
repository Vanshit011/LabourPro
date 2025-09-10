const Manager = require("../models/Manager");
const ManagerSalary = require("../models/ManagerSalary");
const PDFDocument = require("pdfkit");
const archiver = require("archiver");
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

    // ✅ Prevent duplicate salary for same month/year
    const exists = await ManagerSalary.findOne({ managerId, month, year });
    if (exists) {
      return res.status(400).json({ error: "Salary already exists for this month" });
    }

    // ✅ Get last month's salary (loan carry forward)
    const lastSalary = await ManagerSalary.findOne({ managerId }).sort({ year: -1, month: -1 });

    let carryForwardLoan = 0;
    if (lastSalary) {
      carryForwardLoan = lastSalary.loanRemaining > 0 ? lastSalary.loanRemaining : 0;
    }

    // ✅ Create new salary with managerName
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
      finalSalary: baseSalary - carryForwardLoan, // adjust final salary if needed
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
    const { advance = 0, loanTaken = 0, loanPaid = 0, month, year } = req.body;

    let salary = await ManagerSalary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary entry not found" });

    // ✅ Ensure loanTaken applies only to the same month/year
    if (salary.month === month && salary.year === year) {
      salary.loanTaken += loanTaken;
    }

    // Always update advance & loanPaid (they’re month-specific)
    salary.advance += advance;
    salary.loanPaid += loanPaid;

    // Recalculate remaining loan
    salary.loanRemaining = salary.loanTaken - salary.loanPaid;

    // Recalculate final salary
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

// GET /salary/:managerId/:month/:year/download
const downloadSalaryPDF = async (req, res) => {
  try {
    const { managerId, month, year } = req.params;

    const salary = await ManagerSalary.findOne({ managerId, month, year });
    if (!salary) return res.status(404).json({ error: "Salary not found" });

    const doc = new PDFDocument({ margin: 50 });

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename=Salary_${month}_${year}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text(`Salary Report`, { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Worker: ${salary.workerName}`);
    doc.text(`Month/Year: ${month}/${year}`);
    doc.text(`Base Salary: ₹${salary.baseSalary}`);
    doc.text(`Advance: ₹${salary.advance}`);
    doc.text(`Loan Taken: ₹${salary.loanTaken}`);
    doc.text(`Loan Paid: ₹${salary.loanPaid}`);
    doc.text(`Remaining Loan: ₹${(salary.loanTaken || 0) - (salary.loanPaid || 0)}`);
    doc.text(`Total Hours Worked: ${salary.totalHours}`);
    doc.text(`Days Worked: ${salary.daysWorked}`);
    doc.text(`Final Salary: ₹${salary.finalSalary}`);
    doc.moveDown();

    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

// GET /salary/:month/:year/download
// ✅ Helper: create PDF for one salary and return Buffer
const createPDFBuffer = (salary) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // 📄 Salary content
    doc.fontSize(20).text(`Salary Report`, { align: "center" });
    doc.moveDown();

    // Correctly access populated manager name
    doc.fontSize(14).text(`Manager: ${salary.managerName || salary.managerId?.name || "N/A"}`);
    doc.text(`Month/Year: ${salary.month}/${salary.year}`);
    doc.text(`Base Salary: ₹${salary.baseSalary}`);
    doc.text(`Advance: ₹${salary.advance}`);
    doc.text(`Loan Taken: ₹${salary.loanTaken}`);
    doc.text(`Loan Paid: ₹${salary.loanPaid}`);
    doc.text(`Remaining Loan: ₹${(salary.loanTaken || 0) - (salary.loanPaid || 0)}`);
    doc.text(`Final Salary: ₹${salary.finalSalary}`);
    doc.moveDown();

    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.end();
  });
};
// ✅ Main API: Download ALL salaries in ZIP
const downloadAllSalariesZIP = async (req, res) => {
  try {
    const { month, year } = req.params;

    const salaries = await ManagerSalary.find({ month, year }).populate("managerId", "name");

    if (!salaries || salaries.length === 0) {
      return res.status(404).json({ error: "No salaries found for this month/year" });
    }

    // ZIP headers
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="All_Salaries_${month}_${year}.zip"`
    );

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    // Generate PDF for each salary and append
    for (const salary of salaries) {
      const salaryData = {
        ...salary.toObject(),
        managerName: salary.managerId?.name || "N/A",
      };
      const pdfBuffer = await createPDFBuffer(salaryData);
      archive.append(pdfBuffer, {
        name: `${salaryData.managerName}_${month}_${year}.pdf`,
      });
    }

    await archive.finalize();
  } catch (err) {
    console.error("❌ ZIP Generation Error:", err);
    res.status(500).json({ error: "Failed to generate ZIP", details: err.message });
  }
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

// POST /worker-salary/recalculate
// salaryController.js
// const Salary = require("../models/WorkerSalary");

// const recalculateWorkerSalary = async (req, res) => {
//   try {
//     const { salaryId } = req.params;
//     const { newBaseSalary } = req.body; // Expect base salary in body

//     const salary = await WorkerSalary.findById(salaryId);
//     if (!salary) {
//       return res.status(404).json({ error: "Salary record not found" });
//     }

//     // Update baseSalary safely
//     if (typeof newBaseSalary === "number" && !isNaN(newBaseSalary)) {
//       salary.baseSalary = newBaseSalary;
//     }

//     // Default all numeric fields
//     const baseSalary = Number(salary.baseSalary) || 0;
//     const advance = Number(salary.advance) || 0;
//     const loanTaken = Number(salary.loanTaken) || 0;
//     const loanPaid = Number(salary.loanPaid) || 0;

//     // Recalculate final salary
//     salary.finalSalary = baseSalary - advance - loanTaken + loanPaid;

//     await salary.save();

//     res.json({
//       message: "Salary recalculated",
//       salary,
//     });
//   } catch (err) {
//     console.error("❌ Salary recalculation failed:", err);
//     res.status(500).json({ error: "Failed to recalculate salary" });
//   }
// };


module.exports = {
  addSalary,
  updateSalary,
  getSalary,
  addWorkerSalary,
  updateWorkerSalary,
  getWorkerSalary,
  // recalculateWorkerSalary,
  downloadSalaryPDF,
  downloadAllSalariesZIP
};
