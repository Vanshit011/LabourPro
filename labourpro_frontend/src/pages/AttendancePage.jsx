import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const AttendancePage = () => {
    const [form, setForm] = useState({
        worker: "",
        entryTime: "",
        exitTime: "",
    });
    const [workers, setWorkers] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
    });

    const [token, setToken] = useState(localStorage.getItem("token"));

    const fetchWorkers = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/worker", {
                headers: { Authorization: `Bearer ${token}` },
            });
            // console.log("Full response from worker API:", res.data);

            // Try both keys depending on backend response
            if (res.data.workers) {
                setWorkers(res.data.workers);
            } else if (res.data.worker) {
                setWorkers(res.data.worker);
            } else if (Array.isArray(res.data)) {
                setWorkers(res.data);
            } else {
                console.warn("Unexpected worker data format:", res.data);
                setWorkers([]);
            }
        } catch (error) {
            console.error("❌ Error fetching workers:", error);
        }
    };


    // Fetch attendance
    const fetchAllAttendance = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/attendance/date?date=${selectedDate}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setAttendance(res.data.attendance || []);
        } catch (error) {
            console.error("Error fetching attendance by date:", error.response?.data || error.message);
        }
    };



    useEffect(() => {
        fetchWorkers();
    }, []);

    useEffect(() => {
        fetchAllAttendance();
    }, [selectedDate]);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`http://localhost:5000/api/attendance/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Attendance deleted");
            fetchAllAttendance(); // 👈 This updates the list
        } catch (err) {
            toast.error("Error deleting attendance");
            console.error(err);
        }
    };


    // Handle form change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Submit attendance
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/attendance", form, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // console.log("✅ Attendance saved:", response.data); // 👈 show full API response

            setForm({ worker: "", entryTime: "", exitTime: "" });
            fetchAllAttendance();
        } catch (error) {
            console.error("❌ Error saving attendance:", error.response?.data || error.message);
        }
    };


    return (
        <div className="flex flex-col md:flex-row h-screen">
            {/* Sidebar (fixed for desktop, collapsible for mobile) */}
            <div className="md:w-64 w-full bg-gray-100">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <h1 className="text-xl font-bold mb-4">Attendance Management</h1>

                {/* Date Filter */}
                <div className="mb-6">
                    <label className="block mb-1 text-sm font-medium">Select Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border p-2 rounded w-full max-w-xs"
                    />
                </div>

                {/* Attendance Form */}
                <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                    <div className="w-full sm:w-80">
                        <label className="block mb-1 text-sm font-medium">Select Worker</label>
                        <select
                            name="worker"
                            value={form.worker}
                            onChange={handleChange}
                            className="w-full p-1 text-sm border rounded-md sm:w-64"
                        >
                            <option value="">👷 Select Worker</option>
                            {workers.map((w) => (
                                <option key={w._id} value={w._id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium">Entry Time</label>
                            <input
                                type="time"
                                name="entryTime"
                                value={form.entryTime}
                                onChange={handleChange}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block mb-1 text-sm font-medium">Exit Time</label>
                            <input
                                type="time"
                                name="exitTime"
                                value={form.exitTime}
                                onChange={handleChange}
                                className="border p-2 rounded w-full"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                        Save Attendance
                    </button>
                </form>

                {/* Attendance List */}
                <div className="overflow-x-auto">
                    <div className="flex items-center justify-between mb-4 flex-col sm:flex-row gap-2">
                        <h2 className="text-lg font-semibold">Attendance on {selectedDate}</h2>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="border px-3 py-1 rounded-md w-full sm:w-auto"
                        />
                    </div>

                    <table className="min-w-full table-auto border-collapse border text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Worker Name</th>
                                <th className="border p-2">Role</th>
                                <th className="border p-2">Entry Time</th>
                                <th className="border p-2">Exit Time</th>
                                <th className="border p-2">Hours Worked</th>
                                <th className="border p-2">Daily Roj</th>
                                <th className="border p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                attendance.map((a) => (
                                    <tr key={a._id}>
                                        <td className="border p-2">{a.worker?.name}</td>
                                        <td className="border p-2">{a.worker?.role}</td>
                                        <td className="border p-2">{a.entryTime}</td>
                                        <td className="border p-2">{a.exitTime}</td>
                                        <td className="border p-2">{a.totalHours} hrs</td>
                                        <td className="border p-2">₹{a.dailyRoj}</td>
                                        <td className="border p-2">
                                            <button
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            "Are you sure you want to delete this attendance record?"
                                                        )
                                                    ) {
                                                        handleDelete(a._id);
                                                    }
                                                }}
                                                className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>


    );
};

export default AttendancePage;
