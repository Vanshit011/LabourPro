import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "../assets/QR.jpg";

const Pricing = () => {
  const navigate = useNavigate();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);

  const handlePlanClick = (amount, planType) => {
    if (amount === 0) {
      navigate(`/register-paid?plan=${planType}&amount=${amount}`);
    } else {
      setSelectedPlan(planType);
      setSelectedAmount(amount);
      setShowPaymentOptions(true);
    }
  };

  const handleIPaid = () => {
    setShowPaymentOptions(false);
    navigate(`/register-paid?plan=${selectedPlan}&amount=${selectedAmount}`);
  };

  const closeModal = () => setShowPaymentOptions(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          💼 Choose Your Plan
        </h2>
        <p className="text-lg text-gray-600 mb-12">
          Select the perfect plan to manage your workforce efficiently
        </p>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Trial */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Free Trial</h3>
            <p className="text-gray-500 mb-4">14-day full access to try basic features</p>
            <p className="text-4xl font-bold text-blue-600 mb-6">₹0</p>
            <button
              onClick={() => handlePlanClick(0, "free-trial")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow"
            >
              Start Free Trial
            </button>
            <ul className="mt-4 text-sm text-gray-600 space-y-1">
              <li>✔ Basic Dashboard</li>
              <li>✔ Limited Users</li>
              <li>✔ Email Support</li>
            </ul>
          </div>

          {/* Monthly Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 relative">
            <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">Popular</span>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Monthly Plan</h3>
            <p className="text-gray-500 mb-4">₹499 / month - Perfect for small to medium teams</p>
            <p className="text-4xl font-bold text-blue-600 mb-6">₹499</p>

            <button
              onClick={() => handlePlanClick(499, "monthly")}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow"
            >
              Pay via UPI & QR
            </button>
            <ul className="mt-4 text-sm text-gray-600 space-y-1">
              <li>✔ Unlimited Users</li>
              <li>✔ Advanced Analytics & Reports</li>
              <li>✔ Priority Email & Chat Support</li>
              <li>✔ Attendance & Payroll Automation</li>
              <li>✔ Cloud Backup & Security</li>
            </ul>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">Yearly Plan</h3>
            <p className="text-gray-500 mb-4">₹4999 / year - Save 17% and unlock premium features</p>
            <p className="text-4xl font-bold text-blue-600 mb-6">₹4999</p>

            <button
              onClick={() => handlePlanClick(4999, "yearly")}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-300 shadow"
            >
              Pay via UPI & QR
            </button>
            <ul className="mt-4 text-sm text-gray-600 space-y-1">
              <li>✔ All Monthly Plan Features</li>
              <li>✔ Dedicated Account Manager</li>
              <li>✔ Custom Integrations & Automation</li>
              <li>✔ Advanced Security & GDPR Compliance</li>
              <li>✔ Priority Support & Training</li>
              <li>✔ Export & Multi-location Management</li>
            </ul>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentOptions && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            onClick={closeModal} // Clicking on backdrop closes modal
          >
            <div
              className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full relative animate-fade-in"
              onClick={(e) => e.stopPropagation()} // Prevent modal content click from closing
            >
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <h4 className="text-lg font-semibold mb-4 text-gray-800">
                Complete Payment for {selectedPlan} Plan
              </h4>
              <p className="text-gray-700 mb-2">
                Amount: <strong>₹{selectedAmount}</strong>
              </p>
              <p className="text-gray-700 mb-2">
                UPI ID: <strong>vanshitpatel10@okaxis</strong>
              </p>
              <p className="text-gray-700 mb-4">Scan the QR code below to pay:</p>

              <img
                src={QRCode}
                alt="UPI QR Code"
                className="w-48 h-48 mx-auto mb-4 rounded-lg shadow-md"
              />

              <p className="text-sm text-gray-500 mb-4">
                After completing the payment, click "I Paid" to proceed with registration.
              </p>
              <button
                onClick={handleIPaid}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow"
              >
                I Paid
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Pricing;
