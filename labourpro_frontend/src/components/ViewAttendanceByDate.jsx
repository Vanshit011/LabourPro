import { useState, useEffect } from "react";
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
    <div className="max-w-7xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6 flex items-center justify-center gap-2">
        <span className="text-3xl">📅</span> View Attendance by Date
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 justify-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-auto border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        />
        <button
          onClick={() => fetchAttendanceByDate()}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow transition duration-200"
        >
          View
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
        {records.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                {["Worker Name", "Date", "Entry", "Exit", "Hours", "Roj", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-sm font-semibold text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((rec, i) => (
                <tr key={i} className="hover:bg-gray-50 transition duration-200">
                  <td className="px-4 py-3 text-left">{rec.workerName || "N/A"}</td>
                  <td className="px-4 py-3 text-left">{rec.date}</td>
                  <td className="px-4 py-3 text-left">{rec.entryTime}</td>
                  <td className="px-4 py-3 text-left">{rec.exitTime}</td>
                  <td className="px-4 py-3 text-left">{rec.totalHours || "N/A"}</td>
                  <td className="px-4 py-3 text-left">{rec.totalRojEarned || "N/A"}</td>
                  <td className="px-4 py-3 text-left space-x-2">
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
            <p className="text-center text-lg text-gray-600 p-6 bg-gray-50 rounded-lg">
              No records found for selected date.
            </p>
          )
        )}
      </div>

      {editData && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md mx-4 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>✏️</span> Edit Attendance
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Entry Time</label>
              <input
                type="time"
                value={editData.entryTime || ""}
                onChange={(e) =>
                  setEditData({ ...editData, entryTime: e.target.value })
                }
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Exit Time</label>
              <input
                type="time"
                value={editData.exitTime || ""}
                onChange={(e) =>
                  setEditData({ ...editData, exitTime: e.target.value })
                }
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditData(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 shadow"
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
