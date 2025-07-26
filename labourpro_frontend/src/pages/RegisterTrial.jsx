import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterTrial = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    companyName: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("https://labourpro-backend.onrender.com/api/auth/register-trial", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.admin));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Start Free Trial</h2>
      {error && <p className="text-red-600">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" className="input" onChange={handleChange} required />
        <input name="email" placeholder="Email" className="input" onChange={handleChange} required />
        <input name="password" type="password" placeholder="Password" className="input" onChange={handleChange} required />
        <input name="companyName" placeholder="Company Name" className="input" onChange={handleChange} required />
        <button className="w-full bg-blue-600 text-white py-2 rounded mt-4">Register & Start Trial</button>
      </form>
    </div>
  );
};

export default RegisterTrial;
