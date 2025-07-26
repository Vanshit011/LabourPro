import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

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

  const token = localStorage.getItem("token");

  // Fetch admin profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("https://labourpro-backend.onrender.com/api/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(res.data);
        setForm({
          name: res.data.name,
          email: res.data.email,
          companyName: res.data.companyName,
        });
      } catch (err) {
        setMessage("Failed to load profile");
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
      await axios.put("https://labourpro-backend.onrender.com/api/admin/update", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  if (!admin) return <p className="text-center mt-8">Loading profile...</p>;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">👤 My Profile</h2>

          {message && (
            <p className="mb-4 text-sm text-blue-600 font-semibold">
              {message}
            </p>
          )}

          {/* Profile Form */}
          <form onSubmit={handleUpdateProfile} className="space-y-4 mb-8">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Name"
              className="w-full p-3 border rounded"
              required
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-3 border rounded"
              required
            />
            <input
              type="text"
              name="companyName"
              value={form.companyName}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full p-3 border rounded"
              required
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Update Profile
            </button>
          </form>

          {/* Password Change Form */}
          <h3 className="text-xl font-semibold mb-2">🔒 Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <input
              type="password"
              name="oldPassword"
              value={passwords.oldPassword}
              onChange={handlePasswordChange}
              placeholder="Old Password"
              className="w-full p-3 border rounded"
              required
            />
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              placeholder="New Password"
              className="w-full p-3 border rounded"
              required
            />
            <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Change Password
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
