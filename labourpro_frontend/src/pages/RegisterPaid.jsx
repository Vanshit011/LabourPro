import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const RegisterPaid = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [planType, setPlanType] = useState("");
  const [amount, setAmount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Get planType & amount from query params
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const plan = searchParams.get("plan");
    const amt = searchParams.get("amount");

    if (plan) setPlanType(plan);
    if (amt) setAmount(amt);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        name,
        email,
        password,
        companyName,
        planType,
        amount,
      };

      const { data } = await axios.post(
        "https://labourpro-backend.onrender.com/api/auth/register-paid",
        payload
      );

      // ✅ Store token
      localStorage.setItem("token", data.token);

      setSuccess(data.message);

      // Redirect to dashboard or wherever
      setTimeout(() => {
        navigate("/dashboard"); // change to your dashboard route
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Complete Your Registration
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Display plan & amount */}
          <div className="p-3 bg-gray-100 rounded-lg text-gray-800 font-medium">
            Plan: {planType} | Amount: ₹{amount}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300 shadow"
          >
            {loading ? "Registering..." : "Complete Registration"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPaid;
