import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ViewAttendanceByDate = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [records, setRecords] = useState([]);
  const [editData, setEditData] = useState(null);

  // Set today's date on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchAttendanceByDate(today);
  }, []);

  const fetchAttendanceByDate = async (dateOverride) => {
    const date = dateOverride || selectedDate;
    if (!date) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/attendance?date=${date}`,
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
      await axios.delete(`http://localhost:5000/api/attendance/${id}`, {
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
        `http://localhost:5000/api/attendance/${_id}`,
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
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">View Attendance by Date</h2>

      {/* Date Picker */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={() => fetchAttendanceByDate()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          View Attendance
        </button>
      </div>

      {/* Attendance Table */}
      {records.length > 0 ? (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Worker Name</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Entry Time</th>
              <th className="p-2 border">Exit Time</th>
              <th className="p-2 border">Total Hours</th>
              <th className="p-2 border">Today Roj</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, i) => (
              <tr key={i}>
                <td className="p-2 border">{rec.workerName || "N/A"}</td>
                <td className="p-2 border">{rec.date}</td>
                <td className="p-2 border">{rec.entryTime}</td>
                <td className="p-2 border">{rec.exitTime}</td>
                <td className="p-2 border">{rec.totalHours || "N/A"}</td>
                <td className="p-2 border">{rec.totalRojEarned || "N/A"}</td>
                <td className="p-2 border flex gap-2">
                  <button
                    onClick={() => handleEdit(rec._id)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rec._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        selectedDate && <p className="text-gray-600 mt-4">No records found.</p>
      )}

      {/* Edit Modal */}
      {editData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h3 className="text-xl font-semibold mb-4">Edit Attendance</h3>
            <div className="mb-2">
              <label className="block text-sm mb-1">Entry Time</label>
              <input
                type="time"
                value={editData.entryTime}
                onChange={(e) =>
                  setEditData({ ...editData, entryTime: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm mb-1">Exit Time</label>
              <input
                type="time"
                value={editData.exitTime}
                onChange={(e) =>
                  setEditData({ ...editData, exitTime: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAttendanceByDate;
