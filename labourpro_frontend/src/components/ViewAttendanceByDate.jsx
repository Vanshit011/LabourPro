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

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceByDate(selectedDate);
    }
  }, [selectedDate]);

  // ✅ Auto-refresh when attendance is added
  useEffect(() => {
    const handleAttendanceUpdate = () => {
      fetchAttendanceByDate();
    };

    window.addEventListener("attendanceUpdated", handleAttendanceUpdate);
    return () => {
      window.removeEventListener("attendanceUpdated", handleAttendanceUpdate);
    };
  }, [selectedDate]);

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

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => {
      const newData = { ...prev, [name]: value };
      const entry = name === "entryTime" ? value : newData.entryTime;
      const exit = name === "exitTime" ? value : newData.exitTime;

      if (entry && exit) {
        const start = new Date(`2000-01-01T${entry}`);
        const end = new Date(`2000-01-01T${exit}`);
        if (!isNaN(start) && !isNaN(end) && end > start) {
          const hours = (end - start) / (1000 * 60 * 60);
          newData.totalHours = hours.toFixed(2);
          const rate = newData.rojRate || 50;
          newData.totalRojEarned = (hours * rate).toFixed(2);
        }
      }
      return newData;
    });
  };

  const handleUpdate = async () => {
    try {
      const { _id, entryTime, exitTime, totalHours, rojRate, totalRojEarned } = editData;
      await axios.put(
        `https://labourpro-backend.onrender.com/api/attendance/${_id}`,
        { entryTime, exitTime, totalHours, rojRate, totalRojEarned },
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
      <h2 className="text-2xl font-bold text-blue-700 text-center mb-6 flex items-center justify-center gap-2">
        <span className="text-3xl">📅</span>check Attendance
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
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(rec)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition duration-200 ease-in-out"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5h2m2 0h2a2 2 0 012 2v2m0 2v2m0 2v2a2 2 0 01-2 2h-2m-2 0h-2m-2 0H7a2 2 0 01-2-2v-2m0-2v-2m0-2V7a2 2 0 012-2h2"
                          />
                        </svg>
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this record?")) {
                            handleDelete(rec._id);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition duration-200 ease-in-out"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>

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
                onChange={handleTimeChange}
                name="entryTime"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Exit Time</label>
              <input
                type="time"
                value={editData.exitTime || ""}
                onChange={handleTimeChange}
                name="exitTime"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Hours</label>
              <input
                type="number"
                value={editData.totalHours || ""}
                readOnly
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Roj Rate</label>
              <input
                type="number"
                value={editData.rojRate || ""}
                onChange={(e) => setEditData({ ...editData, rojRate: e.target.value })}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Roj Earned</label>
              <input
                type="number"
                value={editData.totalRojEarned || ""}
                readOnly
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
