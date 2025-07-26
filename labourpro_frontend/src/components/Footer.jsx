const Footer = () => {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        <p>&copy; 2025 LabourPro. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/privacy" className="hover:text-blue-600 transition">
            Privacy
          </a>
          <a href="/terms" className="hover:text-blue-600 transition">
            Terms
          </a>
          <a href="/contact" className="hover:text-blue-600 transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
