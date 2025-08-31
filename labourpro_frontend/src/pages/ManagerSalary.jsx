import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const ManagerSalary = () => {
  const [managers, setManagers] = useState([]);
  const [managerId, setManagerId] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
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
      setBaseSalary(res.data.baseSalary || "");
      setAdvance(res.data.advance || "");
      setLoanTaken(res.data.loanTaken || "");
      setLoanPaid(res.data.loanPaid || "");
    } catch (err) {
      setSalaryData(null);
      console.warn("⚠️ No salary found for this manager/month/year");
    }
  };

  // ✅ Add new salary
  const handleAddSalary = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://labourpro-backend.onrender.com/api/salary/add",
        { managerId, month, year, baseSalary, advance, loanTaken, loanPaid },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ Salary Added");
      setSalaryData(res.data);
    } catch (err) {
      console.error("❌ Error adding salary:", err.response?.data || err.message);
    }
  };

  // ✅ Update only one field (onBlur)
  const handleFieldUpdate = async (field, value) => {
    try {
      if (!salaryData?._id) return;

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://labourpro-backend.onrender.com/api/salary/${salaryData._id}/update`,
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSalaryData(res.data.salary);
    } catch (err) {
      console.error("❌ Error updating field:", err.response?.data || err.message);
    }
  };

  // ✅ Update full salary
  const handleUpdateSalary = async () => {
    try {
      if (!salaryData?._id) {
        alert("⚠️ No salary to update. Add salary first!");
        return;
      }

      const token = localStorage.getItem("token");
      const res = await axios.put(
        `https://labourpro-backend.onrender.com/api/salary/${salaryData._id}/update`,
        { baseSalary, advance, loanTaken, loanPaid },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Salary Updated");
      setSalaryData(res.data.salary);
    } catch (err) {
      console.error("❌ Error updating salary:", err.response?.data || err.message);
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">💰 Salary Management</h2>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {/* Manager */}
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

          {/* Month + Year */}
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
                onChange={(e) => setBaseSalary(e.target.value)}
                onBlur={() => handleFieldUpdate("baseSalary", baseSalary)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Advance</label>
              <input
                type="number"
                value={advance}
                onChange={(e) => setAdvance(e.target.value)}
                onBlur={() => handleFieldUpdate("advance", advance)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Loan Taken</label>
              <input
                type="number"
                value={loanTaken}
                onChange={(e) => setLoanTaken(e.target.value)}
                onBlur={() => handleFieldUpdate("loanTaken", loanTaken)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Loan Paid</label>
              <input
                type="number"
                value={loanPaid}
                onChange={(e) => setLoanPaid(e.target.value)}
                onBlur={() => handleFieldUpdate("loanPaid", loanPaid)}
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
