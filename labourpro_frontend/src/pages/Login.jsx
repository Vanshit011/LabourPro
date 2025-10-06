import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, User, AlertCircle } from "lucide-react";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ role: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState(0);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let endpoint;

      if (form.role === "admin") {
        endpoint = "https://labourpro-backend.onrender.com/api/auth/login";
      } else if (form.role === "manager") {
        endpoint = "https://labourpro-backend.onrender.com/api/auth/managerlogin";
      } else if (form.role === "helper") {
        endpoint = "https://labourpro-backend.onrender.com/api/auth/helperlogin";
      } else {
        setError("Please select a role before login.");
        setLoading(false);
        return;
      }

      const res = await axios.post(endpoint, {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", form.role);

      const userObj = res.data.user || res.data.admin || res.data.manager || res.data.helper;
      localStorage.setItem("user", JSON.stringify(userObj));

      if (userObj?.companyId) {
        localStorage.setItem("companyId", userObj.companyId);
      }

      if (form.role === "manager") {
        const managerObj = res.data.manager;
        let managerId = res.data.salary?.current?.managerId;
        if (!managerId) {
          const decoded = JSON.parse(atob(res.data.token.split(".")[1]));
          managerId = decoded.id;
        }
        localStorage.setItem("managerId", managerId);
        navigate("/managerdashboard");
      } else if (form.role === "helper") {
        const workerId = res.data.salary?.current?.workerId || JSON.parse(atob(res.data.token.split(".")[1])).id;
        localStorage.setItem("workerId", workerId);
        navigate("/workerdashboard");
      } else if (form.role === "admin") {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    try {
      await axios.post("https://labourpro-backend.onrender.com/api/auth/forgotpassword", {
        email: forgotEmail,
        role: form.role
      });
      setForgotSuccess("OTP sent to your email.");
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    try {
      await axios.post("https://labourpro-backend.onrender.com/api/auth/verifyotp", {
        email: forgotEmail,
        otp
      });
      setForgotSuccess("OTP verified.");
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Invalid OTP.");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (newPassword !== confirmPassword) {
      return setForgotError("Passwords do not match.");
    }

    try {
      await axios.post("https://labourpro-backend.onrender.com/api/auth/resetpassword", {
        email: forgotEmail,
        newPassword
      });
      setForgotSuccess("Password reset successful. You can now login.");
      setForgotStep(0);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  const roles = [
    { value: "admin", label: "Admin", icon: <User className="w-4 h-4" /> },
    { value: "manager", label: "Manager", icon: <User className="w-4 h-4" /> },
    { value: "helper", label: "Worker", icon: <User className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzM2NzVhOSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-4 shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </motion.div>
          )}

          {forgotStep === 0 ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <label
                      key={role.value}
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        form.role === role.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={form.role === role.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        form.role === role.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {role.icon}
                      </div>
                      <span className={`text-sm font-medium ${
                        form.role === role.value ? "text-blue-600" : "text-gray-700"
                      }`}>
                        {role.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <div>
              {forgotError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                  {forgotSuccess}
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Send OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(0)}
                    className="w-full text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Back to Login
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Verify OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(0)}
                    className="w-full text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Back to Login
                  </button>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    Reset Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(0)}
                    className="w-full text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Back to Login
                  </button>
                </form>
              )}
            </div>
          )}

          {forgotStep === 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setForgotStep(1)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
            Get Started
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
