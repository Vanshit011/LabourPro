import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Workers = () => {
    const [workers, setWorkers] = useState([]);
    const [form, setForm] = useState({ name: "", number: "", role: "", rojPerHour: "", email: "", password: "" });
    const [editingId, setEditingId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const token = localStorage.getItem("token");

    const fetchWorkers = async () => {
        try {
            const res = await axios.get("https://labourpro-backend.onrender.com/api/worker", {
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
            const url = editingId
                ? `https://labourpro-backend.onrender.com/api/worker/${editingId}`
                : "https://labourpro-backend.onrender.com/api/worker/add";

            const method = editingId ? axios.put : axios.post;

            await method(url, form, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setForm({ name: "", number: "", role: "", rojPerHour: "", email: "", password: "" });
            setEditingId(null);
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
            email: worker.email,
            password: worker.password,
        });
        setEditingId(worker._id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this worker?")) return;
        try {
            await axios.delete(`https://labourpro-backend.onrender.com/api/worker/${id}`, {
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
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex-1 pt-16 md:p-8 p-4">
                <div className="max-w-6xl mx-auto w-full">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">👷 Manage Workers</h2>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Worker Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="border p-2 rounded-md w-full"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Phone Number"
                                value={form.number}
                                onChange={(e) => setForm({ ...form, number: e.target.value })}
                                className="border p-2 rounded-md w-full"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Worker Role"
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="border p-2 rounded-md w-full"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Roj Per Hour"
                                value={form.rojPerHour}
                                onChange={(e) => setForm({ ...form, rojPerHour: e.target.value })}
                                className="border p-2 rounded-md w-full"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email Id"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="border p-2 rounded-md w-full"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="border p-2 rounded-md w-full"
                                required
                            />
                            <div className="col-span-full">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-all"
                                >
                                    {editingId ? "Update Worker" : "Add Worker"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                        <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="min-w-full text-sm text-center">
                                <thead className="bg-gray-100 text-gray-700 sticky top-0">
                                    <tr>
                                        <th className="p-3 border">Name</th>
                                        <th className="p-3 border">Number</th>
                                        <th className="p-3 border">Role</th>
                                        <th className="p-3 border">Email</th>
                                        <th className="p-3 border">Password</th>
                                        <th className="p-3 border">Roj/Hour</th>
                                        <th className="p-3 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(workers) && workers.length > 0 ? (
                                        workers.map((w) => (
                                            <tr key={w._id} className="border-t hover:bg-gray-50 transition-all">
                                                <td className="p-3 whitespace-nowrap">{w.name}</td>
                                                <td className="p-3 whitespace-nowrap">{w.number}</td>
                                                <td className="p-3 whitespace-nowrap">{w.role}</td>
                                                <td className="p-3 whitespace-nowrap">{w.email}</td>
                                                <td className="p-3 whitespace-nowrap">{w.password}</td>
                                                <td className="p-3 whitespace-nowrap">₹{w.rojPerHour}</td>
                                                <td className="p-3 space-x-2 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleEdit(w)}
                                                        className="text-blue-600 hover:underline font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(w._id)}
                                                        className="text-red-600 hover:underline font-medium"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center p-5 text-gray-400">
                                                No workers found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Workers;
