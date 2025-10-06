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
    doc.text(`Base Salary: ${salary.baseSalary}`);
    doc.text(`Advance: ${salary.advance}`);
    doc.text(`Loan Taken: ${salary.loanTaken}`);
    doc.text(`Loan Paid: ${salary.loanPaid}`);
    doc.text(`Remaining Loan: ${(salary.loanTaken || 0) - (salary.loanPaid || 0)}`);
    doc.text(`Total Hours Worked: ${salary.totalHours}`);
    doc.text(`Days Worked: ${salary.daysWorked}`);
    doc.text(`Final Salary: ${salary.finalSalary}`);
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

    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = year;

    const salaries = await ManagerSalary.find(filter).populate('managerId', 'name');
    if (!salaries || salaries.length === 0) {
      return res.status(404).json({ message: 'No salaries found for given month/year' });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Manager_Salaries_${month || 'All'}_${year || 'All'}.pdf`
    );
    doc.pipe(res);

    // Page header bar
    doc.rect(0, 0, doc.page.width, 60).fill('#004aad');
    doc.fillColor('white').fontSize(20).text('LabourPro - Manager Salaries', 50, 20);
    doc.moveDown(2);
    doc.fillColor('#004aad')
      .fontSize(14)
      .text(`Salaries for ${month || 'All Months'} / ${year || 'All Years'}`, 50);
    doc.moveDown(1);

    // Layout constants
    const startY = doc.y;
    const rowHeight = 25;
    const colWidth = (doc.page.width - 100) / 2; // two columns
    const labelWidth = 120;
    const leftX = 50;
    const rightX = leftX + colWidth + 10;
    const headerSafeTop = 80; // keep content below blue header band
    const bottomMargin = doc.page.margins.bottom || 40;

    let y = startY;
    let isLeft = true;

    const totals = {
      base: 0,
      advance: 0,
      loanTaken: 0,
      loanPaid: 0,
      remaining: 0,
      final: 0,
    };

    // Render managers in two columns, page-break aware
    salaries.forEach((salary) => {
      const managerHeight = 6 * rowHeight + 20; // 5 rows + final row + title gap

      // If starting left column and not enough space, new page
      if (isLeft && y + managerHeight > doc.page.height - bottomMargin - 80) {
        doc.addPage();
        y = headerSafeTop;
      }

      const currentX = isLeft ? leftX : rightX;

      // Manager title
      doc.fontSize(12).fillColor('#004aad').font('Helvetica-Bold')
        .text(`Manager: ${salary.managerId?.name || 'N/A'}`, currentX, y);

      const tableY = y + 20;

      const managerData = [
        ['Base Salary', salary.baseSalary || 0],
        ['Advance', salary.advance || 0],
        ['Loan Taken', salary.loanTaken || 0],
        ['Loan Paid', salary.loanPaid || 0],
        ['Remaining Loan', (Number(salary.loanTaken || 0) - Number(salary.loanPaid || 0))],
      ];

      // Outer table box (includes final salary row)
      doc.lineWidth(1)
        .rect(currentX, tableY, colWidth, managerData.length * rowHeight + rowHeight)
        .stroke();

      // Body rows
      managerData.forEach((row, rIndex) => {
        const rowY = tableY + rIndex * rowHeight;
        // row line
        doc.moveTo(currentX, rowY).lineTo(currentX + colWidth, rowY).stroke();
        // middle vertical
        doc.moveTo(currentX + labelWidth, rowY)
          .lineTo(currentX + labelWidth, rowY + rowHeight).stroke();
        // text
        doc.font('Helvetica').fillColor('black');
        doc.text(row[0], currentX + 5, rowY + 7, { width: labelWidth - 10 });
        doc.text(
          (row[1] ?? 0).toString(),
          currentX + labelWidth + 5,
          rowY + 7,
          { width: colWidth - labelWidth - 10 }
        );
      });

      // Final Salary row
      const finalRowY = tableY + managerData.length * rowHeight;
      doc.moveTo(currentX, finalRowY).lineTo(currentX + colWidth, finalRowY).stroke();
      doc.moveTo(currentX + labelWidth, finalRowY)
        .lineTo(currentX + labelWidth, finalRowY + rowHeight).stroke();

      doc.font('Helvetica-Bold').fillColor('#004aad');
      doc.text('Final Salary', currentX + 5, finalRowY + 7, { width: labelWidth - 10 });
      doc.text(
        (salary.finalSalary || 0).toString(),
        currentX + labelWidth + 5,
        finalRowY + 7,
        { width: colWidth - labelWidth - 10 }
      );

      // Update totals
      totals.base += salary.baseSalary || 0;
      totals.advance += salary.advance || 0;
      totals.loanTaken += salary.loanTaken || 0;
      totals.loanPaid += salary.loanPaid || 0;
      totals.remaining += (Number(salary.loanTaken || 0) - Number(salary.loanPaid || 0));
      totals.final += salary.finalSalary || 0;

      // Advance Y only when we have filled both columns for the row
      if (!isLeft) y += managerHeight + 20;
      isLeft = !isLeft;
    });

    // ===== Grand Total anchored to bottom of page, without overlap =====
    const headers = [
      'Base Salary',
      'Advance',
      'Loan Taken',
      'Loan Paid',
      'Remaining Loan',
      'Final Salary',
    ];
    const totalColWidth = doc.page.width - 100; // 50 left + 50 right
    const colWidthTotal = totalColWidth / (headers.length + 1);
    const titleH = 25;
    const totalsBlockH = titleH + rowHeight * 2;

    // If remaining space is too small, add a fresh page
    const remaining = doc.page.height - bottomMargin - doc.y;
    if (remaining < totalsBlockH + 10) {
      doc.addPage();
      doc.y = headerSafeTop;
    }

    // Compute top so the block bottom sits at page bottom
    let totalsTopY = doc.page.height - bottomMargin - totalsBlockH;

    // Ensure it doesn't overlap the current flow or header band
    if (totalsTopY < Math.max(doc.y, headerSafeTop)) {
      doc.addPage();
      doc.y = headerSafeTop;
      totalsTopY = doc.page.height - bottomMargin - totalsBlockH;
    }

    // Title
    doc.fontSize(10).fillColor('#004aad').font('Helvetica-Bold')
      .text('Grand Salary Summary', 50, totalsTopY);

    let yTotals = totalsTopY + titleH;

    // Outer box for 2 rows (headers + values)
    doc.lineWidth(1).rect(50, yTotals, totalColWidth, rowHeight * 2).stroke();

    // Vertical separators
    for (let i = 1; i <= headers.length; i++) {
      const colX = 50 + i * colWidthTotal;
      doc.moveTo(colX, yTotals).lineTo(colX, yTotals + rowHeight * 2).stroke();
    }

    // Header row
    doc.font('Helvetica-Bold').fillColor('black');
    doc.text('TOTAL', 55, yTotals + 7, { width: colWidthTotal - 10 });
    headers.forEach((header, i) => {
      doc.text(header, 55 + (i + 1) * colWidthTotal, yTotals + 7, { width: colWidthTotal - 10 });
    });

    // Values row (blue)
    const totalRowY = yTotals + rowHeight;
    doc.rect(50, totalRowY, totalColWidth, rowHeight).fill('#004aad');
    doc.lineWidth(1).rect(50, totalRowY, totalColWidth, rowHeight).stroke();
    for (let i = 1; i <= headers.length; i++) {
      const colX = 50 + i * colWidthTotal;
      doc.moveTo(colX, totalRowY).lineTo(colX, totalRowY + rowHeight).stroke();
    }

    doc.font('Helvetica-Bold').fillColor('white');
    doc.text('TOTAL', 55, totalRowY + 7, { width: colWidthTotal - 10 });

    const totalValues = [
      totals.base,
      totals.advance,
      totals.loanTaken,
      totals.loanPaid,
      totals.remaining,
      totals.final,
    ];

    totalValues.forEach((val, i) => {
      doc.text(String(val ?? 0), 55 + (i + 1) * colWidthTotal, totalRowY + 7, {
        width: colWidthTotal - 10,
      });
    });

    // Optional footer note centered above bottom margin
    doc.fontSize(10).fillColor('gray')
      .text(
        'This is a system-generated salary report.',
        50,
        doc.page.height - bottomMargin - 12,
        { width: totalColWidth, align: 'center' }
      );

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Error generating salary slips PDF' });
  }
};


// Worker Salary Controllers
// controllers/workerSalaryController.js
const Worker = require("../models/Worker");
const WorkerSalary = require("../models/WorkerSalary");
const Attendance = require("../models/Attendance");

// Your add salary function extracted from API
const addWorkerSalary = async (req, res) => {
  try {
    let { month, year } = req.body;

    if (!month || !year)
      return res.status(400).json({ message: "Month and Year are required" });

    month = Number(month);
    year = Number(year);

    const workers = await Worker.find();
    const addedSalaries = []; // Store all created salary objects

    for (const worker of workers) {
      const workerId = worker._id;
      const companyId = worker.companyId;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const attendanceSummary = await Attendance.aggregate([
        {
          $match: {
            companyId,
            workerId: new mongoose.Types.ObjectId(workerId),
            date: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: "$workerId",
            workerName: { $first: "$workerName" },
            totalHours: { $sum: { $ifNull: ["$totalHours", 0] } },
            totalRojEarned: { $sum: { $ifNull: ["$totalRojEarned", 0] } },
            daysWorked: { $sum: 1 },
          },
        },
      ]);

      const summary =
        attendanceSummary[0] || {
          workerName: worker.name || "Unknown",
          totalHours: 0,
          totalRojEarned: 0,
          daysWorked: 0,
        };

      // Skip if salary exists
      const exists = await WorkerSalary.findOne({ workerId, month, year });
      if (exists) continue;

      const lastSalary = await WorkerSalary.findOne({ workerId }).sort({
        year: -1,
        month: -1,
      });
      const carryForwardLoan = lastSalary?.loanRemaining || 0;

      const newSalary = new WorkerSalary({
        companyId,
        workerId,
        month,
        year,
        workerName: summary.workerName,
        baseSalary: summary.totalRojEarned,
        hoursWorked: summary.totalHours,
        daysWorked: summary.daysWorked,
        advance: 0,
        loanTaken: 0,
        loanPaid: 0,
        loanRemaining: carryForwardLoan,
        finalSalary: summary.totalRojEarned,
      });

      const savedSalary = await newSalary.save();
      addedSalaries.push(savedSalary);
    }

    res.status(200).json({
      message: `Salaries added for ${month}/${year}`,
      salaries: addedSalaries, // Return all newly created salaries
    });
  } catch (err) {
    console.error("💥 Auto Salary Error:", err);
    res.status(500).json({ message: "Error adding salaries", error: err.message });
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
    salary.finalSalary = salary.baseSalary - salary.advance - salary.loanPaid;

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
    doc.text(`Base Salary: ${salary.baseSalary}`);
    doc.text(`Advance: ${salary.advance}`);
    doc.text(`Loan Taken: ${salary.loanTaken}`);
    doc.text(`Loan Paid: ${salary.loanPaid}`);
    doc.text(`Remaining Loan: ${(salary.loanTaken || 0) - (salary.loanPaid || 0)}`);
    doc.text(`Total Hours Worked: ${salary.totalHours}`);
    doc.text(`Days Worked: ${salary.daysWorked}`);
    doc.text(`Final Salary: ${salary.finalSalary}`);
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
// Generate A4 PDF with two compact worker tables per row and a grand totals table
const downloadAllWorkerSalaries = async (req, res) => {
  try {
    const { month, year } = req.params;

    const filter = {};
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

    // Layout constants
    const margin = 40;
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const printableWidth = pageWidth - margin * 2;
    const headerBandH = 60;
    const bottomMargin = doc.page.margins.bottom || margin;

    // Header band
    doc.rect(0, 0, pageWidth, headerBandH).fill("#004aad");
    doc.fillColor("white").fontSize(20).text("LabourPro - Worker Salaries", margin + 10, 20);

    const subtitleY = headerBandH + 8;
    doc.fillColor("#004aad")
      .fontSize(14)
      .text(
        `Worker Salaries for ${month || "All Months"} / ${year || "All Years"}`,
        margin + 10,
        subtitleY
      );

    const safeTop = subtitleY + 18;
    let y = safeTop;

    // Table layout
    const rowH = 24;
    const labelColW = 120;
    const valueColW = 125;
    const tableW = labelColW + valueColW;
    const gapX = 15;
    const leftX = margin + 10; // 50
    const rightX = leftX + tableW + gapX; // 310
    const textOffsetY = Math.floor((rowH - 10) / 2);

    // Totals
    const totals = {
      base: 0,
      advance: 0,
      loanTaken: 0,
      loanPaid: 0,
      remaining: 0,
      totalHours: 0,
      daysWorked: 0,
      final: 0,
    };

    let placeLeft = true;
    salaries.forEach((salary, idx) => {
      const rows = [
        ["Base Salary", salary.baseSalary || 0],
        ["Advance", salary.advance || 0],
        ["Loan Taken", salary.loanTaken || 0],
        ["Loan Paid", salary.loanPaid || 0],
        [
          "Remaining Loan",
          (salary.loanRemaining || 0),
        ],
        ["Total Hours", salary.totalHours || 0],
        ["Days Worked", salary.daysWorked || 0],
        ["Final Salary", salary.finalSalary || 0],
      ];

      const tableH = rows.length * rowH + 16;

      if (y < safeTop) y = safeTop;

      if (placeLeft && y + tableH > pageHeight - bottomMargin - 40) {
        doc.addPage();
        doc.fillColor("#004aad")
          .fontSize(14)
          .text(
            `Worker Salaries for ${month || "All Months"} / ${year || "All Years"}`,
            margin + 10,
            subtitleY
          );
        y = safeTop;
      }

      const x = placeLeft ? leftX : rightX;

      // Worker header (smaller, blue, bold)
      doc.fontSize(11).fillColor("#004aad").font("Helvetica-Bold")
        .text(`Worker: ${salary.workerId?.name || "N/A"}`, x, y);

      const tableTop = y + 18; // space between name and table

      // Outer table border (3px thick)
      doc.lineWidth(3).strokeColor("black")
        .rect(x, tableTop, tableW, rows.length * rowH).stroke();

      // Inner rows and vertical lines (1px thin)
      rows.forEach((row, rIdx) => {
        const rowY = tableTop + rIdx * rowH;

        // horizontal line
        doc.lineWidth(1).moveTo(x, rowY).lineTo(x + tableW, rowY).stroke();

        // vertical split
        doc.moveTo(x + labelColW, rowY).lineTo(x + labelColW, rowY + rowH).stroke();

        // text (smaller font)
        doc.font("Helvetica").fillColor("black").fontSize(9);
        doc.text(row[0], x + 5, rowY + textOffsetY, { width: labelColW - 10, align: "left" });
        doc.text(String(row[1]), x + labelColW + 5, rowY + textOffsetY, { width: valueColW - 10, align: "left" });
      });



      // Totals calc
      totals.base += salary.baseSalary || 0;
      totals.advance += salary.advance || 0;
      totals.loanTaken += salary.loanTaken || 0;
      totals.loanPaid += salary.loanPaid || 0;
      totals.remaining += (salary.loanRemaining || 0);
      totals.totalHours += salary.totalHours || 0;
      totals.daysWorked += salary.daysWorked || 0;
      totals.final += salary.finalSalary || 0;

      // When both left+right filled → add line
      if (!placeLeft) {
        y += rows.length * rowH + 20;
        doc.lineWidth(2).strokeColor("black");
        doc.moveTo(leftX, y - 10).lineTo(pageWidth - margin, y - 10).stroke();
        y += 15;
      }

      // If last worker is left-only
      if (idx === salaries.length - 1 && placeLeft) {
        y += rows.length * rowH + 20;
        doc.lineWidth(2).strokeColor("black");
        doc.moveTo(leftX, y - 10).lineTo(pageWidth - margin, y - 10).stroke();
        y += 15;
      }

      placeLeft = !placeLeft;
    });

    // ===== Totals =====
    const titleH = 20;
    const totalsRowH = 30;
    const totalsBlockH = titleH + totalsRowH * 2 + 6;

    if (y + totalsBlockH > pageHeight - bottomMargin) {
      doc.addPage();
      doc.fillColor("#004aad")
        .fontSize(14)
        .text(
          `Worker Salaries for ${month || "All Months"} / ${year || "All Years"}`,
          margin + 10,
          subtitleY
        );
      y = safeTop;
    }

    doc.fontSize(12).fillColor("#004aad").font("Helvetica-Bold")
      .text("Grand Worker Salary Summary", margin + 10, y);
    y += titleH;

    const totalsX = margin + 10;
    const totalsW = printableWidth - 20;
    const headers = [
      "Salary",
      "Advance",
      "Loan Taken",
      "Loan Paid",
      "Remaining Loan",
      "Total Hours",
      "Days Worked",
      "Final Salary",
    ];
    const colW = totalsW / (headers.length + 1);
    const headFont = 9;
    const valFont = 10;
    const headOffsetY = Math.floor((totalsRowH - headFont) / 2);
    const valOffsetY = Math.floor((totalsRowH - valFont) / 2);

    doc.lineWidth(1).rect(totalsX, y, totalsW, totalsRowH * 2).stroke();

    for (let i = 1; i <= headers.length; i++) {
      const colX = totalsX + i * colW;
      doc.moveTo(colX, y).lineTo(colX, y + totalsRowH * 2).stroke();
    }

    doc.font("Helvetica-Bold").fillColor("black").fontSize(headFont);
    doc.text("TOTAL", totalsX + 6, y + headOffsetY, {
      width: colW - 12,
      align: "left",
    });
    headers.forEach((header, i) => {
      doc.text(header, totalsX + (i + 1) * colW + 6, y + headOffsetY, {
        width: colW - 12,
        align: "left",
      });
    });

    const totalRowY = y + totalsRowH;
    doc.rect(totalsX, totalRowY, totalsW, totalsRowH).fill("#004aad");
    doc.lineWidth(1).rect(totalsX, totalRowY, totalsW, totalsRowH).stroke();
    for (let i = 1; i <= headers.length; i++) {
      const colX = totalsX + i * colW;
      doc.moveTo(colX, totalRowY).lineTo(colX, totalRowY + totalsRowH).stroke();
    }

    doc.font("Helvetica-Bold").fillColor("white").fontSize(valFont);
    doc.text("TOTAL", totalsX + 6, totalRowY + valOffsetY, {
      width: colW - 12,
      align: "left",
    });

    const totalValues = [
      totals.base,
      totals.advance,
      totals.loanTaken,
      totals.loanPaid,
      totals.remaining,
      totals.totalHours,
      totals.daysWorked,
      totals.final,
    ];
    totalValues.forEach((val, i) => {
      doc.text(String(val ?? 0), totalsX + (i + 1) * colW + 6, totalRowY + valOffsetY, {
        width: colW - 12,
        align: "left",
      });
    });

    doc.fontSize(9).fillColor("gray")
      .text("This is a system-generated worker salary report.", margin, pageHeight - bottomMargin - 12, {
        width: printableWidth,
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
