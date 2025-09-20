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

// ✅ Route to download all manager salary slips in ONE PDF
const downloadAllSalaries = async (req, res) => {
  try {
    const { month, year } = req.params;

    // 🔍 Apply filters
    let filter = {};
    if (month) filter.month = month;
    if (year) filter.year = year;

    const salaries = await ManagerSalary.find(filter).populate("managerId", "name");

    if (!salaries || salaries.length === 0) {
      return res
        .status(404)
        .json({ message: "No salaries found for given month/year" });
    }

    // ✅ PDF setup
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Manager_Salaries_${month || "All"}_${year || "All"
      }.pdf`
    );
    doc.pipe(res);

    // 🔷 Header banner
    doc.rect(0, 0, doc.page.width, 60).fill("#004aad");
    doc.fillColor("white").fontSize(20).text("LabourPro - Manager Salaries", 50, 20);

    doc.moveDown(2);
    doc.fillColor("black");

    // 🔷 Title
    doc
      .fontSize(14)
      .fillColor("#004aad")
      .text(
        `Salaries for ${month ? month : "All Months"} / ${year ? year : "All Years"
        }`,
        { align: "left" }
      );

    doc.moveDown(1);

    // Table setup
    const headers = [
      "Manager",
      "Base Salary",
      "Advance",
      "Loan Taken",
      "Loan Paid",
      "Remaining Loan",
      "Final Salary",
    ];

    const startX = 40;
    const tableWidth = doc.page.width - startX * 2;
    const colWidth = tableWidth / headers.length;
    let y = doc.y + 20;

    // Draw table border (outer rectangle)
    const rowHeight = 35;
    const totalRows = salaries.length + 1; // +1 for header
    const tableHeight = totalRows * rowHeight;

    doc
      .lineWidth(1)
      .rect(startX, y, tableWidth, tableHeight)
      .stroke(); // full border

    // Draw column dividers
    for (let i = 1; i < headers.length; i++) {
      const colX = startX + i * colWidth;
      doc.moveTo(colX, y).lineTo(colX, y + tableHeight).stroke();
    }

    // Draw row dividers
    for (let j = 1; j <= totalRows; j++) {
      const rowY = y + j * rowHeight;
      doc.moveTo(startX, rowY).lineTo(startX + tableWidth, rowY).stroke();
    }

    // ✅ Table Headers
    doc.fontSize(12).fillColor("black").font("Helvetica-Bold");
    headers.forEach((header, i) => {
      doc.text(header, startX + i * colWidth + 5, y + 7, {
        width: colWidth - 10,
        align: "left",
      });
    });

    // ✅ Table Rows
    doc.font("Helvetica");
    salaries.forEach((salary, rowIndex) => {
      const values = [
        salary.managerId?.name || "N/A",
        `${salary.baseSalary || 0}`,
        `${salary.advance || 0}`,
        `${salary.loanTaken || 0}`,
        `${salary.loanPaid || 0}`,
        `${(salary.loanTaken || 0) - (salary.loanPaid || 0)}`,
        `${salary.finalSalary || 0}`,
      ];

      values.forEach((val, colIndex) => {
        doc.text(val.toString(), startX + colIndex * colWidth + 5, y + (rowIndex + 1) * rowHeight + 7, {
          width: colWidth - 10,
          align: "left",
        });
      });
    });

    // 🔷 Footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("This is a system-generated salary report.", {
        align: "center",
      });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Error generating salary slips PDF" });
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

// ✅ Download All Worker Salaries
const downloadAllWorkerSalaries = async (req, res) => {
  try {
    const { month, year } = req.params;

    let filter = {};
    if (month) filter.month = month;
    if (year) filter.year = year;

    const salaries = await WorkerSalary.find(filter).populate("workerId", "name");

    if (!salaries || salaries.length === 0) {
      return res
        .status(404)
        .json({ message: "No worker salaries found for given month/year" });
    }

    // PDF setup
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Worker_Salaries_${month || "All"}_${year || "All"}.pdf`
    );
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 60).fill("#004aad");
    doc.fillColor("white").fontSize(20).text("LabourPro - Worker Salaries", 50, 20);
    doc.moveDown(2);
    doc.fillColor("black");

    doc.fontSize(14).fillColor("#004aad").text(
      `Worker Salaries for ${month ? month : "All Months"} / ${year ? year : "All Years"}`,
      { align: "left" }
    );
    doc.moveDown(1);

    // Table setup
    const headers = [
      "Worker",
      "Base Salary",
      "Advance",
      "Loan Taken",
      "Loan Paid",
      "Remain Loan",
      "Total Hours",
      "Days Worked",
      "Final Salary",
    ];

    const startX = 40;
    const topMargin = doc.y + 20;
    const bottomMargin = 50;
    const tableWidth = doc.page.width - startX * 2;
    const colWidth = tableWidth / headers.length;
    let y = topMargin;
    const rowHeight = 35;

    const drawTableHeaders = () => {
      doc.fontSize(12).fillColor("black").font("Helvetica-Bold");
      headers.forEach((header, i) => {
        doc.text(header, startX + i * colWidth + 5, y + 7, {
          width: colWidth - 10,
          align: "left",
        });
      });

      // Draw header row border
      doc.lineWidth(1);
      doc.rect(startX, y, tableWidth, rowHeight).stroke();
      y += rowHeight;
    };

    drawTableHeaders();

    // Draw rows
    doc.font("Helvetica");
    salaries.forEach((salary, rowIndex) => {
      // Add page if exceeding
      if (y + rowHeight > doc.page.height - bottomMargin) {
        doc.addPage();
        y = topMargin;
        drawTableHeaders();
      }

      const values = [
        salary.workerId?.name || "N/A",
        `${salary.baseSalary || 0}`,
        `${salary.advance || 0}`,
        `${salary.loanTaken || 0}`,
        `${salary.loanPaid || 0}`,
        `${(salary.loanTaken || 0) - (salary.loanPaid || 0)}`,
        `${salary.totalHours || 0}`,
        `${salary.daysWorked || 0}`,
        `${salary.finalSalary || 0}`,
      ];

      // Draw outer row border
      doc.rect(startX, y, tableWidth, rowHeight).stroke();

      // Draw column dividers
      for (let i = 1; i < headers.length; i++) {
        const colX = startX + i * colWidth;
        doc.moveTo(colX, y).lineTo(colX, y + rowHeight).stroke();
      }

      // Draw cell values
      values.forEach((val, colIndex) => {
        doc.text(val.toString(), startX + colIndex * colWidth + 5, y + 7, {
          width: colWidth - 10,
          align: "left",
        });
      });

      y += rowHeight;
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).fillColor("gray").text("This is a system-generated worker salary report.", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Error generating worker salary PDF" });
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
  downloadWorkerSalaryPDF,
  downloadAllWorkerSalaries
};
