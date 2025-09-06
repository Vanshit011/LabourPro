import React, { useState } from 'react';

function ContactRemewPlan() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'renewal',
    message: '',
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Integrate backend API for plan updates
    alert(`Request submitted! Subject: ${formData.subject}. We'll process your plan update.`);
    setFormData({ name: '', email: '', subject: 'renewal', message: '' });
  };

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 to-gray-200 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-indigo-600 mb-4">Plan Dashboard</h2>
          <ul className="space-y-3">
            <li><a href="#current-plan" className="text-gray-600 hover:text-indigo-600 font-medium">View Current Plan</a></li>
            <li><a href="#renew" className="text-gray-600 hover:text-indigo-600 font-medium">Renew Plan</a></li>
            <li><a href="#extend" className="text-gray-600 hover:text-indigo-600 font-medium">Extend Trial</a></li>
            <li><a href="#cancel" className="text-gray-600 hover:text-indigo-600 font-medium">Cancel Plan</a></li>
            <li><a href="#support" className="text-gray-600 hover:text-indigo-600 font-medium">Contact Support</a></li>
            <li>
              <a 
                href="https://wa.me/919499558009?text=Hello%2C%20I%20need%20help%20with%20my%20Remew%20Plan" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-green-600 hover:text-green-800 font-medium flex items-center"
              >
                Contact via WhatsApp (9499558009)
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Hamburger Menu for Mobile */}
        <button 
          className="md:hidden text-2xl p-2 mb-4 bg-indigo-600 text-white rounded-md"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center md:text-left">Contact Remew Plan</h1>
        
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
          <p><strong>Company Name:</strong> Remew Plan</p>
          <p><strong>Purpose:</strong> Manage your plan renewals, updates, extensions, or cancellations easily.</p>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">Your Current Plan</h2>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p><strong>Plan Type:</strong> Free Trial</p>
            <p><strong>Expiry Date:</strong> September 18, 2025</p>
            <p><strong>Status:</strong> Active</p>
            <p>Use the form below to request updates like renewal or extension.</p>
          </div>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">Send a Message or Update Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="name" className="block font-medium">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <label htmlFor="email" className="block font-medium">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <label htmlFor="subject" className="block font-medium">Subject</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="renewal">Renew Plan</option>
              <option value="extend">Extend Free Trial</option>
              <option value="cancel">Cancel Free Plan</option>
              <option value="other">Other Update</option>
            </select>

            <label htmlFor="message" className="block font-medium">Message</label>
            <textarea
              id="message"
              name="message"
              rows="5"
              value={formData.message}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button 
              type="submit" 
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
              Submit Request
            </button>
          </form>
        </section>
        
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <p>If you request to <strong>extend your free trial</strong>, we'll review and update your expiry date.</p>
          <p>For <strong>cancellations</strong>, expect a confirmation email before deactivation.</p>
          <p>All requests are processed within 24-48 hours. You'll receive a notification: “Your plan update has been processed!”</p>
        </section>
      </main>
    </div>
  );
}

export default ContactRemewPlan;
