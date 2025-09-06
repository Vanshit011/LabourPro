import React, { useState } from 'react';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = form;
    const phone = '919499558009'; // Without +91, as per WhatsApp format
    const text = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    // Reset form fields
    setForm({ name: '', email: '', message: '' });
    // Optional: alert('Message sent via WhatsApp!');
  };

  return (
    <section className="p-6 sm:p-10 max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-700">Contact Us</h2>

      <div className="bg-gray-100 border border-gray-200 rounded-xl shadow-md p-6 mb-10 text-center">
        <p className="text-lg text-gray-700 mb-2">Have questions or need support?</p>
        <p className="text-gray-600">
          Email us at:{' '}
          <a href="mailto:support@labour.com" className="text-blue-600 underline hover:text-blue-800">
            [support@labour.com](mailto:support@labour.com)
          </a>
        </p>
        <p className="text-gray-600 mt-1">
          Call us: <span className="font-medium">+91 94995 58009</span>
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          name="message"
          placeholder="Your Message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
        >
          Send Message via WhatsApp
        </button>
      </form>
    </section>
  );
};

export default Contact;
