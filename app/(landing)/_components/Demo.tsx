// app/(landing)/_components/Demo.tsx
"use client"
import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Demo() {
  return (
    <section id="demo" className="py-24 relative bg-white">
      <div className="absolute top-0 inset-x-0 h-px bg-slate-200" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
          
          {/* LEFT — Side Content */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <span className="text-sm text-blue-600 font-medium tracking-wider uppercase mb-4 block">
              Why Choose The Hive?
            </span>

            <h2 className="text-4xl lg:text-5xl font-semibold text-slate-900 mb-6 leading-tight tracking-tight">
              AI-Powered Contract Intelligence <br />
              Built For Modern Teams
            </h2>

            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              Improve compliance accuracy, streamline workflows, and deliver
              exceptional results with intelligent automation and deep
              legal insights.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl font-semibold text-blue-600 mb-2">99%</p>
                <p className="text-slate-600 text-sm font-medium">Compliance Accuracy</p>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl font-semibold text-blue-600 mb-2">10x</p>
                <p className="text-slate-600 text-sm font-medium">Faster Case Review</p>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl font-semibold text-blue-600 mb-2">50%</p>
                <p className="text-slate-600 text-sm font-medium">Reduced Workflow Time</p>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                <p className="text-4xl font-semibold text-blue-600 mb-2">500+</p>
                <p className="text-slate-600 text-sm font-medium">Teams Onboarded</p>
              </div>
            </div>

            {/* Bullet Points */}
            <ul className="space-y-4">
              {[
                "AI-assisted risk assessment",
                "Automated compliance tracking",
                "Secure & Enterprise-grade",
                "Seamless existing tool integration"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center text-slate-700 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — Your Form */}
          <div className="lg:w-1/2 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-lg bg-white rounded-4xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden">
               {/* Decorative background element inside card */}
               <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10" />
               
              <div className="mb-8">
                <h3 className="text-sm font-medium tracking-wider text-slate-500 uppercase mb-2">
                  Unlock Early Access
                </h3>
                <h4 className="text-3xl font-semibold text-slate-900 mb-3">
                  Experience The Hive
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Sign up now for instant access to our advanced contract AI solutions.
                </p>
              </div>

              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-sm font-medium text-slate-700 ml-1">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-sm font-medium text-slate-700 ml-1">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700 ml-1">Work Email <span className="text-red-500">*</span></label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="businessName" className="text-sm font-medium text-slate-700 ml-1">Company Name</label>
                  <input
                    id="businessName"
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="Acme Corp"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-slate-700 ml-1">Additional Information</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    placeholder="Tell us about your use case..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-blue-600 text-white rounded-xl px-4 py-3.5 text-base font-medium hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] transition-all duration-200"
                >
                  Request Access
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
