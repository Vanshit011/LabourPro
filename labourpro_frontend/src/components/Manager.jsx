import { useEffect, useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // 👈 Install lucide-react for icons

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [managerForm, setManagerForm] = useState({
    name: "",
    number: "",
    role: "Manager",
    salary: "",
    email: "",
    password: ""
  });
  const [editingManagerId, setEditingManagerId] = useState(null);
  const [showPasswords, setShowPasswords] = useState({}); // 👈 Track password visibility

  // 1. Store the token in a state variable for React to track
  const [token, setToken] = useState(localStorage.getItem("token"));

  const fetchManagers = async () => {
    try {
      const res = await axios.get("https://labourpro-backend.onrender.com/api/worker/getManager", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setManagers(res.data);
      // console.log("✅ Managers fetched successfully:", res.data);
    } catch (err) {
      console.error("❌ Error fetching managers:", err.response?.data || err.message);
      alert("❌ Failed to fetch managers. Check console for details.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting manager form data:", managerForm); // Log data before sending for debugging

    try {
      if (editingManagerId) {
        await axios.put(`https://labourpro-backend.onrender.com/api/worker/updateManager/${editingManagerId}`, managerForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' // Explicitly set JSON
          },
        });
        alert("✅ Manager updated successfully!");
        setEditingManagerId(null);
      } else {
        await axios.post("https://labourpro-backend.onrender.com/api/worker/addManager", managerForm, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' // Explicitly set JSON
          },
        });
        alert("✅ Manager added successfully!");
      }
      setManagerForm({ name: "", number: "", role: "", salary: "", email: "", password: "" });
      fetchManagers();
    } catch (err) {
      console.error("❌ Manager submit error:", err.response?.data || err.message);
      alert("❌ Failed to add/update manager: " + (err.response?.data?.error || "Check console for details."));
    }
  };

  const handleEdit = (manager) => {
    setManagerForm({
      name: manager.name,
      number: manager.number,
      role: manager.role,
      salary: manager.salary,
      email: manager.email,
      password: "" // ⬅️ Security: Do not pre-fill password on edit
    });
    setEditingManagerId(manager._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this manager?")) return;
    try {
      await axios.delete(`https://labourpro-backend.onrender.com/api/worker/deleteManager/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Manager deleted successfully!");
      fetchManagers();
    } catch (err) {
      console.error("❌ Manager delete error:", err.response?.data || err.message);
      alert("❌ Failed to delete manager. Check console for details.");
    }
  };

  // 2. Make API call conditional on token existence and add token as a dependency
  useEffect(() => {
    if (token) {
      fetchManagers();
    }
  }, [token]);

  // Auto-generate email based on name (only if email is empty)
  useEffect(() => {
    if (managerForm.name && !managerForm.email) {
      const generatedEmail = '@labourpro.com';
      setManagerForm((prev) => ({ ...prev, email: generatedEmail }));
    }
  }, [managerForm.name]);

  // List of common manager roles
  const managerRoles = [
    "Manager"
  ];

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id], // toggle visibility for this worker
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Main Content */}
      <div className="flex-1 pt-5 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-2">💼</span> Manage Managers
          </h2>

          {/* Manager Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                <input
                  type="text"
                  placeholder="Manager Name"
                  value={managerForm.name}
                  onChange={(e) => setManagerForm({ ...managerForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={managerForm.number}
                  onChange={(e) => setManagerForm({ ...managerForm, number: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager Role</label>
                <select
                  value={managerForm.role}
                  onChange={(e) => setManagerForm({ ...managerForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                >
                  {/* Only one option, already selected */}
                  <option value="Manager">Manager</option>
                </select>

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                <input
                  type="number"
                  placeholder="Salary"
                  value={managerForm.salary}
                  onChange={(e) => setManagerForm({ ...managerForm, salary: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={managerForm.password}
                  onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required={!editingManagerId}
                />
              </div>
              <div className="col-span-full">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition duration-200"
                >
                  {editingManagerId ? "Update Manager" : "Add Manager"}
                </button>
              </div>
            </form>
          </div>

          {/* Managers Table */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-200">
            <div className="w-full overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="min-w-full table-auto text-sm text-center">
                <thead className="bg-blue-100 text-blue-900 sticky top-0">
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
                  {Array.isArray(managers) && managers.length > 0 ? (
                    managers.map((m) => (
                      <tr key={m._id} className="border-t hover:bg-gray-50 transition-all">
                        <td className="p-3 border whitespace-nowrap">{m.name}</td>
                        <td className="p-3 border whitespace-nowrap">{m.number}</td>
                        <td className="p-3 border whitespace-nowrap">{m.role}</td>
                        <td className="p-3 border whitespace-nowrap">{m.email}</td>
                        <td className="p-3 border">
                          <div className="flex items-center justify-center gap-2">
                            <span>
                              {showPasswords[m._id] ? m.password : "••••••"}
                            </span>
                            <button
                              onClick={() => togglePasswordVisibility(m._id)}
                              className="text-gray-500 hover:text-gray-800"
                            >
                              {showPasswords[m._id] ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-3 border whitespace-nowrap">₹{m.salary}</td>
                        <td className="p-3 border space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleEdit(m)}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m._id)}
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
                        No managers found.
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

export default Managers;
