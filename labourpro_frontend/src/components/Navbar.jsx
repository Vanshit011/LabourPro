import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Optional icon library (you can remove if not using)

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/pricing", label: "Pricing" },
    { to: "/contact", label: "Contact" },
    { to: "/login", label: "Login" },
  ];

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">LabourPro</h1>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block text-gray-700 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
