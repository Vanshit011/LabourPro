import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
    <header className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 tracking-tight hover:text-blue-700 transition-colors duration-200 flex items-center">
          <span className="mr-2"></span> LabourPro
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8 text-base font-medium items-center">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300 ease-in-out"
            >
              {link.label}
            </Link>
          ))}
          
        </nav>

        {/* Mobile toggle button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1 transition duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-4 bg-white border-t border-gray-200 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="block text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 ease-in-out py-2 border-b border-gray-100 last:border-b-0"
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
