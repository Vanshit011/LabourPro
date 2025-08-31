import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { Menu } from "lucide-react"; // Optional icon

const Profile = () => {
  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    companyName: "",
  });
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Toggle state

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://labourpro-backend.onrender.com/api/admin/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAdmin(res.data);
        setForm({
          name: res.data.name,
          email: res.data.email,
          companyName: res.data.companyName,
        });
      } catch (err) {
        setMessage("❌ Failed to load profile");
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePasswordChange = (e) =>
    setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "https://labourpro-backend.onrender.com/api/admin/update",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("✅ Profile updated successfully");
    } catch (err) {
      setMessage("❌ Profile update failed");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "https://labourpro-backend.onrender.com/api/admin/change-password",
        passwords,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("✅ Password changed successfully");
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Password change failed");
    }
  };

  if (!admin)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-gray-600 animate-pulse">Loading profile...</p>
      </div>
    );

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100 relative">
        {/* Mobile toggle button */}
       

        <div className="max-w-3xl mx-auto bg-white rounded shadow p-6 border mt-12 md:mt-0">
          <h1 className="text-3xl font-bold mb-6">👤 My Profile</h1>

          {message && (
            <div className="mb-4 px-4 py-2 bg-blue-50 text-blue-700 rounded border border-blue-200">
              {message}
            </div>
          )}

          {/* Profile Update Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={form.companyName}
                disabled
                className="w-full p-3 border rounded bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Update Profile
            </button>
          </form>

          {/* Change Password */}
          <h2 className="text-xl font-semibold mb-4">🔐 Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Old Password</label>
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 border rounded"
                required
              />
            </div>
            <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
