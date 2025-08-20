import React from "react";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 ... %3C/svg%3E')]"></div>

        <div className="relative z-10 max-w-4xl">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-6xl">👷‍♂️</span>
            <h1 className="mt-4 text-5xl font-bold">
              Welcome to <span className="text-yellow-300">LabourPro</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mt-4 text-lg text-gray-200"
          >
            Simplify your labour management – track workers, salaries, attendance and more.{" "}
            <span className="text-yellow-300 font-semibold">
              Start your 14-day free trial today!
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/register-trial"
              className="px-6 py-3 rounded-lg bg-yellow-400 text-black font-semibold shadow-lg hover:bg-yellow-300 transition"
            >
              🚀 Start Free Trial
            </a>
            <a
              href="/pricing"
              className="px-6 py-3 rounded-lg bg-white text-gray-800 font-semibold shadow-lg hover:bg-gray-100 transition"
            >
              💰 View Pricing
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-6xl mb-4 block">🤔</span>
            <h2 className="text-3xl font-bold text-gray-800">
              Why Choose LabourPro?
            </h2>
          </motion.div>
          <p className="mt-2 text-gray-600">
            A complete solution to manage your workforce with confidence and efficiency.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
          <motion.div className="p-8 bg-blue-100 rounded-2xl shadow hover:shadow-lg transition">
            <div className="text-5xl">👷</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              Worker Management
            </h3>
            <p className="mt-2 text-gray-600">
              Easily add, update and track all your worker data from one centralized dashboard.
            </p>
          </motion.div>

          <motion.div className="p-8 bg-green-100 rounded-2xl shadow hover:shadow-lg transition">
            <div className="text-5xl">⏱</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              Attendance & Salaries
            </h3>
            <p className="mt-2 text-gray-600">
              Mark attendance seamlessly and generate accurate salary reports with automation.
            </p>
          </motion.div>

          <motion.div className="p-8 bg-purple-100 rounded-2xl shadow hover:shadow-lg transition">
            <div className="text-5xl">💼</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-800">
              Loans & Notifications
            </h3>
            <p className="mt-2 text-gray-600">
              Track loans, repayments, and send automated notifications to keep everyone updated.
            </p>
          </motion.div>
        </div>

        <motion.div className="mt-16 max-w-2xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-800">
            Ready to Transform Your Workforce Management? 🚀
          </h3>
          <p className="mt-2 text-gray-600">
            Join thousands of businesses already using LabourPro.
          </p>
          <a
            href="/register-trial"
            className="inline-block mt-6 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow hover:bg-yellow-300 transition"
          >
            Get Started Now →
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
