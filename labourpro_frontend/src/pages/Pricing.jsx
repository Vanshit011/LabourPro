import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "../assets/QR.jpg";

const Pricing = () => {
  const navigate = useNavigate();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [upiTxnId, setUpiTxnId] = useState("");
  const [txnError, setTxnError] = useState("");

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handlePlanClick = (amount, planType) => {
    setSelectedPlan(planType);
    setSelectedAmount(amount);

    if (amount === 0) {
      navigate(`/register-paid?plan=${planType}&amount=${amount}`);
    } else if (isMobile) {
      handleUPIClick(amount, planType);
    } else {
      setShowPaymentOptions(true);
    }
  };

  const handleUPIClick = (amount, plan) => {
    const upiId = "vanshitpatel10@okaxis";
    const name = "LabourPro";
    const txnRef = `LP${Date.now()}`;
    const url = `upi://pay?pa=${upiId}&pn=${name}&tn=${plan}&am=${amount}&cu=INR&tr=${txnRef}`;
    window.location.href = url;

    setTimeout(() => {
      navigate(`/register-paid?plan=${plan}&amount=${amount}`);
    }, 3000);
  };

  const handleVerifyTxn = () => {
    if (/^\d{12}$/.test(upiTxnId)) {
      navigate(
        `/register-paid?plan=${selectedPlan}&amount=${selectedAmount}&txnId=${upiTxnId}`
      );
    } else {
      setTxnError("Enter a valid 12-digit UPI Transaction ID");
    }
  };

  const closeModal = () => {
    setShowPaymentOptions(false);
    setUpiTxnId("");
    setTxnError("");
  };

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
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">
              Free Trial
            </h3>
            <p className="text-gray-500 mb-4">14-day full access</p>
            <ul className="text-gray-600 mb-6 text-left list-disc list-inside space-y-1">
              <li>Up to 10 laborers</li>
              <li>1 company account</li>
              <li>Basic dashboard features</li>
              <li>Limited support</li>
            </ul>
            <p className="text-4xl font-bold text-blue-600 mb-6">₹0</p>
            <button
              onClick={() => handlePlanClick(0, "free-trial")}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow"
            >
              Start Free Trial
            </button>
          </div>

          {/* Monthly Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 relative">
            <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
              Popular
            </span>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">
              Monthly Plan
            </h3>
            <p className="text-gray-500 mb-4">₹499 / month</p>
            <ul className="text-gray-600 mb-6 text-left list-disc list-inside space-y-1">
              <li>Up to 20 laborers</li>
              <li>2-3 company accounts</li>
              <li>Full dashboard features</li>
              <li>Priority support</li>
              <li>Export salary & reports</li>
            </ul>
            <p className="text-4xl font-bold text-green-600 mb-6">₹499</p>
            <button
              onClick={() => handlePlanClick(499, "monthly")}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow"
            >
              Pay via UPI & QR
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
            <h3 className="text-2xl font-semibold mb-2 text-gray-800">
              Yearly Plan
            </h3>
            <p className="text-gray-500 mb-4">₹4999 / year</p>
            <ul className="text-gray-600 mb-6 text-left list-disc list-inside space-y-1">
              <li>Up to 50 laborers</li>
              <li>5 company accounts</li>
              <li>Advanced dashboard features</li>
              <li>Priority support & training</li>
              <li>Export unlimited reports</li>
              <li>Dedicated account manager</li>
            </ul>
            <p className="text-4xl font-bold text-purple-600 mb-6">₹4999</p>
            <button
              onClick={() => handlePlanClick(4999, "yearly")}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-300 shadow"
            >
              Pay via UPI & QR
            </button>
          </div>

        </div>

        {/* QR / Transaction ID Modal */}
        {showPaymentOptions && !isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
            onClick={closeModal}
          >
            <div
              className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
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
              <img
                src={QRCode}
                alt="UPI QR Code"
                className="w-48 h-48 mx-auto mb-4 rounded-lg shadow-md"
              />
              <div className="mt-4">
                <label className="block text-gray-700 mb-1">
                  Enter 12-digit UPI Transaction ID:
                </label>
                <input
                  type="text"
                  value={upiTxnId}
                  onChange={(e) => setUpiTxnId(e.target.value)}
                  maxLength={12}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {txnError && (
                  <p className="text-red-500 mt-1">{txnError}</p>
                )}
                <button
                  onClick={handleVerifyTxn}
                  className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Verify & Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
