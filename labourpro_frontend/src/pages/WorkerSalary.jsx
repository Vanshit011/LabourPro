import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

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

  // ✅ Add new salary (manual, if no record exists for selected month/year)
  const handleAddSalary = async () => {
    try {
      if (salaryData) {
        alert("⚠️ Salary already exists for this month/year.");
        return;
      }

      // Pre-check for attempting to add new loan when previous is incomplete
      const userLoanTakenInc = parseFloat(additionalLoanTaken) || 0;
      const prevRemaining = previousSalary ? (previousSalary.loanTaken || 0) - (previousSalary.loanPaid || 0) : 0;
      if (prevRemaining > 0 && userLoanTakenInc > 0) {
        alert("⚠️ Cannot add new loan until previous month's loan is complete.");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://labourpro-backend.onrender.com/api/salary/worker/add",
        { workerId, month, year },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      let newSalary = res.data.salary;

      // Prepare updates for carry-over and user additionals
      let updates = { advance: 0, loanTaken: 0, loanPaid: 0 };

      // Carry over previous remaining loan
      if (previousSalary && prevRemaining !== 0) {
        updates.loanTaken = prevRemaining > 0 ? prevRemaining : 0;
        updates.loanPaid = prevRemaining < 0 ? -prevRemaining : 0;
      }

      // Add user additionals (loanTaken already checked)
      updates.advance += parseFloat(additionalAdvance) || 0;
      updates.loanTaken += userLoanTakenInc;
      updates.loanPaid += parseFloat(additionalLoanPaid) || 0;

      // If there are updates, perform the update
      if (updates.advance !== 0 || updates.loanTaken !== 0 || updates.loanPaid !== 0) {
        const updateRes = await axios.put(
          `https://labourpro-backend.onrender.com/api/salary/worker/${newSalary._id}/update`,
          updates,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newSalary = updateRes.data.salary;
      }

      // After adding/updating salary
      window.dispatchEvent(new Event("attendanceUpdated"));

      // Clear additional inputs
      setAdditionalAdvance("");
      setAdditionalLoanTaken("");
      setAdditionalLoanPaid("");

      alert("✅ Salary Added");
      setSalaryData(newSalary);
      fetchSalary(); // Refresh display
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

      // Calculate increments from additional inputs
      const advanceIncrement = parseFloat(additionalAdvance) || 0;
      const loanTakenIncrement = parseFloat(additionalLoanTaken) || 0;
      const loanPaidIncrement = parseFloat(additionalLoanPaid) || 0;

      // Check if trying to add new loan when loan is not complete
      const currentRemaining = (salaryData.loanTaken || 0) - (salaryData.loanPaid || 0);
      if (currentRemaining > 0 && loanTakenIncrement > 0) {
        alert("⚠️ Cannot add new loan until current loan is complete.");
        return;
      }

      if (advanceIncrement === 0 && loanTakenIncrement === 0 && loanPaidIncrement === 0) {
        alert("⚠️ No changes detected.");
        return;
      }

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

      // After adding/updating salary
      window.dispatchEvent(new Event("attendanceUpdated"));

      // Clear additional inputs
      setAdditionalAdvance("");
      setAdditionalLoanTaken("");
      setAdditionalLoanPaid("");

      alert("✅ Salary Updated");
      setSalaryData(res.data.salary);

      // Refetch to update display with new totals
      fetchSalary();
    } catch (err) {
      console.error("❌ Error updating salary:", err.response?.data || err.message);
      alert("❌ " + (err.response?.data?.error || "Error updating salary"));
    }
  };

  // ✅ Refresh salary (recalculate based on attendance and base salary)
  const handleRefreshSalary = async () => {
  try {
    if (!workerId || !month || !year) {
      alert("⚠️ Please select worker, month, and year");
      return;
    }

    const token = localStorage.getItem("token");
    const res = await axios.post(
      "https://labourpro-backend.onrender.com/api/salary/worker/recalculate",
      { workerId, month, year },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Salary recalculated");
    setSalaryData(res.data.salary);
    setBaseSalary(res.data.salary.baseSalary.toString());

    // refresh display
    fetchSalary();
  } catch (err) {
    console.error("❌ Error refreshing salary:", err.response?.data || err.message);
    alert("❌ Failed to refresh salary");
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

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">💰</span> Salary Management
          </h2>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* Worker Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Worker</label>
              <select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              >
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
              <button
                onClick={handleRefreshSalary}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 transition duration-200 flex items-center"
              >
                <span className="mr-2">🔄</span> Refresh Salary
              </button>
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
                <p className="bg-gray-50 p-3 rounded-lg"><b>Remaining Loan:</b> {(salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)}</p>
                <p className="bg-gray-50 p-3 rounded-lg"><b>Final Salary:</b> {salaryData.finalSalary}</p>
                <p className="bg-gray-50 p-3 rounded-lg"><b>Total Hours:</b> {salaryData.totalHours}</p>
                <p className="bg-gray-50 p-3 rounded-lg"><b>Days Worked:</b> {salaryData.daysWorked}</p>
              </div>
              {((salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)) > 0 && (
                <p className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg">
                  <b>Warning:</b> Remaining loan: {(salaryData.loanTaken || 0) - (salaryData.loanPaid || 0)}. Cannot add new loans until cleared.
                </p>
              )}
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
  );
};

export default WorkerSalary;
