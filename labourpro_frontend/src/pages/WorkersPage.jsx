import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const API_URL = "https://labourpro-backend.onrender.com/api/worker";

const WorkersPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    role: "",
    salary: "",
  });

  const token = localStorage.getItem("token");

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkers(res.data);
    } catch (error) {
      console.error("Failed to fetch workers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({ name: "", contact: "", role: "", salary: "" });
      setEditId(null);
      fetchWorkers();
    } catch (error) {
      console.error("Error saving worker", error);
    }
  };

  const handleEdit = (worker) => {
    setFormData({
      name: worker.name || "",
      contact: worker.contact || "",
      role: worker.role || "",
      salary: worker.salary || "",
    });
    setEditId(worker._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this worker?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWorkers();
    } catch (error) {
      console.error("Failed to delete worker", error);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-12 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-semibold mb-6 text-gray-800">Manage Workers</h2>

        {/* Add/Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md p-6 mb-8 max-w-3xl"
        >
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            {editId ? "Edit Worker" : "Add New Worker"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="contact"
              placeholder="Contact Number"
              value={formData.contact}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="role"
              placeholder="Role (e.g., Welder, Loader)"
              value={formData.role}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              name="salary"
              placeholder="Salary ₹"
              value={formData.salary}
              onChange={handleChange}
              required
              className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-5 flex gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              {editId ? "Update Worker" : "Add Worker"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setFormData({ name: "", contact: "", role: "", salary: "" });
                }}
                className="text-gray-600 underline"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Worker List */}
        {loading ? (
          <p className="text-gray-600">Loading workers...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="bg-white p-5 rounded-xl shadow border border-gray-200"
              >
                <p className="text-lg font-medium text-gray-800">
                  {worker.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Phone:</strong> {worker.contact}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Role:</strong> {worker.role}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Salary:</strong> ₹{worker.salary}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(worker)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(worker._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkersPage;
