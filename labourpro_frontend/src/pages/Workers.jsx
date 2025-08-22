import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const workers = () => {
    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState("workers"); // 'workers' or 'managers'

    // Workers State
    const [workers, setWorkers] = useState([]);
    const [workerForm, setWorkerForm] = useState({ name: "", number: "", role: "", rojPerHour: "", email: "", password: "" });
    const [editingWorkerId, setEditingWorkerId] = useState(null);

    // Managers State
    const [managers, setManagers] = useState([]);
    const [managerForm, setManagerForm] = useState({ name: "", number: "", role: "", salary: "", email: "", password: "" });
    const [editingManagerId, setEditingManagerId] = useState(null);

    // Authentication
    const [token, setToken] = useState(localStorage.getItem("token"));

    // ================ Workers API ==================
    const fetchWorkers = async () => {
        if (!token) return;
        try {
            const res = await axios.get("https://labourpro-backend.onrender.com/api/worker", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkers(res.data);
            // console.log("✅ Workers fetched successfully:", res.data);
        } catch (err) {
            console.error("❌ Error fetching workers:", err.message);
        }
    };

    const handleWorkerSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingWorkerId
                ? `https://labourpro-backend.onrender.com/api/worker/${editingWorkerId}`
                : "https://labourpro-backend.onrender.com/api/worker/add";
            const method = editingWorkerId ? axios.put : axios.post;

            await method(url, workerForm, { headers: { Authorization: `Bearer ${token}` } });

            setWorkerForm({ name: "", number: "", role: "", rojPerHour: "", email: "", password: "" });
            setEditingWorkerId(null);
            fetchWorkers();
        } catch (err) {
            console.error("❌ Worker submit error:", err.message);
        }
    };

    const handleWorkerEdit = (worker) => {
        setWorkerForm({
            name: worker.name,
            number: worker.number,
            role: worker.role,
            rojPerHour: worker.rojPerHour,
            email: worker.email,
            password: "",
        });
        setEditingWorkerId(worker._id);
    };

    const handleWorkerDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this worker?")) return;
        try {
            await axios.delete(`https://labourpro-backend.onrender.com/api/worker/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchWorkers();
        } catch (err) {
            console.error("❌ Worker delete error:", err.message);
        }
    };

    // ================ Manager APIs ==================
    const fetchManagers = async () => {
       if (!token) return;
        try {
            const res = await axios.get("http://localhost:5000/api/worker/getManager", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWorkers(res.data);
            console.log("✅ Workers fetched successfully:", res.data);
        } catch (err) {
            console.error("❌ Error fetching workers:", err.message);
        }
    }

    const handleManagerSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingManagerId
                ? `http://localhost:5000/api/worker/updateManager/${editingManagerId}`
                : "http://localhost:5000/api/worker/addManager";
            const method = editingManagerId ? axios.put : axios.post;

            await method(url, managerForm, { headers: { Authorization: `Bearer ${token}` } });

            setManagerForm({ name: "", number: "", role: "", salary: "", email: "", password: "" });
            setEditingManagerId(null);
            fetchManagers();
        } catch (err) {
            console.error("❌ Manager submit error:", err.message);
        }
    };

    const handleManagerEdit = (manager) => {
        setManagerForm({
            name: manager.name,
            number: manager.number,
            role: manager.role,
            salary: manager.salary,
            email: manager.email,
            password: "",
        });
        setEditingManagerId(manager._id);
    };

    const handleManagerDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this manager?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/worker/deleteManager/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchManagers();
        } catch (err) {
            console.error("❌ Manager delete error:", err.message);
        }
    };

    // ================ Unified Effect Hook ==================
    useEffect(() => {
        if (token) {
            fetchWorkers();
            fetchManagers();
        }
    }, [token]);

    const renderTable = () => {
        if (currentPage === "workers") {
            return (
                <div className="bg-white rounded-2xl shadow p-4 border border-gray-200">
                    <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="min-w-full table-auto text-sm text-center">
                            <thead className="bg-gray-100 text-gray-700 sticky top-0">
                                <tr>
                                    <th className="p-3 border">Name</th>
                                    <th className="p-3 border">Number</th>
                                    <th className="p-3 border">Role</th>
                                    <th className="p-3 border">Email</th>
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
                                            <td className="p-3 whitespace-nowrap">₹{w.rojPerHour}</td>
                                            <td className="p-3 space-x-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleWorkerEdit(w)}
                                                    className="text-blue-600 hover:underline font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleWorkerDelete(w._id)}
                                                    className="text-red-600 hover:underline font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-5 text-gray-400">
                                            No workers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else if (currentPage === "managers") {
            return (
                <div className="bg-white rounded-2xl shadow p-4 border border-gray-200">
                    <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto">
                        <table className="min-w-full table-auto text-sm text-center">
                            <thead className="bg-gray-100 text-gray-700 sticky top-0">
                                <tr>
                                    <th className="p-3 border">Name</th>
                                    <th className="p-3 border">Number</th>
                                    <th className="p-3 border">Role</th>
                                    <th className="p-3 border">Email</th>
                                    <th className="p-3 border">Salary</th>
                                    <th className="p-3 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(managers) && managers.length > 0 ? (
                                    managers.map((m) => (
                                        <tr key={m._id} className="border-t hover:bg-gray-50 transition-all">
                                            <td className="p-3 whitespace-nowrap">{m.name}</td>
                                            <td className="p-3 whitespace-nowrap">{m.number}</td>
                                            <td className="p-3 whitespace-nowrap">{m.role}</td>
                                            <td className="p-3 whitespace-nowrap">{m.email}</td>
                                            <td className="p-3 whitespace-nowrap">₹{m.salary}</td>
                                            <td className="p-3 space-x-2 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleManagerEdit(m)}
                                                    className="text-blue-600 hover:underline font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleManagerDelete(m._id)}
                                                    className="text-red-600 hover:underline font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center p-5 text-gray-400">
                                            No managers found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex-1 pt-14 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Navigation Tabs */}
                    <div className="flex justify-center mb-6 space-x-4">
                        <button
                            onClick={() => setCurrentPage("workers")}
                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${currentPage === "workers"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Manage Workers
                        </button>
                        <button
                            onClick={() => setCurrentPage("managers")}
                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${currentPage === "managers"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Manage Managers
                        </button>
                    </div>

                    {/* Conditional Heading and Form */}
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                        {currentPage === "workers" ? "👷 Manage Workers" : "💼 Manage Managers"}
                    </h2>

                    <div className="bg-white rounded-2xl shadow p-6 mb-8">
                        {currentPage === "workers" ? (
                            <form onSubmit={handleWorkerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Worker Name" value={workerForm.name} onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="text" placeholder="Phone Number" value={workerForm.number} onChange={(e) => setWorkerForm({ ...workerForm, number: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="text" placeholder="Worker Role" value={workerForm.role} onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="number" placeholder="Roj Per Hour" value={workerForm.rojPerHour} onChange={(e) => setWorkerForm({ ...workerForm, rojPerHour: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="email" placeholder="Email" value={workerForm.email} onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="password" placeholder="Password" value={workerForm.password} onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })} className="border p-2 rounded-md w-full" required={!editingWorkerId} />
                                <div className="col-span-full">
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
                                        {editingWorkerId ? "Update Worker" : "Add Worker"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleManagerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Manager Name" value={managerForm.name} onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="text" placeholder="Phone Number" value={managerForm.number} onChange={(e) => setManagerForm({ ...managerForm, number: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="text" placeholder="Manager Role" value={managerForm.role} onChange={(e) => setManagerForm({ ...managerForm, role: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="number" placeholder="Salary" value={managerForm.salary} onChange={(e) => setManagerForm({ ...managerForm, salary: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="email" placeholder="Email" value={managerForm.email} onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })} className="border p-2 rounded-md w-full" required />
                                <input type="password" placeholder="Password" value={managerForm.password} onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })} className="border p-2 rounded-md w-full" required={!editingManagerId} />
                                <div className="col-span-full">
                                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
                                        {editingManagerId ? "Update Manager" : "Add Manager"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {renderTable()}
                </div>
            </div>
        </div>
    );
};

export default workers;