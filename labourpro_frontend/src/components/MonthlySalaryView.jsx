import React, { useState, useEffect } from "react";
import axios from "axios";

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const MonthlySalaryView = () => {
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMonthlySalary = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
                `https://labourpro-backend.onrender.com/api/attendance/monthly-salary?month=${month}&year=${year}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSummary(res.data.summary || []);
        } catch (err) {
            setError("Failed to fetch monthly salary data.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthlySalary();
    }, [month, year]);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg  font-sans text-gray-800 text-center">
            {/* Title */}
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
                <span className="text-3xl">📅</span> View Monthly Salary
            </h2>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center items-end gap-4 mb-8">
                <label className="flex flex-col text-blue-700 font-semibold min-w-[140px]">
                    Month
                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="mt-2 p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {monthNames.map((m, i) => (
                            <option key={i} value={i + 1}>
                                {m}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col text-blue-700 font-semibold min-w-[140px]">
                    Year
                    <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="mt-2 p-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </label>

                <button
                    onClick={fetchMonthlySalary}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
                >
                    View
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <p className="text-center text-lg text-gray-600">Loading data...</p>
            ) : error ? (
                <p className="text-center text-lg text-red-600">{error}</p>
            ) : summary.length === 0 ? (
                <p className="text-center text-lg text-gray-600">
                    No attendance/salary data found for selected month/year.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg shadow-md border border-blue-200">
                    <table className="min-w-full bg-white">
                        <thead className="bg-blue-100 text-blue-800 font-semibold text-sm">
                            <tr>
                                <th className="py-3 px-6 text-center">Worker Name</th>
                                <th className="py-3 px-6 text-center">Total Hours Worked</th>
                                <th className="py-3 px-6 text-center">Total Earned</th>
                                <th className="py-3 px-6 text-center">Days Worked</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((item, idx) => (
                                <tr
                                    key={item.workerId || idx}
                                    className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}
                                >
                                    <td className="py-4 px-6 border text-center font-medium text-gray-800">
                                        {item.workerName}
                                    </td>
                                    <td className="py-4 px-6 border text-center">{item.totalHours.toFixed(2)}</td>
                                    <td className="py-4 px-6 border text-center">₹{item.totalRojEarned.toFixed(2)}</td>
                                    <td className="py-4 px-6 border text-center">{item.daysWorked}</td>
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
