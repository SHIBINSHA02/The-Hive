// app/(landing)/_components/Demo.tsx
export function Demo() {
  return (
    <section
      id="demo"
      className="flex flex-col lg:flex-row lg:py-16 lg:rounded-b-4xl border-b-4 border-blue-300 lg:m-0 m-8"
    >
      {/* LEFT — Side Content */}
      <div className="lg:w-1/2 flex flex-col justify-center px-6 lg:px-12 mt-8 lg:mt-0">
        <span className="text-sm text-blue-600 font-semibold tracking-wide">
          Why Choose The Hive?
        </span>

        <h2 className="text-3xl lg:text-5xl font-bold mt-2 leading-tight">
          AI-Powered Dental Intelligence <br />
          Built For Modern Clinics
        </h2>

        <p className="text-gray-600 mt-4 lg:w-[550px]">
          Improve diagnosis accuracy, streamline workflows, and deliver
          exceptional patient care with intelligent automation and deep
          clinical insights.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="p-4 border rounded-2xl shadow-sm">
            <p className="text-3xl font-bold text-blue-600">95%</p>
            <p className="text-gray-600 text-sm mt-1">Diagnostic Accuracy</p>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm">
            <p className="text-3xl font-bold text-blue-600">3x</p>
            <p className="text-gray-600 text-sm mt-1">Faster Case Review</p>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm">
            <p className="text-3xl font-bold text-blue-600">50%</p>
            <p className="text-gray-600 text-sm mt-1">Reduced Workflow Time</p>
          </div>
          <div className="p-4 border rounded-2xl shadow-sm">
            <p className="text-3xl font-bold text-blue-600">100+</p>
            <p className="text-gray-600 text-sm mt-1">Clinics Interested</p>
          </div>
        </div>

        {/* Bullet Points */}
        <ul className="mt-8 space-y-3 text-gray-700">
          <li>✔ AI-assisted treatment planning</li>
          <li>✔ Automated case assessment</li>
          <li>✔ Secure & HIPAA compliant</li>
          <li>✔ Seamless clinic workflow integration</li>
        </ul>
      </div>

      {/* RIGHT — Your Form */}
      <div className="lg:w-1/2 flex justify-center">
        <div className="container lg:border py-6 w-fit lg:m-auto rounded-3xl flex flex-col items-center px-0 sm:px-6 lg:px-12 xl:px-20">
          <h2 className="text-sm font-sans font-medium text-center text-gray-500 p-4">
            UNLOCK EARLY ACCESS
          </h2>

          <p className="text-center lg:text-4xl text-2xl font-semibold font-sans">
            Experience The Hive
          </p>

          <p className="text-center mx-auto p-3 text-gray-500 lg:w-[400px] mt-2">
            Sign up now for instant access to our advanced dental AI solutions.
          </p>

          <form className="mt-6 w-full lg:mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:space-x-3">
              <input
                type="text"
                placeholder="First Name"
                className="border border-gray-400 rounded-md p-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="border border-gray-400 rounded-md p-2 mb-4 w-full"
              />
            </div>

            <div className="flex flex-col">
              <input
                type="email"
                placeholder="Enter your email *"
                className="border border-gray-400 rounded-md p-2 mb-4 w-full"
              />
            </div>

            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Business Name"
                className="border border-gray-400 rounded-md p-2 mb-4 w-full"
              />
            </div>

            <div className="flex flex-col">
              <textarea
                placeholder="Additional Message"
                className="border border-gray-400 rounded-md p-2 mb-4 w-full"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-[calc(theme(spacing.2)-1px)] rounded-full border border-transparent bg-[#155DFC] shadow-md whitespace-nowrap text-base font-medium text-white data-[disabled]:bg-gray-950 data-[hover]:bg-gray-800 data-[disabled]:opacity-40"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
