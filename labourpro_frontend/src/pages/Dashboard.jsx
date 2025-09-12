import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://labourpro-backend.onrender.com/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // console.log("Admin data loaded:", res.data);
        setAdmin(res.data);
      } catch (err) {
        console.error("Error loading admin data", err);
      }
    };
    fetchAdmin();
  }, []);

  if (!admin)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg font-semibold text-gray-600 animate-pulse">Loading Dashboard...</p>
      </div>
    );

  const daysLeft = Math.ceil(
    (new Date(admin.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 pt-12 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-700 flex items-center gap-2">
            <span className="text-4xl animate-wave">👋</span> Welcome, {admin.name}
          </h1>

          <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-4 sm:p-6 md:p-8 space-y-6 transition-all duration-300 hover:shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium flex items-center gap-2">
                  <span className="text-blue-600">🏢</span> Company ID
                </span>
                <span className="text-gray-900 font-semibold">{admin.companyId}</span>
              </div> */}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium flex items-center gap-2">
                  <span className="text-blue-600">🏭</span> Company Name
                </span>
                <span className="text-gray-900 font-semibold">{admin.companyName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium flex items-center gap-2">
                  <span className="text-blue-600">📧</span> Email
                </span>
                <span className="text-gray-900 font-semibold">{admin.email}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium flex items-center gap-2">
                  <span className="text-blue-600">📋</span> Plan Type
                </span>
                <span className="text-blue-600 font-bold uppercase">{admin.planType}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg sm:col-span-3">
                <span className="text-gray-600 font-medium flex items-center gap-2">
                  <span className="text-blue-600">⏳</span> Expiry Date
                </span>
                <span className="text-gray-900 font-semibold">
                  {new Date(admin.subscriptionExpiry).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div
              className={`text-center font-bold text-lg py-3 rounded-lg ${
                daysLeft <= 0 ? "text-red-600 bg-red-50" : "text-green-700 bg-green-50"
              } flex items-center justify-center gap-2 transition-colors duration-300`}
            >
              {daysLeft <= 0 ? "🚫 Subscription Expired" : `✅ ${daysLeft} day(s) left`}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
