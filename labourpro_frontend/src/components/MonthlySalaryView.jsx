import React, { useState, useEffect } from "react";
import axios from "axios";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MonthlySalaryView = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1–12
  const currentYear = today.getFullYear();

  // 🧭 State for filters
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🧠 Fetch monthly salary data
  const fetchMonthlySalary = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://labourpro-backend.onrender.com/api/attendance/monthly-salary?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Monthly Salary Data:", res.data);
      setSummary(res.data.summary || []);
    } catch (err) {
      setError("Failed to fetch monthly salary data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Fetch when month or year changes
  useEffect(() => {
    fetchMonthlySalary();
  }, [month, year]);

  // 🔁 Auto-refresh when attendance added
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      fetchMonthlySalary();
    };

    window.addEventListener("attendanceUpdated", handleAttendanceUpdate);
    return () => window.removeEventListener("attendanceUpdated", handleAttendanceUpdate);
  }, [month, year]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-lg font-sans text-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center justify-center gap-2">
        <span className="text-3xl">📅</span> View Monthly Salary
      </h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-center items-end gap-4 mb-8">
        <label className="flex flex-col text-sm font-medium text-gray-700 w-full sm:w-auto">
          Month
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="mt-1 p-3 border border-gray-300 rounded-lg bg-white shadow-sm"
          >
            {monthNames.map((m, i) => (
              <option
                key={i}
                value={i + 1}
                disabled={i + 1 > currentMonth && year === currentYear} // 🚫 Disable future months
              >
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm font-medium text-gray-700 w-full sm:w-auto">
          Year
          <input
            type="number"
            value={year}
            readOnly
            className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
          />
        </label>

        <button
          onClick={fetchMonthlySalary}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition"
        >
          View
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-center text-lg text-gray-600">Loading data...</p>
      ) : error ? (
        <p className="text-center text-lg text-red-600 bg-red-50 p-4 rounded-lg">{error}</p>
      ) : summary.length === 0 ? (
        <p className="text-center text-lg text-gray-600 bg-gray-50 p-4 rounded-lg">
          No attendance or salary data found for this month.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-blue-100 text-blue-800 font-semibold text-sm">
              <tr>
                <th className="py-3 px-4 md:px-6 text-left">Worker Name</th>
                <th className="py-3 px-4 md:px-6 text-left">Total Hours Worked</th>
                <th className="py-3 px-4 md:px-6 text-left">Total Earned</th>
                <th className="py-3 px-4 md:px-6 text-left">Days Worked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.map((item, idx) => (
                <tr key={item.workerId || idx} className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                  <td className="py-4 px-4 md:px-6 font-medium text-gray-800">{item.workerName}</td>
                  <td className="py-4 px-4 md:px-6">{item.totalHours.toFixed(2)}</td>
                  <td className="py-4 px-4 md:px-6">₹{item.totalRojEarned.toFixed(2)}</td>
                  <td className="py-4 px-4 md:px-6">{item.daysWorked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlySalaryView;
