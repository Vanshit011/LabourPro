import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const ManagerSalary = () => {
  const [managers, setManagers] = useState([]);
  const [managerId, setManagerId] = useState("");
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Auto-set to current month (1-12)
  const [year, setYear] = useState(new Date().getFullYear()); // Auto-set to current year
  const [salaryData, setSalaryData] = useState(null);

  const [baseSalary, setBaseSalary] = useState("");
  const [advance, setAdvance] = useState("");
  const [loanTaken, setLoanTaken] = useState("");
  const [loanPaid, setLoanPaid] = useState("");

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

  // ✅ Auto fetch salary when manager/month/year changes
  useEffect(() => {
    if (managerId && month && year) {
      fetchSalary();
    }
  }, [managerId, month, year]);

  const fetchSalary = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://labourpro-backend.onrender.com/api/salary/${managerId}/${month}/${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSalaryData(res.data);
      setBaseSalary(res.data.baseSalary?.toString() || "");
      setAdvance(res.data.advance?.toString() || "");
      setLoanTaken(res.data.loanTaken?.toString() || "");
      setLoanPaid(res.data.loanPaid?.toString() || "");
    } catch (err) {
      setSalaryData(null);
      setBaseSalary("");
      setAdvance("");
      setLoanTaken("");
      setLoanPaid("");
      console.warn("⚠️ No salary found for this manager/month/year");
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
      const res = await axios.post(
        "https://labourpro-backend.onrender.com/api/salary/add",
        { managerId, month, year },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Salary Added");
      setSalaryData(res.data.salary);
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

      // Calculate increments (differences from current values)
      const advanceIncrement = parseFloat(advance) - (salaryData.advance || 0);
      const loanTakenIncrement = parseFloat(loanTaken) - (salaryData.loanTaken || 0);
      const loanPaidIncrement = parseFloat(loanPaid) - (salaryData.loanPaid || 0);

      if (advanceIncrement === 0 && loanTakenIncrement === 0 && loanPaidIncrement === 0) {
        alert("⚠️ No changes detected.");
        return;
      }

      const updates = {
        advance: advanceIncrement,
        loanTaken: loanTakenIncrement,
        loanPaid: loanPaidIncrement
      };

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://labourpro-backend.onrender.com/api/salary/${salaryData._id}/update`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Salary Updated");
      setSalaryData(res.data.salary);

      // Refetch to update display with new totals
      fetchSalary();
    } catch (err) {
      console.error("❌ Error updating salary:", err.response?.data || err.message);
      alert("❌ " + (err.response?.data?.error || "Error updating salary"));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold pt-7 text-gray-800 mb-6">💰 Salary Management</h2>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Manager Dropdown */}
          <div>
            <label className="block font-medium text-gray-700">Manager</label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">-- Select Manager --</option>
              {managers.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month + Year (editable to view different periods) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700">Month</label>
              <input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700">Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
          </div>

          {/* Salary Inputs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block font-medium text-gray-700">Base Salary</label>
              <input
                type="number"
                value={baseSalary}
                readOnly // Not editable
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Advance</label>
              <input
                type="number"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Loan Taken</label>
              <input
                type="number"
                value={loanTaken}
                onChange={(e) => setLoanTaken(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Loan Paid</label>
              <input
                type="number"
                value={loanPaid}
                onChange={(e) => setLoanPaid(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            {!salaryData ? (
              <button
                onClick={handleAddSalary}
                className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700"
              >
                ➕ Add Salary
              </button>
            ) : (
              <button
                onClick={handleUpdateSalary}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
              >
                ✏️ Update Salary
              </button>
            )}
          </div>
        </div>

        {/* Salary Details */}
        {salaryData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-xl font-semibold mb-4">📊 Salary Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-800">
              <p><b>Base Salary:</b> {salaryData.baseSalary}</p>
              <p><b>Advance:</b> {salaryData.advance}</p>
              <p><b>Loan Taken:</b> {salaryData.loanTaken}</p>
              <p><b>Loan Paid:</b> {salaryData.loanPaid}</p>
              <p><b>Remaining Loan:</b> {salaryData.loanRemaining}</p>
              <p><b>Final Salary:</b> {salaryData.finalSalary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerSalary;
