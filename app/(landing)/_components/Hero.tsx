// app/(landing)/_components/Hero.tsx
"use client"
import React from 'react';
import { FileText, Brain } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Hero() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-300 min-h-screen flex items-center overflow-hidden pt-16 sm:pt-0  lg:rounded-4xl rounded-2xl lg:m-4 sm:m-10 pb-7  ">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center">
            {/* Visual Element */}
            <div
              className={`relative flex justify-center lg:justify-start transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'
                }`}
            >
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-10 lg:p-12 w-full max-w-xs sm:max-w-lg transform hover:scale-105 transition-transform duration-300">
                <div
                  className="absolute top-0 left-0 w-full h-3"
                  style={{ backgroundColor: '#2c6df5', borderTopLeftRadius: '1rem', borderTopRightRadius: '1rem' }}
                ></div>
                <div className="flex justify-center mb-6 mt-2 sm:mt-0">
                  <FileText
                    className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 animate-pulse"
                    style={{ color: '#2c6df5' }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    AI-Powered Contract
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-4">
                    Dynamic, legally sound agreements generated instantly.
                  </p>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-center space-x-3">
                    <div
                      className="rounded-full w-3 h-3 animate-bounce"
                      style={{ backgroundColor: '#2c6df5' }}
                    ></div>
                    <span className="text-sm lg:text-base text-gray-500">Smart Clause Suggestions</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <div
                      className="rounded-full w-3 h-3 animate-bounce delay-100"
                      style={{ backgroundColor: '#2c6df5' }}
                    ></div>
                    <span className="text-sm lg:text-base text-gray-500">Real-Time Analysis</span>
                  </div>
                </div>
                <div
                  className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 rounded-full p-3 sm:p-4 shadow-lg animate-spin-slow"
                  style={{ backgroundColor: '#cce0ff' }}
                >
                  <Brain className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#2c6df5' }} />
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div
              className={`text-center lg:text-left transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
                }`}
            >
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
              >
                Empower Your Agreements with <br /> <span style={{ color: '#2c6df5' }}>The Hive</span>
              </h1>
              <p
                className={`mt-6 lg:mt-8 text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
              >
                Streamline contractor agreements with AI-driven contract generation, analysis, and management powered by deep learning.
              </p>
              {/* CTA Buttons */}
                <div
                  className={`mt-8 lg:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start transition-all duration-700 delay-1000 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                >

                  {/* When user is NOT logged in */}
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button
                        className="text-white px-6 sm:px-10 py-4 text-base sm:text-lg rounded-xl font-semibold hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
                        style={{ backgroundColor: '#1154B9FF' }}
                      >
                        <span>Get Started</span>
                        <svg
                          className="h-6 w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </SignInButton>
                  </SignedOut>

                  {/* When user IS logged in */}
                  <SignedIn>
                    <a
                      href="/dashboard"
                      className="text-white px-6 sm:px-10 py-4 text-base sm:text-lg rounded-xl font-semibold hover:scale-105 flex items-center justify-center space-x-3 shadow-lg"
                      style={{ backgroundColor: '#1154B9FF' }}
                    >
                      <span>Dashboard</span>
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </SignedIn>

                  {/* Request Demo button stays same */}
                  <a
                    href="#demo"
                    className="border-2 text-base sm:text-lg rounded-xl font-semibold px-6 sm:px-10 py-4 shadow-md hover:scale-105"
                    style={{ borderColor: '#1154B9FF', color: '#1154B9FF', backgroundColor: '#ebf2ff' }}
                  >
                    Request a Demo
                  </a>
                </div>

            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-300 {
          transition-delay: 300ms;
        }
        .delay-500 {
          transition-delay: 500ms;
        }
        .delay-700 {
          transition-delay: 700ms;
        }
        .delay-1000 {
          transition-delay: 1000ms;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </section>
  );
}
