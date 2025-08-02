import React, { useState, useEffect } from "react";
import axios from "axios";
import ViewAttendanceByDate from "../components/ViewAttendanceByDate";
import Sidebar from "../components/Sidebar";

const getToday = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const AttendancePage = () => {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    workerId: "",
    date: getToday(),
    entryTime: "",
    exitTime: "",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchWorkers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/worker", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setWorkers(res.data || []);
    } catch (err) {
      console.error("Error fetching workers", err);
      setWorkers([]);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/attendance", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setForm({
        workerId: "",
        date: getToday(),
        entryTime: "",
        exitTime: "",
      });

      const popup = document.createElement("div");
      popup.innerText = "✅ Attendance added successfully!";
      popup.className =
        "fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow z-50";
      document.body.appendChild(popup);
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 2000);
    } catch (err) {
      console.error("Error saving attendance", err);
      alert("❌ Failed to save attendance");
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar on left */}
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 ">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden "
            onClick={() => setSidebarOpen(false)}
          />
        )}

      </div>

      {/* Main content on right */}
      <div className="flex-1 overflow-y-auto ">
        <div className="max-w-3xl mx-auto bg-white p-5 rounded shadow">
          <h2 className="text-xl font-semibold mb-4 text-center pt-8">
            Add Attendance
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Worker */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Worker
              </label>
              <select
                name="workerId"
                value={form.workerId}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">-- Select Worker --</option>
                {workers.length > 0 ? (
                  workers.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No workers found</option>
                )}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* Entry Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Entry Time
              </label>
              <input
                type="time"
                name="entryTime"
                value={form.entryTime}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            {/* Exit Time */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Exit Time
              </label>
              <input
                type="time"
                name="exitTime"
                value={form.exitTime}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Submit Attendance
            </button>
          </form>
        </div>

        {/* Attendance Table Below */}
        <div className="mt-6">
          <ViewAttendanceByDate />
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
