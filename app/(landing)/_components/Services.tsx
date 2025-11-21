// app/(landing)/_components/Services.tsx
"use client"
import React from 'react';
import { FileText, AlertCircle, MessageSquare, Brain, FileCheck, Shield } from 'lucide-react';

export default function Services() {
  // Define custom CSS for the blue hover effect using the provided hex color
  // This ensures the shadow and "live" border animation use the exact blue color.
  const blueHex = '#2c6df5';

  return (
    <>
      <style>{`
        .feature-card-hover {
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
          border: 1px solid #e5e7eb; /* Default light border */
        }
        
        .feature-card-hover:hover {
          /* Custom blue shadow (0.25 opacity) + blue border effect on hover */
          box-shadow: 0 15px 30px -10px ${blueHex}40, 0 0 0 4px ${blueHex}aa;
          transform: translateY(-5px);
          border-color: ${blueHex}; /* Optional: Make the primary border blue too */
        }
      `}</style>

      {/* Changed background to solid white */}
      <section id="services" className="bg-[#f1f7ff]">
        <div className='py-20 bg-white rounded-t-[80px]'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 rounded-t-4xl">
          <div className="text-center mb-16">
            {/* Reverted text color to dark for better contrast on white background */}
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive AI-powered solutions for all your contract management needs
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                // Icons remain blue-600
                icon: <FileText className="h-10 w-10 text-blue-600" />,
                title: 'Contract Generation',
                description: 'Generate professional contractor agreements in PDF format using our deep learning-powered platform, tailored to your specific needs with AI precision.',
              },
              {
                icon: <Brain className="h-10 w-10 text-blue-600" />,
                title: 'Agreement Analysis',
                description: 'Analyze terms, conditions, and policies with AI-driven insights using advanced deep learning algorithms to ensure clarity and compliance.',
              },
              {
                icon: <MessageSquare className="h-10 w-10 text-blue-600" />,
                title: 'Conversational AI',
                description: 'Engage in context-aware discussions about agreements with vector embeddings. Ask questions and get instant answers about your contracts.',
              },
              {
                icon: <AlertCircle className="h-10 w-10 text-blue-600" />,
                title: 'Deadline Alerts',
                description: 'Stay on track with automated email and message notifications for contract deadlines. Never miss an important date again.',
              },
              {
                icon: <FileCheck className="h-10 w-10 text-blue-600" />,
                title: 'Contract Management',
                description: 'Manage multiple contracts efficiently with our intelligent system. Track status, versions, and modifications in one centralized platform.',
              },
              {
                icon: <Shield className="h-10 w-10 text-blue-600" />,
                title: 'Compliance Monitoring',
                description: 'Ensure all agreements meet regulatory requirements with automated compliance checks and real-time policy updates.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                // Applied the custom hover class and removed default shadow classes
                className="text-center p-8 rounded-xl bg-white shadow-md feature-card-hover"
              >
                <div className="mb-6 flex justify-center">
                  {/* Icon container remains light blue */}
                  <div className="p-4 bg-blue-50 rounded-full">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>
    </>
  );
}