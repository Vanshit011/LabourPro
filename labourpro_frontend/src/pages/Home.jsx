import React from "react";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight"
        >
          👷‍♂️ Welcome to LabourPro
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90"
        >
          Simplify your labour management – track workers, salaries, attendance and more. Start your 14-day free trial today or upgrade to a subscription plan.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <a
            href="/register-trial"
            className="bg-white text-blue-600 font-medium px-8 py-3 rounded-full hover:bg-gray-100 transition shadow"
          >
            🚀 Start Free Trial
          </a>
          <a
            href="/pricing"
            className="border border-white text-white px-8 py-3 rounded-full hover:bg-white hover:text-blue-600 transition"
          >
            💰 View Pricing
          </a>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center">
        <motion.h2
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-4 text-gray-900"
        >
          Why LabourPro? 🤔
        </motion.h2>
        <p className="mb-10 text-lg text-gray-600">
          A complete solution to manage your workforce with confidence.
        </p>

        <div className="grid md:grid-cols-3 gap-10 text-left">
          {/* Feature 1 */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 hover:shadow-lg transition p-8 rounded-2xl border border-gray-100"
          >
            <h3 className="text-xl font-semibold mb-3">👷 Worker Management</h3>
            <p className="text-gray-600">
              Easily add, update and track all your worker data from one place.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 hover:shadow-lg transition p-8 rounded-2xl border border-gray-100"
          >
            <h3 className="text-xl font-semibold mb-3">⏱ Attendance & Salaries</h3>
            <p className="text-gray-600">
              Mark attendance and generate accurate salary reports.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="bg-gray-50 hover:shadow-lg transition p-8 rounded-2xl border border-gray-100"
          >
            <h3 className="text-xl font-semibold mb-3">💼 Loans & Notifications</h3>
            <p className="text-gray-600">
              Track loan advances, repayments and notify staff effortlessly.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
