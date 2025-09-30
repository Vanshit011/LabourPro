import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { jsPDF } from "jspdf";

const WorkerSalary = () => {
  const [workers, setWorkers] = useState([]);
  const [workerId, setWorkerId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Auto-set to current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Auto-set to current year
  const [salaryData, setSalaryData] = useState(null);
  const [previousSalary, setPreviousSalary] = useState(null);

  const [baseSalary, setBaseSalary] = useState("");
  const [additionalAdvance, setAdditionalAdvance] = useState("");
  const [additionalLoanTaken, setAdditionalLoanTaken] = useState("");
  const [additionalLoanPaid, setAdditionalLoanPaid] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Fetch workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://labourpro-backend.onrender.com/api/worker",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log("✅ Fetched workers:", res.data);
        setWorkers(res.data);
      } catch (err) {
        console.error("❌ Error fetching workers:", err.response?.data || err.message);
      }
    };
    fetchWorkers();
  }, []);

  // ✅ Auto fetch salary and previous salary when worker/month/year changes
  useEffect(() => {
    if (workerId && month && year) {
      fetchSalary();
      fetchPreviousSalary();
    } else {
      setPreviousSalary(null);
    }
  }, [workerId, month, year]);

  // ✅ Auto-refresh on attendance added
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      if (workerId && month && year) {
        fetchSalary();
        fetchPreviousSalary();
      }
    };

    window.addEventListener("attendanceUpdated", handleAttendanceUpdate);

    return () => {
      window.removeEventListener("attendanceUpdated", handleAttendanceUpdate);
    };
  }, [workerId, month, year]);


  // Helper to get previous month/year
  const getPreviousPeriod = () => {
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear -= 1;
    }
    return { prevMonth, prevYear };
  };

  const fetchSalary = async () => {
    if (!workerId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://labourpro-backend.onrender.com/api/salary/worker/${workerId}/${month}/${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Fetched salary:", res.data);
      setSalaryData(res.data);
      setBaseSalary(res.data.baseSalary?.toString() || "");
    } catch (err) {
      setSalaryData(null);
      setBaseSalary("");
      console.warn("⚠️ No salary found for this worker/month/year");
    }
  };

  const fetchPreviousSalary = async () => {
    const { prevMonth, prevYear } = getPreviousPeriod();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://labourpro-backend.onrender.com/api/salary/worker/${workerId}/${prevMonth}/${prevYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreviousSalary(res.data);
    } catch (err) {
      setPreviousSalary(null);
      console.warn("⚠️ No previous salary found");
    }
  };

  // ✅ Refresh Salary API (attendance monthly calculation)
  const handleRefreshSalary = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No token found in localStorage");
        return;
      }

      const res = await axios.get(
        `https://labourpro-backend.onrender.com/api/attendance/monthly-salary?month=${month}&year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,   // ✅ send token
          },
        }
      );

      console.log("✅ Salary refresh triggered:", res.data);
      fetchSalary(); // refresh worker salary data
    } catch (err) {
      console.error(
        "❌ Error refreshing salary:",
        err.response?.data || err.message
      );
    }
  };

  // ✅ Add new salary (manual, if no record exists for selected month/year)
  const handleAddSalary = async () => {
    try {
      if (salaryData) {
        alert("⚠️ Salary already exists for this month/year.");
        return;
      }

      const token = localStorage.getItem("token");

      console.log("➡️ Sending request to add salary for:", {
        workerId,
        month,
        year,
        additionalAdvance,
        additionalLoanTaken,
        additionalLoanPaid,
      });

      // Add salary for next month (backend carries forward loanRemaining)
      const res = await axios.post(
        "https://labourpro-backend.onrender.com/api/salary/worker/add",
        { workerId, month, year },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("⬅️ Response from add salary API:", res.data);

      let newSalary = res.data.salary;

      // Show all properties of the salary object clearly
      console.table({
        BaseSalary: newSalary.baseSalary,
        Advance: newSalary.advance,
        LoanTaken: newSalary.loanTaken,
        LoanPaid: newSalary.loanPaid,
        LoanRemaining: newSalary.loanRemaining,
        FinalSalary: newSalary.finalSalary,
        Month: newSalary.month,
        Year: newSalary.year,
      });

      // Only send user inputs; do not touch carry-forward
      const updates = {
        advance: parseFloat(additionalAdvance) || 0,
        loanTaken: parseFloat(additionalLoanTaken) || 0,
        loanPaid: parseFloat(additionalLoanPaid) || 0,
      };

      if (updates.advance !== 0 || updates.loanTaken !== 0 || updates.loanPaid !== 0) {
        const updateRes = await axios.put(
          `https://labourpro-backend.onrender.com/api/salary/worker/${newSalary._id}/update`,
          updates,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("⬅️ Response from update salary API:", updateRes.data);
        newSalary = updateRes.data.salary;

        console.table({
          BaseSalary: newSalary.baseSalary,
          Advance: newSalary.advance,
          LoanTaken: newSalary.loanTaken,
          LoanPaid: newSalary.loanPaid,
          LoanRemaining: newSalary.loanRemaining,
          FinalSalary: newSalary.finalSalary,
          Month: newSalary.month,
          Year: newSalary.year,
        });
      }

      window.dispatchEvent(new Event("attendanceUpdated"));
      setAdditionalAdvance("");
      setAdditionalLoanTaken("");
      setAdditionalLoanPaid("");

      alert("✅ Salary Added");
      setSalaryData(newSalary);

    } catch (err) {
      console.error("❌ Error adding salary:", err.response?.data || err.message);
      alert("❌ " + (err.response?.data?.error || "Error adding salary"));
    }
  };

  // ✅ Update salary (calculate increments and send to backend)
  const handleUpdateSalary = async () => {
    try {
      if (!salaryData?._id) {
        alert("⚠️ No salary to update. Add first!");
        return;
      }

      const advanceIncrement = parseFloat(additionalAdvance) || 0;
      const loanTakenIncrement = parseFloat(additionalLoanTaken) || 0;
      const loanPaidIncrement = parseFloat(additionalLoanPaid) || 0;

      if (
        advanceIncrement === 0 &&
        loanTakenIncrement === 0 &&
        loanPaidIncrement === 0
      ) {
        alert("⚠️ No changes detected.");
        return;
      }

      // ✅ send only increments (backend already adds them)
      const updates = {
        advance: advanceIncrement,
        loanTaken: loanTakenIncrement,
        loanPaid: loanPaidIncrement,
      };

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://labourpro-backend.onrender.com/api/salary/worker/${salaryData._id}/update`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.dispatchEvent(new Event("attendanceUpdated"));

      setAdditionalAdvance("");
      setAdditionalLoanTaken("");
      setAdditionalLoanPaid("");

      alert("✅ Salary Updated");
      setSalaryData(res.data.salary);

      fetchSalary();
    } catch (err) {
      console.error("❌ Error updating salary:", err.response?.data || err.message);
      alert("❌ " + (err.response?.data?.error || "Error updating salary"));
    }
  };

  const deleteSalary = async (salaryId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this salary entry?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://labourpro-backend.onrender.com/api/salary/worker/${salaryId}/delete`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Salary entry deleted");
      fetchSalary(); // Refresh salary list
    } catch (err) {
      console.error("❌ Error deleting salary:", err.response?.data || err.message);
      alert("❌ " + (err.response?.data?.error || "Error deleting salary"));
    }
  };

  // ✅ Download PDF
  const generateWorkerSalaryPDF = (salaryData, month, year, managers = []) => {
    if (!salaryData) {
      alert("No salary data available");
      return;
    }

    const formatCurrency = (val) =>
      val !== undefined && val !== null ? `${val}` : "-";

    // Determine worker/manager name
    const personName =
      salaryData.workerName ||
      workers.find((m) => m._id === salaryData.workerId)?.name ||
      "Unknown";

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = monthNames[month - 1] || "Unknown";

    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Theme colors
    const blueColor = [0, 112, 192];
    const lightBlueColor = [240, 248, 255];
    const grayColor = [128, 128, 128];

    // Background
    doc.setFillColor(...lightBlueColor);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Outer border
    doc.setDrawColor(...blueColor);
    doc.setLineWidth(2);
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40);

    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...blueColor);
    doc.text("LabourPro Salary Slip", pageWidth / 2, 60, { align: "center" });

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(...grayColor);
    doc.text("Efficient Workforce Management", pageWidth / 2, 80, { align: "center" });

    // Employee Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...blueColor);
    doc.text("Employee Details", 40, 120);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${personName}`, 60, 150);
    doc.text(`Month/Year: ${monthName} ${year}`, 60, 175);
    doc.text(`Worker ID: ${salaryData.workerId || salaryData.managerId || "-"}`, 60, 200);

    // Separator line
    doc.setDrawColor(...blueColor);
    doc.setLineWidth(1);
    doc.line(40, 220, pageWidth - 40, 220);

    // Salary Table
    const startY = 250;
    const rowHeight = 30;
    const col1X = 60;
    const col2X = 350;
    const tableWidth = pageWidth - 100;

    const fields = [
      ["Base Salary", formatCurrency(salaryData.baseSalary)],
      ["Advance", formatCurrency(salaryData.advance)],
      ["Loan Taken", formatCurrency(salaryData.loanTaken)],
      ["Loan Paid", formatCurrency(salaryData.loanPaid)],
      ["Remaining Loan", formatCurrency((salaryData.loanTaken || 0) - (salaryData.loanPaid || 0))],
      ["Total Hours", salaryData.totalHours || "-"],
      ["Days Worked", salaryData.daysWorked || "-"],
      ["Final Salary", formatCurrency(salaryData.finalSalary)],
    ];

    // Table header
    doc.setFont("helvetica", "bold");
    doc.setFillColor(...blueColor);
    doc.rect(col1X - 20, startY - 25, tableWidth, rowHeight, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("Field", col1X, startY - 5);
    doc.text("Amount", col2X, startY - 5);

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    fields.forEach((field, i) => {
      const y = startY + i * rowHeight;

      // Alternating row colors
      doc.setFillColor(i % 2 === 0 ? 255 : lightBlueColor[0], i % 2 === 0 ? 255 : lightBlueColor[1], i % 2 === 0 ? 255 : lightBlueColor[2]);
      doc.rect(col1X - 20, y - 20, tableWidth, rowHeight, "F");

      // Borders
      doc.setDrawColor(...blueColor);
      doc.rect(col1X - 20, y - 20, tableWidth, rowHeight);

      // Text
      doc.text(field[0], col1X, y);
      doc.text(field[1]?.toString() || "-", col2X, y);
    });
    
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...grayColor);
    doc.text("Generated by LabourPro - All rights reserved", pageWidth / 2, pageHeight - 40, { align: "center" });

    // Save PDF
    const safeName = personName.replace(/\s+/g, "_");
    const fileName = `${safeName}_SalarySlip_${monthName}_${year}.pdf`;
    doc.save(fileName);
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `https://labourpro-backend.onrender.com/api/salary/downloadAllWorkers/${month}/${year}`,
        {
          responseType: "blob", // important for PDF
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Worker_Salaries_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      // console.log("✅ Download initiated");
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content (scrollable) */}
      <div className="flex-1 flex flex-col pt-14 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto space-y-8 pb-10"></div>
        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto mt-2">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center">
              <span className="mr-2 ml-9">💰</span> Salary Management
            </h2>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 space-y-4 sm:space-y-6 w-full">
              {/* Worker Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Worker</label>
                <select
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200">
                  <option value="">-- Select Worker --</option>
                  {workers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month + Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
              </div>

              {/* Salary Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Salary</label>
                  <input
                    type="number"
                    value={baseSalary}
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Advance</label>
                  <input
                    type="number"
                    value={additionalAdvance}
                    onChange={(e) => setAdditionalAdvance(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Loan Taken</label>
                  <input
                    type="number"
                    value={additionalLoanTaken}
                    onChange={(e) => setAdditionalLoanTaken(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Loan Paid</label>
                  <input
                    type="number"
                    value={additionalLoanPaid}
                    onChange={(e) => setAdditionalLoanPaid(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap justify-end gap-3">
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
                >
                  Download All Worker Salaries
                </button>

                {/* ✅ Refresh Salary Button */}
                {/* <div className="flex justify-end mb-4">
                  <button
                    onClick={handleRefreshSalary}
                    className="bg-yellow-500 text-white px-6 py-2 rounded-lg shadow hover:bg-yellow-600 transition duration-200"
                  >
                    🔄 Refresh Salary
                  </button>
                </div> */}

                {!salaryData ? (
                  <button
                    onClick={handleAddSalary}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition duration-200 flex items-center"
                  >
                    <span className="mr-2">➕</span> Add Salary
                  </button>
                ) : (
                  <button
                    onClick={handleUpdateSalary}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-200 flex items-center"
                  >
                    <span className="mr-2">✏️</span> Update Salary
                  </button>
                )}

              </div>
            </div>

            {/* Salary Details */}
            {salaryData && (
              <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="mr-2">📊</span> Salary Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-gray-800">
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Base Salary:</b> {salaryData.baseSalary}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Advance:</b> {salaryData.advance}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Loan Taken:</b> {salaryData.loanTaken}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Loan Paid:</b> {salaryData.loanPaid}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Remaining Loan:</b> {salaryData.loanRemaining ?? 0}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Final Salary:</b> {salaryData.finalSalary}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Total Hours:</b> {salaryData.totalHours}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Days Worked:</b> {salaryData.daysWorked}</p>
                </div>

                {/* ✅ Fixed Download Button */}
                <button
                  onClick={() => generateWorkerSalaryPDF(salaryData, month, year)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 transition duration-200"
                >
                  📄 Download PDF
                </button>

                <button onClick={() => deleteSalary(salaryData._id)} className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition duration-200 ml-4">
                  🗑️ Delete Salary
                </button>
                {/* {((salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)) > 0 && (
                <p className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg">
                  <b>Warning:</b> Remaining loan: {(salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)}. Cannot add new loans until cleared.
                </p>
              )} */}
                {/* {((salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)) < 0 && (
                  <p className="mt-4 text-green-600 bg-green-50 p-3 rounded-lg">
                    <b>Note:</b> Overpaid by {-((salaryData.loanTaken || 0) - (salaryData.loanPaid || 0))}.
                  </p>
                )} */}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>

  );
};

export default WorkerSalary;
