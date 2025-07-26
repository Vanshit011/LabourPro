import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

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

  if (!admin)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-gray-600 animate-pulse">Loading Dashboard...</p>
      </div>
    );

  const daysLeft = Math.ceil(
    (new Date(admin.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-12 sm:p-13">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-blue-700">
          👋 Welcome, {admin.name}
        </h1>

        <div className="bg-white border shadow-md rounded-2xl p-6 sm:p-8 max-w-xl space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Company ID:</span>
            <span className="text-gray-900 font-semibold">{admin.companyId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Email:</span>
            <span className="text-gray-900 font-semibold">{admin.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Plan Type:</span>
            <span className="text-blue-600 font-bold uppercase">{admin.planType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 font-medium">Expiry Date:</span>
            <span className="text-gray-900 font-semibold">
              {new Date(admin.subscriptionExpiry).toLocaleDateString()}
            </span>
          </div>
          <div
            className={`text-center font-bold text-lg py-2 rounded-md ${
              daysLeft <= 0 ? "text-red-600 bg-red-100" : "text-green-700 bg-green-100"
            }`}
          >
            {daysLeft <= 0 ? "🚫 Subscription Expired" : `✅ ${daysLeft} day(s) left`}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
