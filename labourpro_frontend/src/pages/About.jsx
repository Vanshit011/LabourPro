const About = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-8 text-center text-blue-700">About LabourPro</h2>

      {/* Intro Paragraph */}
      <div className="mb-10 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">
          LabourPro is a powerful and user-friendly SaaS solution crafted for modern businesses to manage their workforce seamlessly.
          From attendance tracking to salary calculation and loan management — everything is handled under one secure, multi-tenant platform.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid sm:grid-cols-2 gap-8">
        {[
          {
            title: "👥 Multi-Admin Support",
            desc: "Admins can easily create and manage Sub Admins for better delegation.",
          },
          {
            title: "🏢 Company-Wise Isolation",
            desc: "Each company operates independently with unique Company ID access.",
          },
          {
            title: "📊 Real-Time Salary Tracking",
            desc: "Automatic salary computation and insights for every worker.",
          },
          {
            title: "🔐 Role-Based Secure Access",
            desc: "JWT-secured login for Admin, Sub Admin, and Workers with full access control.",
          },
        ].map((feature, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-xl p-6 border hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2 text-blue-600">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
