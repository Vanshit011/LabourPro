import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { jsPDF } from "jspdf";

const ManagerSalary = () => {
  const [allManagerSalaries, setAllManagerSalaries] = useState([]);

  const [managers, setManagers] = useState([]);
  const [managerId, setManagerId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Auto-set to current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Auto-set to current year
  const [salaryData, setSalaryData] = useState(null);
  const [previousSalary, setPreviousSalary] = useState(null);

  const [baseSalary, setBaseSalary] = useState("");
  const [additionalAdvance, setAdditionalAdvance] = useState("");
  const [additionalLoanTaken, setAdditionalLoanTaken] = useState("");
  const [additionalLoanPaid, setAdditionalLoanPaid] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ✅ Fetch managers
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://labourpro-backend.onrender.com/api/worker/getManager",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setManagers(res.data);
      } catch (err) {
        console.error("❌ Error fetching managers:", err.response?.data || err.message);
      }
    };
    fetchManagers();
  }, []);

  // ✅ Auto fetch salary and previous salary when manager/month/year changes
  useEffect(() => {
    if (managerId && month && year) {
      fetchSalary();
      fetchPreviousSalary();
    } else {
      setPreviousSalary(null);
    }
  }, [managerId, month, year]);

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
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `https://labourpro-backend.onrender.com/api/salary/${managerId}/${month}/${year}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Round finalSalary
    let salaryData = res.data;
    if (salaryData?.finalSalary !== undefined && salaryData?.finalSalary !== null) {
      salaryData.finalSalary = Math.round(salaryData.finalSalary);
    }

    setSalaryData(salaryData);
    setBaseSalary(salaryData.baseSalary?.toString() || "");
  } catch (err) {
    setSalaryData(null);
    setBaseSalary("");
    console.warn("⚠️ No salary found for this manager/month/year");
  }
};

  const fetchPreviousSalary = async () => {
    const { prevMonth, prevYear } = getPreviousPeriod();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://labourpro-backend.onrender.com/api/salary/${managerId}/${prevMonth}/${prevYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreviousSalary(res.data);
    } catch (err) {
      setPreviousSalary(null);
      console.warn("⚠️ No previous salary found");
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

      // Step 1: Add salary
      const res = await axios.post(
        "https://labourpro-backend.onrender.com/api/salary/add",
        { managerId, month, year },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let newSalary = res.data.salary;

      // Step 2: Prepare updates (advance/loan adjustments only)
      let updates = { advance: 0, loanTaken: 0, loanPaid: 0 };

      // Carry over previous remaining loan
      if (previousSalary) {
        const prevRemaining = (previousSalary.loanTaken || 0) - (previousSalary.loanPaid || 0);
        if (prevRemaining !== 0) {
          updates.loanTaken = prevRemaining > 0 ? prevRemaining : 0;
          updates.loanPaid = prevRemaining < 0 ? -prevRemaining : 0;
        }
      }

      // Add user inputs
      updates.advance += parseFloat(additionalAdvance) || 0;
      updates.loanTaken += parseFloat(additionalLoanTaken) || 0;
      updates.loanPaid += parseFloat(additionalLoanPaid) || 0;

      // Step 3: Update salary
      if (updates.advance !== 0 || updates.loanTaken !== 0 || updates.loanPaid !== 0) {
        const updateRes = await axios.put(
          `https://labourpro-backend.onrender.com/api/salary/${newSalary._id}/update`,
          updates,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newSalary = updateRes.data.salary;
      }

      // Step 4: Refresh UI
      window.dispatchEvent(new Event("attendanceUpdated"));
      setAdditionalAdvance("");
      setAdditionalLoanTaken("");
      setAdditionalLoanPaid("");

      alert("✅ Manager Salary Added");
      setSalaryData(newSalary);
      fetchSalary();
    } catch (err) {
      console.error("❌ Error adding manager salary:", err.response?.data || err.message);
      alert("❌ " + (err.response?.data?.error || "Error adding manager salary"));
    }
  };

  // ✅ Update salary (calculate increments and send to backend)
  const handleUpdateSalary = async () => {
    try {
      if (!salaryData?._id) {
        alert("⚠️ No salary to update. Add first!");
        return;
      }

      // ✅ Parse inputs safely
      const advanceIncrement = Number(additionalAdvance) || 0;
      const loanTakenIncrement = Number(additionalLoanTaken) || 0;
      const loanPaidIncrement = Number(additionalLoanPaid) || 0;

      // ✅ Block empty updates
      if (
        advanceIncrement === 0 &&
        loanTakenIncrement === 0 &&
        loanPaidIncrement === 0
      ) {
        alert("⚠️ No changes detected.");
        return;
      }

      // ✅ Prepare request body
      const updates = {
        advance: advanceIncrement,
        loanTaken: loanTakenIncrement,
        loanPaid: loanPaidIncrement,
        month: salaryData.month,
        year: salaryData.year,
      };

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://labourpro-backend.onrender.com/api/salary/${salaryData._id}/update`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Reset form fields
      setAdditionalAdvance("");
      setAdditionalLoanTaken("");
      setAdditionalLoanPaid("");

      // ✅ Updated salary from backend
      const updatedSalary = res.data.salary;

      // ✅ Recalculate final salary on frontend
      const recalculatedFinalSalary =
        (updatedSalary.baseSalary || 0) -
        (updatedSalary.advance || 0) -
        (updatedSalary.loanPaid || 0);

      updatedSalary.finalSalary = recalculatedFinalSalary;

      // ✅ Update state
      setSalaryData(updatedSalary);

      // ✅ Show success
      alert("✅ Manager Salary Updated");

      // ✅ Refresh from backend (optional, only if you want latest DB values)
      fetchSalary();
    } catch (err) {
      console.error("❌ Error updating salary:", err.response?.data || err.message);
      alert("❌ " + (err.response?.data?.error || "Error updating manager salary"));
    }
  };

  // ✅ Delete salary
  const deleteSalary = async (salaryId) => {
    if (!window.confirm("⚠️ Are you sure you want to delete this salary entry?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `https://labourpro-backend.onrender.com/api/salary/manager/${salaryId}/delete`,
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
  const handleDownloadPDF = (salaryData, month, year) => {
    if (!salaryData) {
      alert("No salary data available");
      return;
    }

    const formatCurrency = (val) =>
      val !== undefined && val !== null ? `${val}` : "-";

    const personName =
      salaryData.workerName ||
      managers.find((m) => m._id === salaryData.managerId)?.name ||
      "Unknown";

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthName = monthNames[month - 1] || "Unknown";

    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Blue and white theme colors
    const blueColor = [0, 112, 192]; // RGB for blue
    const lightBlueColor = [240, 248, 255]; // Light blue for accents
    const grayColor = [128, 128, 128]; // For text

    // Background (white by default, add subtle blue gradient or border)
    doc.setFillColor(...lightBlueColor);
    doc.rect(0, 0, pageWidth, pageHeight, "F"); // Light blue background for entire page

    // Outer border in blue
    doc.setDrawColor(...blueColor);
    doc.setLineWidth(2);
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40); // Border around content

    // ✅ Title with LabourPro branding
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...blueColor);
    doc.text("LabourPro Salary Slip", pageWidth / 2, 60, { align: "center" });

    // Subtitle or tagline
    doc.setFontSize(12);
    doc.setTextColor(...grayColor);
    doc.text("Efficient Workforce Management", pageWidth / 2, 80, { align: "center" });

    // ✅ Employee details section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...blueColor);
    doc.text("Employee Details", 40, 120);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0); // Black for details
    doc.text(`Name: ${personName}`, 60, 150);
    doc.text(`Month/Year: ${monthName} ${year}`, 60, 175);
    doc.text(`Manager ID: ${salaryData.workerId || salaryData.managerId || "-"}`, 60, 200);

    // Horizontal line separator
    doc.setDrawColor(...blueColor);
    doc.setLineWidth(1);
    doc.line(40, 220, pageWidth - 40, 220);

    // ✅ Salary fields table
    const startY = 250;
    const rowHeight = 30;
    const col1X = 60;
    const col2X = 350;
    const tableWidth = pageWidth - 100;

    const fields = [
      ["Base Salary", formatCurrency(salaryData.baseSalary) || "-"],
      ["Advance", formatCurrency(salaryData.advance) || "-"],
      ["Loan Taken", formatCurrency(salaryData.loanTaken) || "-"],
      ["Loan Paid", formatCurrency(salaryData.loanPaid) || "-"],
      ["Remaining Loan", formatCurrency((salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)) || "-"],
      ["Final Salary", formatCurrency(salaryData.finalSalary)],
    ];

    // Table header
    doc.setFont("helvetica", "bold");
    doc.setFillColor(...blueColor);
    doc.rect(col1X - 20, startY - 25, tableWidth, rowHeight, "F");
    doc.setTextColor(255, 255, 255); // White text on blue
    doc.text("Field", col1X, startY - 5);
    doc.text("Amount", col2X, startY - 5);

    // Table rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    fields.forEach((field, i) => {
      const y = startY + i * rowHeight;

      // Alternating row shading (white and light blue)
      if (i % 2 === 0) {
        doc.setFillColor(255, 255, 255); // White
      } else {
        doc.setFillColor(...lightBlueColor); // Light blue
      }
      doc.rect(col1X - 20, y - 20, tableWidth, rowHeight, "F");

      // Borders
      doc.setDrawColor(...blueColor);
      doc.rect(col1X - 20, y - 20, tableWidth, rowHeight);

      // Text
      doc.text(field[0], col1X, y);
      doc.text(field[1]?.toString() || "-", col2X, y);
    });

    // ✅ Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...grayColor);
    doc.text("Generated by LabourPro - All rights reserved", pageWidth / 2, pageHeight - 40, { align: "center" });

    // ✅ Save with proper file name
    const safeName = personName.replace(/\s+/g, "_");
    const fileName = `${safeName}_SalarySlip_${monthName}_${year}.pdf`;

    doc.save(fileName);
  };

  // ✅ Download all slips for selected month/year
  // const DownloadAllSlips = async () => {
  //   try {
  //     const response = await axios.get(
  //       "https://labourpro-backend.onrender.com/api/salary/downloadAll/" + month + "/" + year,
  //       { responseType: "blob" } // 👈 required for binary (PDF)
  //     );

  //     const blob = new Blob([response.data], { type: "application/pdf" });
  //     const url = window.URL.createObjectURL(blob);
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "All_Manager_Salaries.pdf");
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     window.URL.revokeObjectURL(url);


  //     console.log("✅ PDF downloaded successfully");
  //   } catch (err) {
  //     console.error("❌ Error downloading all salary slips:", err);
  //   }
  // };

  // ✅ Download all slips for selected month/year
  // const handleDownloadAllPDF = async () => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     const response = await axios.get(
  //       `https://labourpro-backend.onrender.com/api/salary/downloadAll/${month}/${year}`,
  //       {
  //         responseType: "blob", // 👈 important for PDF binary
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     // Create a Blob for the file
  //     const blob = new Blob([response.data], { type: "application/pdf" });
  //     const url = window.URL.createObjectURL(blob);

  //     // Create link and trigger download
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", `All_Manager_Salaries_${month}_${year}.pdf`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();

  //     window.URL.revokeObjectURL(url);

  //     console.log("✅ All Manager Slips PDF downloaded successfully");
  //   } catch (err) {
  //     console.error("❌ Error downloading all salary slips:", err);
  //     alert("❌ Could not download all salary slips. Check API/server.");
  //   }
  // };

  // const handleDownloadAll = async (month, year) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await axios.get(
  //       `https://labourpro-backend.onrender.com/api/salary/downloadAll/${month}/${year}`,
  //       {
  //         responseType: "blob",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     // Create a blob URL and trigger download
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", `All_Salaries_${month}_${year}.pdf`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     // Optionally: Revoke object URL after download
  //     setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //     alert("Failed to download. Please try again.");
  //   }
  // };


  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://labourpro-backend.onrender.com/api/salary/downloadAll/${month}/${year}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob", // crucial for PDF download!
        }
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Manager_Salaries_${month}_${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => window.URL.revokeObjectURL(url), 1000); // delayed cleanup (for better browser compatibility)
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download PDF. Check console for details.");
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
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
              {/* Manager Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                >
                  <option value="">-- Select Manager --</option>
                  {managers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleDownload}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Download All Manager Salaries
                </button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-gray-800">
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Base Salary:</b> {salaryData.baseSalary}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Advance:</b> {salaryData.advance}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Loan Taken:</b> {salaryData.loanTaken}</p>
                  <p className="bg-gray-50 p-3 rounded-lg"><b>Loan Paid:</b> {salaryData.loanPaid}</p>
                  <p className="bg-gray-50 p-3 rounded-lg">
                    <b>Remaining Loan:</b> {(salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)}
                  </p>
                  <p className="bg-gray-50 p-3 rounded-lg">
                    <b>Final Salary:</b>{" "}
                    {(salaryData.baseSalary || 0) - (salaryData.advance || 0) - (salaryData.loanPaid || 0)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadPDF(salaryData, month, year)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 transition duration-200"
                >
                  📄 Download PDF
                </button>
                {/* <button
                  onClick={() => deleteSalary(salaryData._id)}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition duration-200 ml-4"
                >
                  🗑️ Delete Salary
                </button> */}

                {((salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)) < 0 && (
                  <p className="mt-4 text-green-600 bg-green-50 p-3 rounded-lg">
                    <b>Note:</b> Overpaid by {-((salaryData.loanTaken || 0) - (salaryData.loanPaid || 0))}.
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>

  );
};

export default ManagerSalary;
