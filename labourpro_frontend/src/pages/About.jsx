const About = () => {
  const features = [
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
  ];

  return (
    <section className="p-6 sm:p-10 max-w-6xl mx-auto">
      {/* Title */}
      <h2 className="text-4xl font-bold mb-6 text-center text-blue-700">About LabourPro</h2>

      {/* Description */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <p className="text-lg text-gray-700 leading-relaxed">
          LabourPro is a powerful and user-friendly SaaS solution crafted for modern businesses to manage their workforce seamlessly.
          From attendance tracking to salary calculation and loan management — everything is handled under one secure, multi-tenant platform.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition duration-300"
          >
            <h3 className="text-xl font-semibold mb-2 text-blue-600">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About;
