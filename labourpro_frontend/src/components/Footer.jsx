const Footer = () => {
  return (
    <footer className="bg-white border-t mt-12 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        <p className="text-center md:text-left">
          &copy; {new Date().getFullYear()} <span className="font-semibold text-blue-600">LabourPro</span>. All rights reserved.
        </p>

        <div className="flex flex-wrap justify-center md:justify-end space-x-6 mt-4 md:mt-0">
          <a
            href="/privacy"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Terms of Service
          </a>
          <a
            href="/contact"
            className="hover:text-blue-600 transition-colors duration-200"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
