const Manager = require("../models/Manager");
const ManagerSalary = require("../models/ManagerSalary");
const PDFDocument = require("pdfkit");
// const archiver = require("archiver");
const mongoose = require("mongoose");


// Manager Salary Controllers
// ======================== ADD SALARY ========================
const addSalary = async (req, res) => {
  try {
    const { managerId, month, year } = req.body;

    // ✅ Fetch Manager
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

    // ✅ Find last month's salary for loan carry forward
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    let lastSalary = await ManagerSalary.findOne({
      managerId,
      month: prevMonth,
      year: prevYear,
    });

    // If previous month not found → fallback to latest
    if (!lastSalary) {
      lastSalary = await ManagerSalary.findOne({ managerId }).sort({ year: -1, month: -1 });
    }

    let carryForwardLoan = 0;
    if (lastSalary) {
      carryForwardLoan = lastSalary.loanRemaining > 0 ? lastSalary.loanRemaining : 0;
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
      loanRemaining: carryForwardLoan, // 🔥 auto carry forward
      finalSalary: baseSalary,
    });

    await newSalary.save();

    res.json({ message: "Salary added successfully ✅", salary: newSalary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ======================== UPDATE SALARY ========================
const updateSalary = async (req, res) => {
  try {
    const { advance = 0, loanTaken = 0, loanPaid = 0 } = req.body;

    const salary = await ManagerSalary.findById(req.params.id);
    if (!salary) {
      return res.status(404).json({ error: "Salary entry not found" });
    }

    // Convert to numbers
    const advanceVal = Number(advance) || 0;
    const loanTakenVal = Number(loanTaken) || 0;
    const loanPaidVal = Number(loanPaid) || 0;

    // ✅ Add new values to cumulative totals
    salary.advance += advanceVal;
    salary.loanTaken += loanTakenVal;
    salary.loanPaid += loanPaidVal;

    // ✅ Calculate loan remaining correctly
    // carryForward (already in salary.loanRemaining when created)
    // + total loanTaken – total loanPaid
    salary.loanRemaining =
      (salary.loanRemaining || 0) + loanTakenVal - loanPaidVal;

    // ✅ Final salary = base – advance – loanPaid
    salary.finalSalary =
      (salary.baseSalary || 0) - (salary.advance || 0) - (salary.loanPaid || 0);

    await salary.save();

    res.json({ message: "Salary updated successfully ✅", salary });
  } catch (error) {
    console.error("❌ Update Salary Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE /manager-salary/:id
const deleteManagerSalary = async (req, res) => {
  try {
    const salary = await ManagerSalary.findByIdAndDelete(req.params.id);

    if (!salary) {
      return res.status(404).json({ error: "Salary entry not found" });
    }

    res.json({ message: "Manager salary deleted successfully", salary });
  } catch (error) {
    console.error("❌ Delete Manager Salary Error:", error.message);
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
// const createPDFBuffer = (salary) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument({ margin: 40, size: "A4" });
//     const chunks = [];

//     doc.on("data", (chunk) => chunks.push(chunk));
//     doc.on("end", () => resolve(Buffer.concat(chunks)));
//     doc.on("error", reject);

//     // 🎨 HEADER (Blue Banner with LabourPro Title)
//     doc.rect(0, 0, doc.page.width, 80)
//       .fill("#1E3A8A"); // Dark blue

//     doc.fillColor("white")
//       .fontSize(26)
//       .text("LabourPro", { align: "center", valign: "center" });

//     doc.moveDown(2);

//     // 📄 Title
//     doc.fillColor("#1E3A8A")
//       .fontSize(20)
//       .text("Salary Slip", { align: "center" });
//     doc.moveDown(1);

//     // 📌 Salary Details Box
//     doc.fillColor("black")
//       .fontSize(14);

//     const details = [
//       { label: "Manager", value: salary.managerName || salary.managerId?.name || "N/A" },
//       { label: "Month/Year", value: `${salary.month}/${salary.year}` },
//       { label: "Base Salary", value: `₹${salary.baseSalary}` },
//       { label: "Advance", value: `₹${salary.advance}` },
//       { label: "Loan Taken", value: `₹${salary.loanTaken}` },
//       { label: "Loan Paid", value: `₹${salary.loanPaid}` },
//       { label: "Remaining Loan", value: `₹${(salary.loanTaken || 0) - (salary.loanPaid || 0)}` },
//       { label: "Final Salary", value: `₹${salary.finalSalary}` },
//     ];

//     // Draw details in neat format
//     details.forEach((item) => {
//       doc.font("Helvetica-Bold").text(`${item.label}: `, { continued: true });
//       doc.font("Helvetica").text(item.value);
//       doc.moveDown(0.5);
//     });

//     doc.moveDown(2);

//     // 📅 Footer
//     doc.fontSize(12)
//       .fillColor("gray")
//       .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "right" });

//     doc.moveDown(1);
//     doc.fillColor("#1E3A8A")
//       .fontSize(10)
//       .text("This is a computer-generated salary slip by LabourPro", { align: "center" });

//     doc.end();
//   });
// };

// ✅ Route to download all manager salary slips in ONE PDF
const downloadAllSalaries = async (req, res) => {
  try {
    const salaries = await ManagerSalary.find().populate("managerId", "name"); // populate manager name

    // PDF setup
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=All_Manager_Salaries.pdf");

    doc.pipe(res);

    // Loop through each salary and add a new page
    for (let i = 0; i < salaries.length; i++) {
      const salary = salaries[i];

      // 🔷 Blue Header
      doc.rect(0, 0, doc.page.width, 60).fill("#004aad");
      doc.fillColor("white").fontSize(20).text("LabourPro - Manager Salary Slip", 50, 20);

      // Reset text color
      doc.fillColor("black").fontSize(12);

      // Manager & Period
      doc.moveDown(2);
      doc.text(`Manager: ${salary.managerId?.name || "N/A"}`);
      doc.text(`Month/Year: ${salary.month}/${salary.year}`);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`);

      // Salary details
      doc.moveDown().fontSize(14).text("Salary Details", { underline: true });
      doc.moveDown(0.5);

      const details = [
        ["Base Salary", salary.baseSalary],
        ["Advance", salary.advance],
        ["Loan Taken", salary.loanTaken],
        ["Loan Paid", salary.loanPaid],
        ["Remaining Loan", (salary.loanTaken || 0) - (salary.loanPaid || 0)],
        ["Final Salary", salary.finalSalary],
      ];

      details.forEach(([label, value]) => {
        doc.fontSize(12).text(`${label}: ₹${value}`);
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).fillColor("gray").text("This is a system-generated salary slip.", {
        align: "center",
      });

      // Add page if not last
      if (i < salaries.length - 1) doc.addPage();
    }

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Error generating salary slips PDF" });
  }
}


// Worker Salary Controllers
// controllers/workerSalaryController.js
const Worker = require("../models/Worker");
const WorkerSalary = require("../models/WorkerSalary");
const Attendance = require("../models/Attendance");

// POST /worker-salary/add
const addWorkerSalary = async (req, res) => {
  try {
    const { workerId, month, year } = req.body;

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

    const startDate = new Date(`${year}-${monthStr}-01`);
    const endDate = new Date(`${nextMonthYear}-${nextMonthStr}-01`);

    const attendanceSummary = await Attendance.aggregate([
      { $addFields: { dateObj: { $dateFromString: { dateString: "$date" } } } },
      {
        $match: {
          companyId,
          workerId: new mongoose.Types.ObjectId(workerId),
          dateObj: { $gte: startDate, $lt: endDate },
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
    ]);

    const summary =
      attendanceSummary[0] || { totalHours: 0, totalRojEarned: 0, daysWorked: 0 };

    // Prevent duplicate
    const exists = await WorkerSalary.findOne({ workerId, month, year });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Salary already exists for this worker in this month" });
    }

    // Get last month’s loan balance
    const lastSalary = await WorkerSalary.findOne({ workerId }).sort({
      year: -1,
      month: -1,
    });

    let carryForwardLoan = lastSalary?.loanRemaining || 0;

    // New salary record
    const newSalary = new WorkerSalary({
      companyId,
      workerId,
      month,
      year,
      baseSalary: summary.totalRojEarned,
      advance: 0,
      loanTaken: 0,
      loanPaid: 0,
      loanRemaining: carryForwardLoan, // just carry forward
      finalSalary: summary.totalRojEarned - carryForwardLoan, // deduct only here
      totalHours: summary.totalHours,
      daysWorked: summary.daysWorked,
    });

    await newSalary.save();

    res.json({ message: "Salary added successfully", salary: newSalary });
  } catch (error) {
    console.error("Add Salary Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// PUT /worker-salary/:id/update
const updateWorkerSalary = async (req, res) => {
  try {
    const { advance = 0, loanTaken = 0, loanPaid = 0 } = req.body;

    let salary = await WorkerSalary.findById(req.params.id);
    if (!salary) return res.status(404).json({ error: "Salary entry not found" });

    // Update values
    salary.advance += advance;
    salary.loanTaken += loanTaken;

    // Adjust loanRemaining
    salary.loanRemaining += loanTaken;
    salary.loanRemaining -= loanPaid;
    if (salary.loanRemaining < 0) salary.loanRemaining = 0;

    salary.loanPaid += loanPaid;

    // Recalculate final salary
    salary.finalSalary = salary.baseSalary - salary.advance - salary.loanRemaining;

    await salary.save();

    res.json({ message: "Salary updated successfully ✅", salary });
  } catch (error) {
    console.error("Update Salary Error:", error.message);
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

// 📌 Download Worker Salary PDF
const downloadWorkerSalaryPDF = async (req, res) => {
  try {
    const { workerId, month, year } = req.params;

    // Find salary entry for this worker
    const salary = await WorkerSalary.findOne({ workerId, month, year }).populate("workerId", "name");
    if (!salary) return res.status(404).json({ error: "Salary not found" });

    const doc = new PDFDocument({ margin: 50 });

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename=WorkerSalary_${month}_${year}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    // Pipe PDF to response
    doc.pipe(res);

    // 🎨 Title
    doc.fontSize(20).text(`Worker Salary Report`, { align: "center" });
    doc.moveDown();

    // 📝 Salary details
    doc.fontSize(14).text(`Worker: ${salary.workerId?.name || "N/A"}`);
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

    // 📅 Footer
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "right" });

    doc.end();
  } catch (err) {
    console.error("❌ Worker PDF Error:", err);
    res.status(500).json({ error: "Failed to generate Worker Salary PDF" });
  }
};

// DELETE /worker-salary/:id/delete
const deleteWorkerSalary = async (req, res) => {
  try {
    const { id } = req.params;

    const salary = await WorkerSalary.findById(id);
    if (!salary) {
      return res.status(404).json({ error: "Salary entry not found" });
    }

    await WorkerSalary.findByIdAndDelete(id);

    res.json({ message: "Salary entry deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Salary Error:", error.message, error.stack);
    res.status(500).json({ error: "Failed to delete salary entry" });
  }
};

module.exports = {
  addSalary,
  updateSalary,
  getSalary,
  deleteManagerSalary,
  addWorkerSalary,
  updateWorkerSalary,
  deleteWorkerSalary,
  getWorkerSalary,
  downloadSalaryPDF,
  downloadAllSalaries,
  downloadWorkerSalaryPDF
};
