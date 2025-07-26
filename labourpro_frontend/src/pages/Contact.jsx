const Contact = () => {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Contact Us</h2>

      <div className="bg-gray-50 rounded-lg shadow p-6 mb-8 text-center">
        <p className="text-lg mb-2">Have questions or need support?</p>
        <p>
          Email us at:{" "}
          <a
            href="mailto:support@labourpro.com"
            className="text-blue-600 underline"
          >
            support@labourpro.com
          </a>
        </p>
        <p>
          Call us: <span className="font-medium">+91 98765 43210</span>
        </p>
      </div>

      <form className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full border p-3 rounded"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          className="w-full border p-3 rounded"
          required
        />
        <textarea
          placeholder="Your Message"
          rows="4"
          className="w-full border p-3 rounded"
          required
        ></textarea>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            alert("Message sent (simulated)");
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default Contact;
