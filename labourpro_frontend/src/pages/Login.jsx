import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({ role: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [forgotStep, setForgotStep] = useState(0); // 0: none, 1: enter email, 2: enter OTP, 3: set new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // for Manager login use issue  
  //   const handleSubmit = async (e) => {

  //   e.preventDefault();
  //   setError("");

  //   try {
  //     let endpoint;

  //     // Determine endpoint based on role
  //     if (form.role === "admin") {
  //       endpoint = "http://localhost:5000/api/auth/login";
  //     } else if (form.role === "manager") {
  //       endpoint = "http://localhost:5000/api/auth/managerlogin";
  //     } else if (form.role === "helper") {
  //       endpoint = "http://localhost:5000/api/auth/helperlogin";
  //     } else {
  //       setError("⚠️ Please select a role before login.");
  //       return;
  //     }

  //     // Send login request
  //     const res = await axios.post(endpoint, {
  //       email: form.email,
  //       password: form.password,
  //     });

  //     const token = res.data.token;
  //     localStorage.setItem("token", token);
  //     localStorage.setItem("role", form.role);

  //     let userId, userObj;

  //     // Manager login
  //     if (form.role === "manager") {
  //       userObj = res.data.manager;
  //       userId = res.data.salary?.current?.managerId || userObj?._id;

  //       if (!userId) {
  //         console.error("Manager ID missing in response:", res.data);
  //         setError("Manager ID missing. Contact support.");
  //         return;
  //       }

  //       localStorage.setItem("managerId", userId);
  //       localStorage.setItem("user", JSON.stringify(userObj));
  //       navigate("/manager-dashboard");

  //     } 
  //     // Helper login
  //     else if (form.role === "helper") {
  //       userObj = res.data.helper || res.data.manager; // fallback if backend sends 'manager'
  //       userId = userObj?._id;

  //       if (!userId) {
  //         console.error("Helper ID missing in response:", res.data);
  //         setError("Helper ID missing. Contact support.");
  //         return;
  //       }

  //       localStorage.setItem("helperId", userId);
  //       localStorage.setItem("user", JSON.stringify(userObj));
  //       navigate("/worker-dashboard");

  //     } 
  //     // Admin login
  //     else if (form.role === "admin") {
  //       userObj = res.data.user; // backend sends 'user' object
  //       userId = userObj?._id;

  //       if (!userId) {
  //         console.error("Admin ID missing in response:", res.data);
  //         setError("Admin ID missing. Contact support.");
  //         return;
  //       }

  //       localStorage.setItem("adminId", userId);
  //       localStorage.setItem("user", JSON.stringify(userObj));
  //       navigate("/dashboard");
  //     }

  //   } catch (err) {
  //     console.error("❌ Login error:", err.response?.data || err.message);
  //     setError(err.response?.data?.message || "Login failed");
  //   }
  // };


  // for Admin login use issue
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   try {
  //     let endpoint;

  //     if (form.role === "admin") {
  //       endpoint = "https://labourpro-backend.onrender.com/api/auth/login";
  //     } else if (form.role === "manager") {
  //       endpoint = "https://labourpro-backend.onrender.com/api/auth/manager-login";
  //     } else if (form.role === "helper") {
  //       endpoint = "http://localhost:5000/api/auth/helper-login";
  //     } else {
  //       setError("⚠️ Please select a role before login.");
  //       return;
  //     }

  //     console.log("🔗 Calling endpoint:", endpoint);

  //     const res = await axios.post(endpoint, {
  //       email: form.email,
  //       password: form.password,
  //     });

  //     localStorage.setItem("token", res.data.token);
  //     localStorage.setItem("role", form.role);
  //     localStorage.setItem(
  //       "user",
  //       JSON.stringify(res.data.user || res.data.admin || res.data.manager || res.data.helper)
  //     );

  //     // Redirect based on role
  //     if (form.role === "manager") {
  //       navigate("/manager-dashboard");
  //     } else if (form.role === "helper") {
  //       navigate("/worker-dashboard");
  //     } else if (form.role === "admin") {
  //       navigate("/dashboard");
  //     }
  //   } catch (err) {
  //     console.error("❌ Login error:", err.response?.data || err.message);
  //     setError(err.response?.data?.message || "Login failed");
  //   }
  // };



  // Forgot Password: Step 1 - Send OTP

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let endpoint;

      if (form.role === "admin") {
        endpoint = "https://labourpro-backend.onrender.com/api/auth/login";
      } else if (form.role === "manager") {
        endpoint = "https://labourpro-backend.onrender.com/api/auth/manager-login";
      } else if (form.role === "helper") {
        endpoint = "https://labourpro-backend.onrender.com/api/auth/helper-login";
      } else {
        setError("⚠️ Please select a role before login.");
        return;
      }

      console.log("🔗 Calling endpoint:", endpoint);

      const res = await axios.post(endpoint, {
        email: form.email,
        password: form.password,
      });

      // ✅ Save token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", form.role);

      // ✅ Save user object directly
      const userObj = res.data.user || res.data.admin || res.data.manager || res.data.helper;
      localStorage.setItem("user", JSON.stringify(userObj));

      // ✅ Save companyId (if exists)
      if (userObj?.companyId) {
        localStorage.setItem("companyId", userObj.companyId);
      }

      // ✅ Redirect by role
      if (form.role === "manager") {
        navigate("/manager-dashboard");
      } else if (form.role === "helper") {
        navigate("/worker-dashboard");
      } else if (form.role === "admin") {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("❌ Login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Login failed");
    }
  };


  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    try {
      await axios.post(
        "http://localhost:5000/api/auth/forgotpassword",
        { email: forgotEmail, role: form.role } // add role if needed
      );
      setForgotSuccess("OTP sent to your email.");
      setForgotStep(2); // Move to OTP verification
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to send OTP.");
    }
  };

  // Forgot Password: Step 2 - Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    try {
      await axios.post("http://localhost:5000/api/auth/verifyotp", { email: forgotEmail, otp });
      setForgotSuccess("OTP verified.");
      setForgotStep(3); // Move to set new password
    } catch (err) {
      setForgotError(err.response?.data?.message || "Invalid OTP.");
    }
  };

  // Forgot Password: Step 3 - Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (newPassword !== confirmPassword) {
      return setForgotError("Passwords do not match.");
    }

    try {
      await axios.post("http://localhost:5000/api/auth/resetpassword", { email: forgotEmail, newPassword });
      setForgotSuccess("Password reset successful. You can now login.");
      setForgotStep(0); // Back to login
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <span className="text-blue-600 text-4xl">🔐</span> Login
          </h1>
          <p className="mt-2 text-sm text-gray-600">Access your LabourPro dashboard</p>
        </div>

        {error && (
          <p className="mb-4 text-center text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
        )}

        {forgotStep === 0 ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={form.role === "admin"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">Admin</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="manager"
                      checked={form.role === "manager"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">Manager</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value="helper"
                      checked={form.role === "helper"}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-gray-700">Helper</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
              >
                Login
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <button
                onClick={() => setForgotStep(1)}
                className="text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </>
        ) : (
          <>
            {forgotError && (
              <p className="mb-4 text-center text-sm text-red-600 bg-red-50 p-2 rounded-lg">{forgotError}</p>
            )}
            {forgotSuccess && (
              <p className="mb-4 text-center text-sm text-green-600 bg-green-50 p-2 rounded-lg">{forgotSuccess}</p>
            )}

            {forgotStep === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                  Send OTP
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep(0)}
                  className="w-full text-center text-blue-600 hover:underline mt-2"
                >
                  Back to Login
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                  Verify OTP
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep(0)}
                  className="w-full text-center text-blue-600 hover:underline mt-2"
                >
                  Back to Login
                </button>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep(0)}
                  className="w-full text-center text-blue-600 hover:underline mt-2"
                >
                  Back to Login
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
