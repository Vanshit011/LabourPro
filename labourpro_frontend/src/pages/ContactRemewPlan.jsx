import React, { useEffect, useState } from 'react';
import axios from "axios";
import Sidebar from '../components/Sidebar';


// utils/getAdmin.js
const getAdmin = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("https://labourpro-backend.onrender.com/api/admin/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching admin:", err);
    return null;
  }
};

export const RenewContent = () => {
  const [admin, setAdmin] = useState(null);
  const [newPlan, setNewPlan] = useState('monthly');
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getAdmin();
      setAdmin(data);
    };
    load();
  }, []);

  const handleSendWhatsApp = () => {
    if (!admin) return;

    const planPrice = newPlan === 'monthly' ? 500 : 5000;

    const text = `
Hello, I want to upgrade my plan.

📧 Email: ${admin.email}
🏢 Company: ${admin.companyName}
🔁 Current Plan: ${admin.planType}
📅 Expiry: ${new Date(admin.subscriptionExpiry).toLocaleDateString()}
📈 Upgrade To: ${newPlan === 'monthly' ? 'Monthly' : 'Yearly'}
💰 Plan Price: ₹${planPrice}
📝 Message: ${message}
`.trim();

    const encoded = encodeURIComponent(text);
    const link = `https://wa.me/919499558009?text=${encoded}`;
    window.open(link, '_blank');

    // Reset form fields after sending
    setNewPlan('');
    setMessage('');
  };

  if (!admin)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-lg font-semibold text-gray-600 animate-pulse">Loading plan...</p>
      </div>
    );
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Main content (scrollable) */}
      <div className="flex-1 flex flex-col pt-14 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-5xl mx-auto space-y-8 pb-10"></div>
        {/* Main Content */}
        <div className="flex-grow p-6 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-800">Renew or Upgrade Plan</h1>

            {/* Plan Info Card */}
            <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-blue-900">
              <p><strong>Company:</strong> {admin.companyName}</p>
              <p><strong>Current Plan:</strong> {admin.planType}</p>
              <p><strong>Expires on:</strong> {new Date(admin.subscriptionExpiry).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {new Date(admin.subscriptionExpiry) > new Date() ? 'Active ✅' : 'Expired ❌'}</p>
            </div>

            {/* Select New Plan */}
            <label className="block text-sm font-medium text-blue-800 mb-2">Select New Plan</label>
            {/* <select
            value={newPlan}
            onChange={(e) => setNewPlan(e.target.value)}
            className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            <option value="monthly">Monthly Plan</option>
            <option value="yearly">Yearly Plan</option>
          </select> */}

            {/* Select New Plan (Radio buttons) */}
            <div className="flex gap-6 justify-center mb-4">
              <label className="inline-flex items-center cursor-pointer text-blue-800 font-medium">
                <input
                  type="radio"
                  name="plan"
                  value="monthly"
                  checked={newPlan === 'monthly'}
                  onChange={() => setNewPlan('monthly')}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Monthly Plan</span>
              </label>
              <label className="inline-flex items-center cursor-pointer text-blue-800 font-medium">
                <input
                  type="radio"
                  name="plan"
                  value="yearly"
                  checked={newPlan === 'yearly'}
                  onChange={() => setNewPlan('yearly')}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="ml-2">Yearly Plan</span>
              </label>
            </div>


            {/* Price Display */}
            <div className="text-blue-800 font-semibold text-center">
              Plan Price: ₹{newPlan === 'monthly' ? '500' : '5000'} / {newPlan}
            </div>

            {/* Message Textarea */}
            <label className="block text-sm font-medium text-blue-800 mb-2">Message</label>
            <textarea
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Write any additional info..."
            />

            {/* Send Button */}
            <button
              onClick={handleSendWhatsApp}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
            >
              Send Request via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
      );
};

      export default RenewContent;
