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
        "fixed top-5 right-5 bg-green-600 text-white px-4 py-2 rounded shadow z-50 animate-bounce";
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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content with scroll */}
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-h-screen">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
              Add Worker Attendance
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 gap-5 md:grid-cols-2"
            >
              {/* Worker */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Select Worker
                </label>
                <select
                  name="workerId"
                  value={form.workerId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
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
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
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
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
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
                  className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  Submit Attendance
                </button>
              </div>
            </form>
          </div>

          {/* Attendance Viewer */}
          <div className="bg-white shadow-md rounded-xl p-6 overflow-x-auto">
            <ViewAttendanceByDate />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendancePage;
