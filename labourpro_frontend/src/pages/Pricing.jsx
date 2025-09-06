import axios from "axios";

const Pricing = () => {
  const handleBuyPlan = async (amount, planType) => {
    try {
      const res = await axios.post(
        "https://labourpro-backend.onrender.com/api/razorpay/create-order",
        {
          amount,
          planType,
        }
      );

      const options = {
        key: "rzp_test_QDisG20aeCbPzI",
        amount: res.data.amount,
        currency: "INR",
        name: "LabourPro",
        description: `${planType} Subscription`,
        order_id: res.data.id,
        handler: function (response) {
          const queryParams = new URLSearchParams({
            plan: planType,
            amount: amount,
            payment_id: response.razorpay_payment_id,
            order_id: res.data.id,
          }).toString();

          window.location.href = `/register-paid?${queryParams}`;
        },
        prefill: {
          name: "LabourPro User",
          email: "user@example.com",
        },
        theme: {
          color: "#1D4ED8",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Failed to initiate payment.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
          <span className="text-blue-600 text-5xl">💼</span> Choose Your Plan
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Simple, transparent pricing. No hidden fees. Start with a free trial or upgrade anytime 
          to unlock premium features like advanced analytics and unlimited users.
        </p>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Trial */}
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition duration-300">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
              Free
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800 flex items-center justify-center gap-2">
              <span className="text-yellow-500 text-3xl">🚀</span> Free Trial
            </h3>
            <p className="text-gray-500 mb-4">14-day full access</p>
            <p className="text-4xl font-bold text-blue-600 mb-6">₹0</p>
            <a
              href="/register-trial"
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow"
            >
              Start Free Trial
            </a>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✔️ Basic Features</li>
              <li>✔️ Limited Users</li>
              <li>✔️ Email Support</li>
            </ul>
          </div>

          {/* Monthly Plan */}
          <div className="relative bg-white border-2 border-blue-600 rounded-2xl shadow-xl p-6 md:p-8 transform scale-105 transition duration-300">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
              Popular
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800 flex items-center justify-center gap-2">
              <span className="text-green-500 text-3xl">💼</span> Monthly Plan
            </h3>
            <p className="text-gray-500 mb-4">Perfect for small teams</p>
            <p className="text-4xl font-bold text-green-600 mb-6">₹499</p>
            <button
              onClick={() => handleBuyPlan(499, "monthly")}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 shadow"
            >
              Buy Monthly Plan
            </button>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✔️ All Free Features</li>
              <li>✔️ Unlimited Users</li>
              <li>✔️ Priority Support</li>
              <li>✔️ Advanced Analytics</li>
            </ul>
          </div>

          {/* Yearly Plan */}
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:p-8 hover:shadow-xl transition duration-300">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow">
              Save 17%
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-gray-800 flex items-center justify-center gap-2">
              <span className="text-purple-500 text-3xl">🏢</span> Yearly Plan
            </h3>
            <p className="text-gray-500 mb-4">Save 2 months!</p>
            <p className="text-4xl font-bold text-purple-600 mb-6">₹4999</p>
            <button
              onClick={() => handleBuyPlan(4999, "yearly")}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition duration-300 shadow"
            >
              Buy Yearly Plan
            </button>
            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>✔️ All Monthly Features</li>
              <li>✔️ Custom Integrations</li>
              <li>✔️ Dedicated Account Manager</li>
              <li>✔️ Advanced Security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
