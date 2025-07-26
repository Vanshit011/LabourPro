import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Profile", path: "/dashboard/profile" },
    // { name: "SubAdmins", path: "/dashboard/subadmins" },
    { name: "Workers", path: "/dashboard/workers" },
    { name: "Attendance", path: "/attendance" },
    { name: "Salaries", path: "/salaries" },
    { name: "Loans", path: "/loans" },
    { name: "Notifications", path: "/notifications" },
    { name: "Renew Plan", path: "/renew" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden bg-blue-600 text-white p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <button onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          open ? "block" : "hidden"
        } md:block bg-blue-700 text-white w-64 min-h-screen p-6 fixed md:static z-10`}
      >
        <h1 className="text-2xl font-bold mb-6 hidden md:block">LabourPro</h1>
        <nav className="space-y-3">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block px-3 py-2 rounded hover:bg-blue-600 ${
                location.pathname === link.path ? "bg-blue-800" : ""
              }`}
              onClick={() => setOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="block w-full text-left px-3 py-2 rounded bg-red-600 hover:bg-red-700 mt-6"
        >
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
