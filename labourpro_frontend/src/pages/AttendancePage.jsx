import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const AttendancePage = () => {
    const [form, setForm] = useState({
        worker: "",
        entryTime: "",
        exitTime: "",
    });
    const [workers, setWorkers] = useState([]);
    const [attendances, setAttendances] = useState([]); // ✅ default as empty array
    const [editingId, setEditingId] = useState(null);

    const token = localStorage.getItem("token");

    const fetchWorkers = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/worker", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkers(res.data);
        } catch (error) {
            console.error("Error fetching workers", error);
        }
    };

    const fetchAttendances = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/attendance", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("Attendance data:", res.data);
            setAttendances(Array.isArray(res.data.attendance) ? res.data.attendance : []);
        } catch (error) {
            console.error("Error fetching attendances", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const attendanceData = {
                workerId: form.worker, // ✅ renamed
                entryTime: form.entryTime,
                exitTime: form.exitTime,
            };

            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/attendance/${editingId}`,
                    attendanceData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post(
                    "http://localhost:5000/api/attendance",
                    attendanceData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setForm({ worker: "", entryTime: "", exitTime: "" });
            setEditingId(null);
            fetchAttendances();
        } catch (error) {
            console.error("Error saving attendance", error);
        }
    };


    const fetchById = async (id) => {
        try {
            const res = await axios.get(
                `http://localhost:5000/api/attendance/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setForm({
                worker: res.data.worker,
                entryTime: res.data.entryTime,
                exitTime: res.data.exitTime || "",
            });
        } catch (error) {
            console.error("Error fetching by ID", error);
        }
    };

    useEffect(() => {
        fetchWorkers();
        fetchAttendances();
    }, []);

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-6 overflow-auto">
                <h2 className="text-xl font-semibold mb-4">Attendance</h2>
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 shadow rounded mb-6"
                >
                    <select
                        value={form.worker}
                        onChange={(e) => setForm({ ...form, worker: e.target.value })}
                        required
                        className="border p-2 rounded"
                    >
                        <option value="">Select Worker</option>
                        {workers.map((w) => (
                            <option key={w._id} value={w._id}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="datetime-local"
                        value={form.entryTime}
                        onChange={(e) => setForm({ ...form, entryTime: e.target.value })}
                        required
                        className="border p-2 rounded"
                    />
                    <input
                        type="datetime-local"
                        value={form.exitTime}
                        onChange={(e) => setForm({ ...form, exitTime: e.target.value })}
                        className="border p-2 rounded"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                    >
                        {editingId ? "Update" : "Add"}
                    </button>
                </form>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm border rounded">
                        <thead className="bg-gray-100 text-left">
                            <tr>
                                <th className="p-2">Worker</th>
                                <th className="p-2">Entry Time</th>
                                <th className="p-2">Exit Time</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(attendances) && attendances.length > 0 ? (
                                attendances.map((att) => (
                                    <tr key={att._id} className="border-t">
                                        <td className="p-2">{att.worker?.name || "N/A"}</td>
                                        <td className="p-2">
                                            {att.entryTime
                                                ? new Date(att.entryTime).toLocaleString()
                                                : "-"}
                                        </td>
                                        <td className="p-2">
                                            {att.exitTime
                                                ? new Date(att.exitTime).toLocaleString()
                                                : "-"}
                                        </td>
                                        <td className="p-2">
                                            <button
                                                onClick={() => {
                                                    fetchById(att._id);
                                                    setEditingId(att._id);
                                                }}
                                                className="px-2 py-1 text-sm bg-yellow-200 text-yellow-800 rounded"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-4 text-center text-gray-500">
                                        No attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
};

export default AttendancePage;
