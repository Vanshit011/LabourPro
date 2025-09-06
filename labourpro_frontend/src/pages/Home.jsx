import React from "react";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-4 sm:px-6 lg:px-8">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 ... %3C/svg%3E')]"></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-6xl md:text-8xl block mb-4 animate-bounce">👷‍♂️</span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Welcome to <span className="text-yellow-300">LabourPro</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="mt-4 text-lg md:text-xl text-gray-200 max-w-3xl mx-auto"
          >
            Simplify your labour management – track workers, salaries, attendance, and more with ease. 
            <span className="text-yellow-300 font-semibold"> Start your 14-day free trial today!</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/register-trial"
              className="px-6 py-3 rounded-lg bg-yellow-400 text-black font-semibold shadow-lg hover:bg-yellow-300 transition duration-300 flex items-center justify-center gap-2"
            >
              <span className="text-xl">🚀</span> Start Free Trial
            </a>
            <a
              href="/pricing"
              className="px-6 py-3 rounded-lg bg-white text-gray-800 font-semibold shadow-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center gap-2"
            >
              <span className="text-xl">💰</span> View Pricing
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-6xl mb-4 block text-blue-600">🤔</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose LabourPro?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A complete solution to manage your workforce with confidence and efficiency. 
              From real-time tracking to automated reports, LabourPro streamlines your operations.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div 
              className="p-6 bg-blue-100 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl mb-4 text-blue-600">👷</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Worker Management
              </h3>
              <p className="text-gray-600">
                Easily add, update, and track all your worker data from one centralized dashboard.
              </p>
            </motion.div>

            <motion.div 
              className="p-6 bg-green-100 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl mb-4 text-green-600">⏱</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Attendance & Salaries
              </h3>
              <p className="text-gray-600">
                Mark attendance seamlessly and generate accurate salary reports with automation.
              </p>
            </motion.div>

            <motion.div 
              className="p-6 bg-purple-100 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl mb-4 text-purple-600">💼</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Loans & Notifications
              </h3>
              <p className="text-gray-600">
                Track loans, repayments, and send automated notifications to keep everyone updated.
              </p>
            </motion.div>
          </div>

          <motion.div 
            className="mt-16 max-w-2xl mx-auto px-4 sm:px-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Ready to Transform Your Workforce Management? 🚀
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Join thousands of businesses already using LabourPro to streamline operations and boost productivity.
            </p>
            <a
              href="/register-trial"
              className="inline-block px-8 py-4 bg-yellow-400 text-black font-semibold rounded-lg shadow-lg hover:bg-yellow-300 transition duration-300 text-lg"
            >
              Get Started Now →
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
