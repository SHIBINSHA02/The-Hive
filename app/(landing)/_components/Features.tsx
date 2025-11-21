// app/(landing)/_components/Features.tsx
"use client"
import React from 'react';
import { FileText, AlertCircle, MessageSquare, Brain } from 'lucide-react';

export default function Features() {
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.feature-card').forEach((card) => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="bg-gradient-to-br from-blue-50 via-blue-50 to-blue-200 min-h-screen flex items-center py-16 rounded-t-[80px] m:rounded-t-4xl boarder-t-4 border-blue-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 xl:px-20">
        <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-12 lg:mb-16">
          Why Choose The Hive?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="feature-card bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-500 opacity-0 translate-y-10">
            <div className="flex justify-center mb-4">
              <FileText className="h-12 w-12 animate-pulse" style={{ color: '#2c6df5' }} />
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">AI-Powered Precision</h3>
            <p className="text-base text-gray-600 text-center">
              Our deep learning models ensure accurate and customized contract generation and analysis.
            </p>
          </div>
          <div className="feature-card bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-500 opacity-0 translate-y-10">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 animate-pulse" style={{ color: '#2c6df5' }} />
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Timely Alerts</h3>
            <p className="text-base text-gray-600 text-center">
              Receive notifications via messages and email to stay on top of contract deadlines.
            </p>
          </div>
          <div className="feature-card bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-500 opacity-0 translate-y-10">
            <div className="flex justify-center mb-4">
              <MessageSquare className="h-12 w-12 animate-pulse" style={{ color: '#2c6df5' }} />
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Conversational Insights</h3>
            <p className="text-base text-gray-600 text-center">
              Interact with your agreements using vector embeddings for intuitive, conversation-based queries.
            </p>
          </div>
          <div className="feature-card bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all duration-500 opacity-0 translate-y-10">
            <div className="flex justify-center mb-4">
              <Brain className="h-12 w-12 animate-pulse" style={{ color: '#2c6df5' }} />
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Scalable Solutions</h3>
            <p className="text-base text-gray-600 text-center">
              Efficiently manage multiple contracts with our robust, AI-driven platform.
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
}