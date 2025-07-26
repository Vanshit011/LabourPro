import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar"; // Assuming you saved the sidebar component here

const Dashboard = () => {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://labourpro-backend.onrender.com/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAdmin(res.data);
      } catch (err) {
        console.error("Error loading admin data", err);
      }
    };
    fetchAdmin();
  }, []);

  if (!admin) return <p className="p-6">Loading Dashboard...</p>;

  const daysLeft = Math.ceil(
    (new Date(admin.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">👋 Welcome, {admin.name}</h1>
        <div className="bg-white shadow p-6 rounded border max-w-xl">
          <p><strong>Company ID:</strong> {admin.companyId}</p>
          <p><strong>Email:</strong> {admin.email}</p>
          <p><strong>Plan Type:</strong> {admin.planType}</p>
          <p><strong>Subscription Expiry:</strong> {new Date(admin.subscriptionExpiry).toLocaleDateString()}</p>
          <p className={`mt-2 font-semibold ${daysLeft <= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {daysLeft <= 0 ? "🚫 Subscription Expired" : `✅ ${daysLeft} day(s) left`}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
