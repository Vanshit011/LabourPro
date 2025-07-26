const Contact = () => {
  return (
    <section className="p-6 sm:p-10 max-w-3xl mx-auto">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-700">Contact Us</h2>

      {/* Info Card */}
      <div className="bg-gray-100 border rounded-xl shadow-md p-6 mb-10 text-center">
        <p className="text-lg text-gray-700 mb-2">Have questions or need support?</p>
        <p className="text-gray-600">
          Email us at:{" "}
          <a
            href="mailto:support@labourpro.com"
            className="text-blue-600 underline hover:text-blue-800"
          >
            support@labourpro.com
          </a>
        </p>
        <p className="text-gray-600 mt-1">
          Call us: <span className="font-medium">+91 98765 43210</span>
        </p>
      </div>

      {/* Contact Form */}
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Message sent (simulated)");
        }}
      >
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <textarea
          placeholder="Your Message"
          rows="4"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        ></textarea>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition duration-300 font-medium"
        >
          Send Message
        </button>
      </form>
    </section>
  );
};

export default Contact;
