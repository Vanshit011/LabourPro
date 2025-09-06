const About = () => {
  const features = [
    {
      title: "👥 Multi-Admin Support",
      desc: "Admins can easily create and manage Sub Admins for better delegation and team collaboration.",
    },
    {
      title: "🏢 Company-Wise Isolation",
      desc: "Each company operates independently with unique Company ID access, ensuring data privacy and security.",
    },
    {
      title: "📊 Real-Time Salary Tracking",
      desc: "Automatic salary computation, loan management, and detailed insights for every worker and manager.",
    },
    {
      title: "🔐 Role-Based Secure Access",
      desc: "JWT-secured login for Admin, Sub Admin, and Workers with full access control and permissions.",
    },
    {
      title: "📅 Attendance Management",
      desc: "Effortless tracking of worker attendance with date-based views, edits, and deletions for accurate records.",
    },
    {
      title: "💼 Comprehensive Reporting",
      desc: "Generate monthly salary summaries, performance reports, and financial overviews to make informed decisions.",
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-gray-50">
      {/* Hero Title and Intro */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-blue-700">About LabourPro</h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          LabourPro is a comprehensive SaaS platform designed to streamline workforce management for businesses of all sizes. 
          From tracking attendance and calculating salaries to managing loans and renewals, our software simplifies complex HR tasks, 
          ensuring efficiency, accuracy, and compliance. Built with modern technology, LabourPro offers secure, role-based access 
          and real-time insights to help you focus on growing your business while we handle the rest.
        </p>
      </div>

      {/* Our Mission Section */}
      <div className="mb-12 bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-blue-600">🎯</span> Our Mission
        </h3>
        <p className="text-gray-600 leading-relaxed">
          At LabourPro, our mission is to empower businesses with intuitive tools that automate administrative burdens, 
          reduce errors in payroll and attendance, and foster a productive work environment. We believe in leveraging 
          technology to make workforce management accessible, scalable, and secure for everyone—from small teams to large enterprises.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300 ease-in-out"
          >
            <h3 className="text-xl font-semibold mb-2 text-blue-600">{feature.title}</h3>
            <p className="text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>

      {/* Why Choose Us Section */}
      <div className="mb-12 bg-blue-50 rounded-2xl shadow-lg p-6 md:p-8">
        <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="text-blue-600">✅</span> Why Choose LabourPro?
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Seamless integration with existing systems for quick setup.</li>
          <li>Customizable plans with flexible pricing to fit your business needs.</li>
          <li>24/7 customer support and regular updates based on user feedback.</li>
          <li>Advanced security features to protect sensitive employee data.</li>
          <li>Intuitive interface that requires minimal training for admins and workers.</li>
        </ul>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <a
          href="/pricing"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg shadow hover:bg-blue-700 transition duration-300 ease-in-out text-lg font-medium"
        >
          Get Started Today
        </a>
      </div>
    </section>
  );
};

export default About;
