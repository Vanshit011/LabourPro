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
import ManagerSalary from "./pages/ManagerSalary";
import WorkerSalary from "./pages/WorkerSalary";
import ContactRenewPlan from "./pages/ContactRemewPlan";

function App() {
  const location = useLocation();

  // Define paths where Navbar and Footer should be hidden
  const hideLayout = [
    // "/login",
    "/dashboard",
    "/dashboard/profile",
    "/dashboard/Worker&Manager",
    "/dashboard/WorkerAttendance",
    "/dashboard/ManagerSalaries&Loans",
    "/dashboard/WorkerSalaries&Loans",
    "/dashboard/contactRenewPlan"
  ];
  const shouldHide = hideLayout.includes(location.pathname);

  return (
   <>
      {!shouldHide && <Navbar />}
      <ScrollToTop />
      <main className="flex-grow container mx-auto">
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

          {/* Protected Routes */}
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
            path="/dashboard/Worker&Manager"
            element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/WorkerAttendance"
            element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/managerSalaries&Loans"
            element={
              <ProtectedRoute>
                <ManagerSalary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/WorkerSalaries&Loans"
            element={
              <ProtectedRoute>
                <WorkerSalary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/contactRenewPlan"
            element={
              <ProtectedRoute>
                <ContactRenewPlan />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!shouldHide && <Footer />}
    </>
  );
}

export default App;
