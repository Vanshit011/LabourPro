import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
// import { Menu } from "lucide-react";

const Workers = () => {
    const [workers, setWorkers] = useState([]);
    const [form, setForm] = useState({ name: "", number: "", role: "", rojPerHour: "" });
    const [editingId, setEditingId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const token = localStorage.getItem("token");

    const fetchWorkers = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/worker", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkers(res.data);
        } catch (err) {
            console.error("❌ Error fetching workers:", err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/worker/${editingId}`, form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEditingId(null);
            } else {
                await axios.post("http://localhost:5000/api/worker/add", form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setForm({ name: "", number: "", role: "", rojPerHour: "" });
            fetchWorkers();
        } catch (err) {
            console.error("❌ Submit error:", err.message);
        }
    };

    const handleEdit = (worker) => {
        setForm({
            name: worker.name,
            number: worker.number,
            role: worker.role,
            rojPerHour: worker.rojPerHour,
        });
        setEditingId(worker._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this worker?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/worker/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchWorkers();
        } catch (err) {
            console.error("❌ Delete error:", err.message);
        }
    };

    useEffect(() => {
        fetchWorkers();
    }, []);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 ">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Overlay for mobile when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden "
                    onClick={() => setSidebarOpen(false)}
                />
            )}


            {/* Main content */}
            <div className="flex-1 pt-14 md:p-6">
                <h2 className="text-2xl font-bold mb-4">👷 Manage Workers</h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Worker Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={form.number}
                        onChange={(e) => setForm({ ...form, number: e.target.value })}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Worker Role"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="border p-2 rounded"
                        required
                    />
                    <input
                        type="number"
                        placeholder="Roj Per Hour"
                        value={form.rojPerHour}
                        onChange={(e) => setForm({ ...form, rojPerHour: e.target.value })}
                        className="border p-2 rounded"
                        required
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded col-span-full">
                        {editingId ? "Update Worker" : "Add Worker"}
                    </button>
                </form>

                {/* Worker Table */}
                <div className="overflow-auto rounded border border-gray-300">
                    <table className="min-w-full table-auto text-center text-sm">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="p-2 border">Name</th>
                                <th className="p-2 border">Number</th>
                                <th className="p-2 border">Role</th>
                                <th className="p-2 border">Roj/Hour</th>
                                <th className="p-2 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(workers) && workers.length > 0 ? (
                                workers.map((w) => (
                                    <tr key={w._id} className="border-t hover:bg-gray-50">
                                        <td className="p-2">{w.name}</td>
                                        <td className="p-2">{w.number}</td>
                                        <td className="p-2">{w.role}</td>
                                        <td className="p-2">₹{w.rojPerHour}</td>
                                        <td className="p-2 space-x-2">
                                            <button
                                                onClick={() => handleEdit(w)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(w._id)}
                                                className="text-red-500 hover:underline"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-4 text-gray-400">
                                        No workers found.
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

export default Workers;
