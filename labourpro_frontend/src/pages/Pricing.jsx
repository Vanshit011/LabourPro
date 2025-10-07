import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import QrCode from '../assets/QR.jpg';

const Pricing = () => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [upiTxnId, setUpiTxnId] = useState("");
  const [txnError, setTxnError] = useState("");

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const plans = [
    {
      name: "Free Trial",
      price: 0,
      period: "14 days",
      popular: false,
      features: [
        { text: "Up to 10 laborers", included: true },
        { text: "1 company account", included: true },
        { text: "Basic dashboard features", included: true },
        { text: "Email support", included: true },
        { text: "Export reports", included: false },
        { text: "Priority support", included: false }
      ]
    },
    {
      name: "Monthly Plan",
      price: 499,
      period: "month",
      popular: true,
      features: [
        { text: "Up to 20 laborers", included: true },
        { text: "2-3 company accounts", included: true },
        { text: "Full dashboard features", included: true },
        { text: "Priority email support", included: true },
        { text: "Export salary & reports", included: true },
        { text: "Advanced analytics", included: true }
      ]
    },
    {
      name: "Yearly Plan",
      price: 4999,
      period: "year",
      popular: false,
      features: [
        { text: "Up to 50 laborers", included: true },
        { text: "5 company accounts", included: true },
        { text: "Advanced dashboard features", included: true },
        { text: "24/7 priority support", included: true },
        { text: "Unlimited exports", included: true },
        { text: "Dedicated account manager", included: true }
      ]
    }
  ];

  const handlePlanClick = (amount, planType) => {
    setSelectedPlan(planType);
    setSelectedAmount(amount);

    if (amount === 0) {
      // 👉 For Free Trial
      navigate(`/register-trial?plan=${planType}&amount=${amount}`);
    } else if (isMobile) {
      // 👉 For Mobile UPI
      handleUPIClick(amount, planType);
    } else {
      // 👉 For Desktop Payment Modal
      setShowPaymentModal(true);
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
      navigate(`/register-paid?plan=${selectedPlan}&amount=${selectedAmount}&txnId=${upiTxnId}`);
    } else {
      setTxnError("Enter a valid 12-digit UPI Transaction ID");
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setUpiTxnId("");
    setTxnError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navigation />
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select the plan that fits your business needs. Start with a free trial, no credit card required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-blue-600 md:scale-105' : ''
                  }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 rounded-bl-2xl flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">Most Popular</span>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-blue-600">
                        {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                      </span>
                      {plan.price !== 0 && (
                        <span className="text-gray-500">/{plan.period}</span>
                      )}
                    </div>
                    {plan.price === 0 && (
                      <p className="text-gray-500 mt-1">{plan.period} full access</p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePlanClick(plan.price, plan.name.toLowerCase().replace(' ', '-'))}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                  >
                    {plan.price === 0 ? 'Start Free Trial' : 'Get Started'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-600 mb-4">
              All plans include secure data encryption, regular backups, and compliance with data protection regulations.
            </p>
          </motion.div>
        </div>

        {showPaymentModal && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Payment</h3>

              <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">Plan:</span>
                  <span className="font-semibold text-gray-900">{selectedPlan}</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">₹{selectedAmount}</span>
                </div>
                <div className="border-t border-blue-200 pt-4">
                  <p className="text-sm text-gray-600 mb-1">UPI ID:</p>
                  <p className="font-mono text-sm font-semibold text-gray-900">vanshitpatel10@okaxis</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="w-48 h-48 mx-auto mb-4 bg-white p-4 rounded-xl shadow flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                      <img
                        src={QrCode}
                        alt="UPI QR Code"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                  </div>
                </div>
                <p className="text-center text-sm text-gray-600">Scan QR code to pay via UPI</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 12-digit UPI Transaction ID
                </label>
                <input
                  type="text"
                  value={upiTxnId}
                  onChange={(e) => setUpiTxnId(e.target.value)}
                  maxLength={12}
                  placeholder="Enter transaction ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {txnError && (
                  <p className="text-red-600 text-sm mt-2">{txnError}</p>
                )}
              </div>

              <button
                onClick={handleVerifyTxn}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Verify & Continue
              </button>
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
