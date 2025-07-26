import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const RegisterPaid = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // Extract plan details from URL
  const planType = params.get("plan");
  const amount = params.get("amount");
  const razorpayOrderId = params.get("order_id");
  const razorpayPaymentId = params.get("payment_id");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://labourpro-backend.onrender.com/api/auth/register-paid", {
        ...form,
        planType,
        amount,
        razorpayOrderId,
        razorpayPaymentId,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Registration</h2>

      <div className="mb-4 text-gray-700">
        <p><strong>Plan:</strong> {planType}</p>
        <p><strong>Amount:</strong> ₹{amount}</p>
        <p><strong>Payment ID:</strong> {razorpayPaymentId}</p>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          className="input"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          className="input"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="input"
          onChange={handleChange}
          required
        />
        <input
          name="companyName"
          placeholder="Company Name"
          className="input"
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded mt-4"
        >
          Register & Access Dashboard
        </button>
      </form>
    </div>
  );
};

export default RegisterPaid;
