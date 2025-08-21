import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Workers = () => {
    const [workers, setWorkers] = useState([]);
    const [managers, setManagers] = useState([]);

    const [workerForm, setWorkerForm] = useState({
        name: "",
        number: "",
        role: "",
        rojPerHour: "",
        email: "",
        password: "",
    });

    const [managerForm, setManagerForm] = useState({
        name: "",
        number: "",
        role: "",
        salary: "",
        email: "",
        password: "",
    });

    const [editingWorkerId, setEditingWorkerId] = useState(null);
    const [editingManagerId, setEditingManagerId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const token = localStorage.getItem("token");

    // =============== Worker APIs ==================
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

    const submitWorker = async (e) => {
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

    const editWorker = (w) => {
        setWorkerForm({
            name: w.name,
            number: w.number,
            role: w.role,
            rojPerHour: w.rojPerHour,
            email: w.email,
            password: w.password,
        });
        setEditingWorkerId(w._id);
    };

    const deleteWorker = async (id) => {
        if (!window.confirm("Delete this worker?")) return;
        try {
            await axios.delete(`https://labourpro-backend.onrender.com/api/worker/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchWorkers();
        } catch (err) {
            console.error("❌ Worker delete error:", err.message);
        }
    };

    // =============== Manager APIs ==================
    const fetchManagers = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/worker/getManager", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setManagers(res.data);
        } catch (err) {
            console.error("❌ Error fetching managers:", err.message);
        }
    };

    const submitManager = async (e) => {
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

    const editManager = (m) => {
        setManagerForm({
            name: m.name,
            number: m.number,
            role: m.role,
            salary: m.salary,
            email: m.email,
            password: m.password,
        });
        setEditingManagerId(m._id);
    };

    const deleteManager = async (id) => {
        if (!window.confirm("Delete this manager?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/worker/deleteManager/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchManagers();
        } catch (err) {
            console.error("❌ Manager delete error:", err.message);
        }
    };

    useEffect(() => {
        fetchWorkers();
        fetchManagers();
    }, []);

    return (
        <div className="flex flex-col md:flex-row min-h-screen  overflow-hidden bg-gray-50">
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-h-screen">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex-1 pt-16 md:p-8 p-4 space-y-12">
                        {/* Worker Section */}
                        <section>
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">👷 Manage Workers</h2>

                            {/* Worker Form */}
                            <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8">
                                <form onSubmit={submitWorker} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {["name", "number", "role", "rojPerHour", "email", "password"].map((field, i) => (
                                        <input
                                            key={i}
                                            type={field === "rojPerHour" ? "number" : field === "email" ? "email" : field === "password" ? "password" : "text"}
                                            placeholder={field}
                                            value={workerForm[field]}
                                            onChange={(e) => setWorkerForm({ ...workerForm, [field]: e.target.value })}
                                            className="border p-2 rounded-md w-full"
                                            required
                                        />
                                    ))}
                                    <div className="col-span-full">
                                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">
                                            {editingWorkerId ? "Update Worker" : "Add Worker"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Worker Table */}
                            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                                <div className="w-full overflow-x-auto max-h-[400px] overflow-y-auto">
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
                                            {workers.length > 0 ? (
                                                workers.map((w) => (
                                                    <tr key={w._id} className="border-t hover:bg-gray-50 transition-all">
                                                        <td className="p-3">{w.name}</td>
                                                        <td className="p-3">{w.number}</td>
                                                        <td className="p-3">{w.role}</td>
                                                        <td className="p-3">{w.email}</td>
                                                        <td className="p-3">{w.password}</td>
                                                        <td className="p-3">₹{w.rojPerHour}</td>
                                                        <td className="p-3 space-x-2">
                                                            <button onClick={() => editWorker(w)} className="text-blue-600 hover:underline">
                                                                Edit
                                                            </button>
                                                            <button onClick={() => deleteWorker(w._id)} className="text-red-600 hover:underline">
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
                        </section>

                        {/* Manager Section */}
                        <section>
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">🧑‍💼 Manage Managers</h2>

                            {/* Manager Form */}
                            <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-8">
                                <form onSubmit={submitManager} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {["name", "number", "role", "salary", "email", "password"].map((field, i) => (
                                        <input
                                            key={i}
                                            type={field === "salary" ? "number" : field === "email" ? "email" : field === "password" ? "password" : "text"}
                                            placeholder={field}
                                            value={managerForm[field]}
                                            onChange={(e) => setManagerForm({ ...managerForm, [field]: e.target.value })}
                                            className="border p-2 rounded-md w-full"
                                            required
                                        />
                                    ))}
                                    <div className="col-span-full">
                                        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md">
                                            {editingManagerId ? "Update Manager" : "Add Manager"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Manager Table */}
                            <div className="bg-white rounded-xl shadow p-4 border border-gray-200">
                                <div className="w-full overflow-x-auto max-h-[400px] overflow-y-auto">
                                    <table className="min-w-full text-sm text-center">
                                        <thead className="bg-gray-100 text-gray-700 sticky top-0">
                                            <tr>
                                                <th className="p-3 border">Name</th>
                                                <th className="p-3 border">Number</th>
                                                <th className="p-3 border">Role</th>
                                                <th className="p-3 border">Email</th>
                                                <th className="p-3 border">Password</th>
                                                <th className="p-3 border">Salary</th>
                                                <th className="p-3 border">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {managers.length > 0 ? (
                                                managers.map((m) => (
                                                    <tr key={m._id} className="border-t hover:bg-gray-50 transition-all">
                                                        <td className="p-3">{m.name}</td>
                                                        <td className="p-3">{m.number}</td>
                                                        <td className="p-3">{m.role}</td>
                                                        <td className="p-3">{m.email}</td>
                                                        <td className="p-3">{m.password}</td>
                                                        <td className="p-3">₹{m.salary}</td>
                                                        <td className="p-3 space-x-2">
                                                            <button onClick={() => editManager(m)} className="text-blue-600 hover:underline">
                                                                Edit
                                                            </button>
                                                            <button onClick={() => deleteManager(m._id)} className="text-red-600 hover:underline">
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="text-center p-5 text-gray-400">
                                                        No managers found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>

    );
};

export default Workers;
