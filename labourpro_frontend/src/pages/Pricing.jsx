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
    <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Simple, transparent pricing. No hidden fees. Start with a free trial or upgrade anytime.
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Free Trial */}
          <div className="bg-white border rounded-xl shadow-md p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">🚀 Free Trial</h3>
            <p className="text-gray-500 mb-4">14-day full access</p>
            <p className="text-3xl font-bold text-blue-600 mb-6">₹0</p>
            <a
              href="/register-trial"
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700"
            >
              Start Free Trial
            </a>
          </div>

          {/* Monthly Plan */}
          <div className="bg-white border border-blue-600 rounded-xl shadow-lg p-8 transform scale-105 transition">
            <h3 className="text-xl font-semibold mb-2">💼 Monthly Plan</h3>
            <p className="text-gray-500 mb-4">Perfect for small teams</p>
            <p className="text-3xl font-bold text-green-600 mb-6">₹499</p>
            <button
              onClick={() => handleBuyPlan(499, "monthly")}
              className="w-full bg-green-600 text-white py-3 rounded-md font-semibold hover:bg-green-700"
            >
              Buy Monthly Plan
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-white border rounded-xl shadow-md p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">🏢 Yearly Plan</h3>
            <p className="text-gray-500 mb-4">Save 2 months!</p>
            <p className="text-3xl font-bold text-purple-600 mb-6">₹4999</p>
            <button
              onClick={() => handleBuyPlan(4999, "yearly")}
              className="w-full bg-purple-600 text-white py-3 rounded-md font-semibold hover:bg-purple-700"
            >
              Buy Yearly Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
