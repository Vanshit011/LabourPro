import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  Users,
  Calendar,
  Wallet,
  Bell,
  Repeat2,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Profile", path: "/dashboard/profile", icon: <User size={18} /> },
    { name: "Workers", path: "/dashboard/workers", icon: <Users size={18} /> },
    { name: "Attendance", path: "/attendance", icon: <Calendar size={18} /> },
    { name: "Salaries", path: "/salaries", icon: <Wallet size={18} /> },
    { name: "Loans", path: "/loans", icon: <Wallet size={18} /> },
    { name: "Notifications", path: "/notifications", icon: <Bell size={18} /> },
    { name: "Renew Plan", path: "/dashboard/renew-plan", icon: <Repeat2 size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    // Auto close sidebar on route change (mobile)
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Top Nav */}
      <div className="fixed top-0 left-0 w-full z-30 flex justify-between items-center bg-blue-600 text-white px-4 py-3 md:hidden shadow">
        <h1 className="text-lg font-bold">LabourPro</h1>
        <button onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed z-30 top-0 left-0 h-full w-64 bg-blue-700 text-white transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block`}
      >
        <div className="p-6 pt-16 md:pt-6">
          <h2 className="text-2xl font-bold mb-6 hidden md:block">LabourPro</h2>
          <nav className="space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive(link.path)
                    ? "bg-blue-900 font-semibold"
                    : "hover:bg-blue-800"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
