import React, { useState, useEffect } from "react";
import axios from "axios";
import ViewAttendanceByDate from "../components/ViewAttendanceByDate";
import Sidebar from "../components/Sidebar";
import MonthlySalaryView from "../components/MonthlySalaryView";

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
      const res = await axios.get("https://labourpro-backend.onrender.com/api/worker", {
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
      await axios.post("https://labourpro-backend.onrender.com/api/attendance", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // trigger salary update
      window.dispatchEvent(new Event("attendanceUpdated"));

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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (fixed left) */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col pt-14 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-8 pb-10 w-full px-4 sm:px-6 md:px-0">
          
          {/* Add Attendance Form */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl md:text-2xl font-bold text-center text-blue-700 mb-6 flex items-center justify-center gap-2">
              <span className="text-2xl ml-1">📝</span> Add Attendance
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {/* Worker */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Worker
                </label>
                <select
                  name="workerId"
                  value={form.workerId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-sm sm:text-base"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Entry Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Entry Time
                </label>
                <input
                  type="time"
                  name="entryTime"
                  value={form.entryTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Exit Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exit Time
                </label>
                <input
                  type="time"
                  name="exitTime"
                  value={form.exitTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>

              {/* Submit */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow text-sm sm:text-base"
                >
                  Submit Attendance
                </button>
              </div>
            </form>
          </div>

          {/* Attendance Viewer */}
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6">
            <ViewAttendanceByDate />
          </div>

          {/* Monthly Salary Summary */}
          <div className="bg-white shadow-lg rounded-2xl p-4 sm:p-6">
            <MonthlySalaryView />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
