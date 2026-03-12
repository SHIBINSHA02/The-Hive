// app/(landing)/_components/Services.tsx
"use client"
import React from 'react';
import { FileText, AlertCircle, MessageSquare, Brain, FileCheck, Shield } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: <FileText className="h-8 w-8 text-blue-500 group-hover:text-blue-600 transition-colors" />,
      title: 'Contract Generation',
      description: 'Generate professional agreements using deep learning, tailored to your specific needs instantly.',
    },
    {
      icon: <Brain className="h-8 w-8 text-indigo-500 group-hover:text-indigo-600 transition-colors" />,
      title: 'Agreement Analysis',
      description: 'Analyze terms and policies with AI-driven insights to ensure compliance and clarity.',
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-cyan-500 group-hover:text-cyan-600 transition-colors" />,
      title: 'Conversational AI',
      description: 'Engage in context-aware discussions about agreements using natural language and vector embeddings.',
    },
    {
      icon: <AlertCircle className="h-8 w-8 text-amber-500 group-hover:text-amber-600 transition-colors" />,
      title: 'Deadline Alerts',
      description: 'Stay on track with automated email and message notifications for critical contract deadlines.',
    },
    {
      icon: <FileCheck className="h-8 w-8 text-emerald-500 group-hover:text-emerald-600 transition-colors" />,
      title: 'Contract Management',
      description: 'Track status, versions, and modifications efficiently in one intelligent system.',
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500 group-hover:text-purple-600 transition-colors" />,
      title: 'Compliance Monitoring',
      description: 'Automated checks ensure all agreements meet the latest regulatory requirements.',
    },
  ];

  return (
    <section id="services" className="py-24 bg-white relative">
      <div className="absolute top-0 inset-x-0 h-px bg-slate-200" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-blue-600 font-medium tracking-wider uppercase text-sm mb-4 block">
            End-to-End Solutions
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold text-slate-900 mb-6">
            Comprehensive control over your agreements
          </h2>
          <p className="text-lg text-slate-600">
            From creation to completion, our AI-powered suite provides everything needed for flawless contract lifecycle management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 overflow-hidden"
            >
              {/* Hover background */}
              <div className="absolute inset-0 bg-transparent group-hover:bg-blue-50/50 transition-colors duration-500 -z-10" />
              
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-white shadow-sm border border-slate-200/60 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}