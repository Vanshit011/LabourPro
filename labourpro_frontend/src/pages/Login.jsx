import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint =
        role === "admin"
          ? "http://localhost:5000/api/auth/login"
          : "http://localhost:5000/api/subadmins/login";

      const res = await axios.post(endpoint, form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.admin || res.data.subAdmin)
      );

      if (role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/subadmin-dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {role === "admin" ? "Admin Login" : "Sub Admin Login"}
      </h2>


      {error && (
        <p className="text-center text-sm text-red-600 mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border border-gray-300 p-3 rounded-md"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full border border-gray-300 p-3 rounded-md"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
