import React, { useState, useEffect } from "react";
import axios from "axios";
import ViewAttendanceByDate from "../components/ViewAttendanceByDate";

// Helper to get today's date in yyyy-mm-dd format
const getToday = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const AttendancePage = () => {
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    workerId: "",
    date: getToday(), // default to today
    entryTime: "",
    exitTime: "",
  });

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
      await axios.post(
        "http://localhost:5000/api/attendance",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Reset form with date still set to today
      setForm({
        workerId: "",
        date: getToday(),
        entryTime: "",
        exitTime: "",
      });

      // Show temporary popup
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
    <div className="max-w-xl mx-auto p-4 bg-white shadow rounded mt-10">
      <h2 className="text-xl font-semibold mb-4">Add Attendance</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Worker */}
        <div>
          <label className="block text-sm font-medium">Select Worker</label>
          <select
            name="workerId"
            value={form.workerId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Select Worker --</option>
            {workers && workers.length > 0 ? (
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
          <label className="block text-sm font-medium">Date</label>
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
          <label className="block text-sm font-medium">Entry Time</label>
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
          <label className="block text-sm font-medium">Exit Time</label>
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Attendance
        </button>
      </form>

      {/* View attendance table below */}
      <ViewAttendanceByDate />
    </div>
  );
};

export default AttendancePage;
