import { FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-700 shadow-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between text-sm">
        
        {/* Left Side */}
        <p className="text-center md:text-left mb-4 md:mb-0">
          &copy; {new Date().getFullYear()}{" "}
          <span className="font-bold text-blue-400">LabourPro</span>. All rights reserved.
        </p>

        {/* Right Side */}
        <div className="flex items-center space-x-6">
          <div className="flex space-x-6">
            <a
              href="/privacy"
              className="hover:text-blue-400 transition-colors duration-300 ease-in-out"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-blue-400 transition-colors duration-300 ease-in-out"
            >
              Terms of Service
            </a>
            <a
              href="/contact"
              className="hover:text-blue-400 transition-colors duration-300 ease-in-out"
            >
              Contact Us
            </a>
          </div>

          {/* Developer Info + WhatsApp */}
          <div className="flex items-center space-x-3 border-l border-gray-700 pl-6">
            <span className="text-gray-400">Developed by</span>
            <span className="font-semibold text-gray-400">Vanshit Patel</span>
            <a
              href="https://wa.me/919499558009" // ✅ Opens WhatsApp chat
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-400 text-xl transition-colors duration-300"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
