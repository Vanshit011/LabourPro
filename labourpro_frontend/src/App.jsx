import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ScrollToTop from "./components/ScrollToTop";

// Registration Pages
import RegisterTrial from "./pages/RegisterTrial";
import RegisterPaid from "./pages/RegisterPaid";

// Dashboard + Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Workers from "./pages/Workers";
import Attendance from "./pages/AttendancePage";

function App() {
  const location = useLocation();

  // Define paths where Navbar and Footer should be hidden
  const hideLayout = ["/dashboard", "/dashboard/profile", "/dashboard/subadmins", "/dashboard/workers", "/dashboard/attendance","/dashboard/renew-plan"]; // you can add more later like "/admin", "/subadmin" etc.
  const shouldHide = hideLayout.includes(location.pathname);

  return (
    <>
      {!shouldHide && <Navbar />}
      <ScrollToTop />
      <div className="min-h-[80vh]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          {/* Registration Routes */}
          <Route path="/register-trial" element={<RegisterTrial />} />
          <Route path="/register-paid" element={<RegisterPaid />} />

          {/* Protected Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/workers"
            element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            }
          />
            <Route
            path="/dashboard/attendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />

        </Routes>

      </div>

      {!shouldHide && <Footer />}
    </>
  );
}

export default App;
