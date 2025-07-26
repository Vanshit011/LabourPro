import React from "react";

const Home = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
          Welcome to LabourPro
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">
          Simplify your labour management – track workers, salaries, attendance and more. Start your 14-day free trial today or upgrade to a subscription plan.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="/register-trial"
            className="bg-white text-blue-600 font-medium px-8 py-3 rounded-full hover:bg-gray-100 transition shadow"
          >
            Start Free Trial
          </a>
          <a
            href="/pricing"
            className="border border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-blue-600 transition"
          >
            View Pricing
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-900">Why LabourPro?</h2>
        <p className="mb-10 text-lg text-gray-600">
          A complete solution to manage your workforce with confidence.
        </p>

        <div className="grid md:grid-cols-3 gap-10 text-left">
          {/* Feature 1 */}
          <div className="bg-gray-50 hover:shadow-lg transition p-8 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">🔧 Worker Management</h3>
            <p className="text-gray-600">
              Easily add, update and track all your worker data from one place.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-50 hover:shadow-lg transition p-8 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">⏱ Attendance & Salaries</h3>
            <p className="text-gray-600">
              Mark attendance and generate accurate salary reports.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-50 hover:shadow-lg transition p-8 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-semibold mb-3">💼 Loans & Notifications</h3>
            <p className="text-gray-600">
              Track loan advances, repayments and notify staff effortlessly.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
