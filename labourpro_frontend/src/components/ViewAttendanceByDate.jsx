import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ViewAttendanceByDate = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [records, setRecords] = useState([]);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceByDate(selectedDate);
    }
  }, [selectedDate]);


  const fetchAttendanceByDate = async (dateOverride) => {
    const date = dateOverride || selectedDate;
    if (!date) return;
    try {
      const res = await axios.get(
        `https://labourpro-backend.onrender.com/api/attendance?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setRecords(res.data.attendance || []);
    } catch (err) {
      console.error("Error fetching attendance", err);
      toast.error("Failed to fetch attendance");
      setRecords([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://labourpro-backend.onrender.com/api/attendance/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Attendance deleted");
      fetchAttendanceByDate();
    } catch (err) {
      toast.error("Failed to delete attendance");
    }
  };

  const handleEdit = (rec) => {
    setEditData({ ...rec });
  };

  const handleUpdate = async () => {
    try {
      const { _id, entryTime, exitTime } = editData;
      await axios.put(
        `https://labourpro-backend.onrender.com/api/attendance/${_id}`,
        { entryTime, exitTime },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Attendance updated");
      setEditData(null);
      fetchAttendanceByDate();
    } catch (err) {
      toast.error("Failed to update attendance");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-center mb-6">📅 View Attendance by Date</h2>

      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 justify-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => fetchAttendanceByDate()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md shadow transition-all"
        >
          View
        </button>
      </div>

      <div className="overflow-x-auto">
        {records.length > 0 ? (
          <table className="w-full table-auto border-collapse border shadow-sm rounded-lg overflow-hidden">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                {["Worker Name", "Date", "Entry", "Exit", "Hours", "Roj", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-sm font-semibold border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {records.map((rec, i) => (
                <tr key={i} className="text-center border-b hover:bg-gray-50 transition">
                  <td className="px-4 py-2 border">{rec.workerName || "N/A"}</td>
                  <td className="px-4 py-2 border">{rec.date}</td>
                  <td className="px-4 py-2 border">{rec.entryTime}</td>
                  <td className="px-4 py-2 border">{rec.exitTime}</td>
                  <td className="px-4 py-2 border">{rec.totalHours || "N/A"}</td>
                  <td className="px-4 py-2 border">{rec.totalRojEarned || "N/A"}</td>
                  <td className="px-4 py-2 border space-x-2">
                    <button
                      onClick={() => handleEdit(rec)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rec._id)}
                      className="text-red-600 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          selectedDate && (
            <p className="text-center text-gray-600 mt-8">No records found for selected date.</p>
          )
        )}
      </div>

      {editData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] sm:w-96 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4">✏️ Edit Attendance</h3>
            <div className="mb-4">
              <label className="block text-sm mb-1">Entry Time</label>
              <input
                type="time"
                value={editData.entryTime || ""}
                onChange={(e) =>
                  setEditData({ ...editData, entryTime: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Exit Time</label>
              <input
                type="time"
                value={editData.exitTime || ""}
                onChange={(e) =>
                  setEditData({ ...editData, exitTime: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-md shadow-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 border rounded-md text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAttendanceByDate;
