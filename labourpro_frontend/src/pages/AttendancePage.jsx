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
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [mode, setMode] = useState("single"); // "single" or "multiple"
  const [form, setForm] = useState({
    workerId: "",
    date: localStorage.getItem("attendanceDate") || getToday(), // ✅ load last selected or today's date
    entryTime: localStorage.getItem("attendanceEntryTime") || "08:00", // ✅ Default 8:00 AM
    exitTime: localStorage.getItem("attendanceExitTime") || "20:00",   // ✅ Default 8:00 PM
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
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // persist date and times so they stay even if you navigate away
    if (name === "date") localStorage.setItem("attendanceDate", value);
    if (name === "entryTime") localStorage.setItem("attendanceEntryTime", value);
    if (name === "exitTime") localStorage.setItem("attendanceExitTime", value);
  };

  const handleWorkerSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setSelectedWorkers(selectedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "single" && !form.workerId) {
      alert("Please select a worker");
      return;
    }

    if (mode === "multiple" && selectedWorkers.length === 0) {
      alert("Please select at least one worker");
      return;
    }

    try {
      if (mode === "single") {
        await axios.post(
          "https://labourpro-backend.onrender.com/api/attendance",
          form,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        for (let workerId of selectedWorkers) {
          await axios.post(
            "https://labourpro-backend.onrender.com/api/attendance",
            { ...form, workerId },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        }
      }

      window.dispatchEvent(new Event("attendanceUpdated"));

      // Reset form
      // ✅ Reset form correctly after submit
      setForm({
        workerId: "",
        date: form.date,              // ✅ Keep same selected date
        entryTime: "08:00",           // ✅ Reset to default entry time
        exitTime: "20:00",            // ✅ Reset to default exit time
      });

      // ✅ Also clear selected multiple workers
      setSelectedWorkers([]);


      const popup = document.createElement("div");
      popup.innerText =
        mode === "single"
          ? "✅ Attendance added successfully!"
          : "✅ Attendance added for selected workers!";
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
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col pt-14 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto space-y-8 pb-10 w-full px-4 sm:px-6 md:px-0">
          {/* Attendance Form */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h2 className="text-xl md:text-2xl font-bold text-center text-blue-700 mb-6">
              📝 Add Attendance
            </h2>

            {/* Mode Selector */}
            <div className="flex justify-center gap-6 mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="single"
                  checked={mode === "single"}
                  onChange={(e) => setMode(e.target.value)}
                />
                <span className="text-gray-700 text-sm font-medium">Single Worker</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="multiple"
                  checked={mode === "multiple"}
                  onChange={(e) => setMode(e.target.value)}
                />
                <span className="text-gray-700 text-sm font-medium">Multiple Workers</span>
              </label>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Worker Selection */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "single" ? "Select Worker" : "Select Multiple Workers(Hold Ctrl or Cmd to select multiple)"}
                </label>

                {mode === "single" ? (
                  <select
                    name="workerId"
                    value={form.workerId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                ) : (
                  <select
                    multiple
                    name="workerId"
                    value={selectedWorkers}
                    onChange={handleWorkerSelect}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    required
                  >
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
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Entry Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Entry Time</label>
                <input
                  type="time"
                  name="entryTime"
                  value={form.entryTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Exit Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exit Time</label>
                <input
                  type="time"
                  name="exitTime"
                  value={form.exitTime}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300 shadow"
                >
                  {mode === "single"
                    ? "Submit Attendance"
                    : "Submit Attendance for All Selected"}
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
