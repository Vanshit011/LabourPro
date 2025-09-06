const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-700 shadow-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between text-sm">
        <p className="text-center md:text-left mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} <span className="font-bold text-blue-400">LabourPro</span>. All rights reserved.
        </p>

        <div className="flex flex-wrap justify-center md:justify-end space-x-6">
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
      </div>
    </footer>
  );
};

export default Footer;
