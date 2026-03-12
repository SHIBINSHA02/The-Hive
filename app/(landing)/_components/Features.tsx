// app/(landing)/_components/Features.tsx
"use client"
import React from 'react';
import { FileText, AlertCircle, MessageSquare, Brain } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-24 relative bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-blue-600 font-medium tracking-wider uppercase text-sm mb-4 block">
            Platform Capabilities
          </span>
          <h2 className="text-4xl lg:text-5xl font-semibold text-slate-900 tracking-tight mb-6">
            Intelligent features for modern contracts
          </h2>
          <p className="text-lg text-slate-600">
            Everything you need to manage, analyze, and generate agreements with unparalleled speed and accuracy.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Card 1: AI Precision (Large) */}
          <div className="md:col-span-2 relative overflow-hidden rounded-4xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-500 group p-10 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 group-hover:bg-blue-100 transition-colors duration-500" />
            <div>
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-blue-100">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-4">AI-Powered Precision</h3>
              <p className="text-slate-600 text-lg max-w-md leading-relaxed">
                Our advanced deep learning models ensure accurate and highly customized contract generation and analysis, tailored to your specific industry needs.
              </p>
            </div>
            {/* Decorative Mockup */}
            <div className="absolute right-[-40px] bottom-[-40px] w-64 h-48 bg-slate-50 border-t border-l border-slate-200 rounded-tl-3xl shadow-2xl overflow-hidden group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-500 hidden md:block">
               <div className="w-full h-8 border-b border-slate-200 bg-slate-100 flex items-center px-4 space-x-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                 <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
               </div>
               <div className="p-4 space-y-3">
                 <div className="h-2 bg-slate-200 rounded w-3/4 animate-pulse" />
                 <div className="h-2 bg-slate-200 rounded w-full animate-pulse delay-75" />
                 <div className="h-2 bg-slate-200 rounded w-5/6 animate-pulse delay-150" />
                 <div className="h-2 bg-blue-200 rounded w-1/2 animate-pulse delay-300" />
               </div>
            </div>
          </div>

          {/* Card 2: Alerts (Small) */}
          <div className="col-span-1 relative overflow-hidden rounded-4xl bg-slate-900 border border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-500 group p-8 flex flex-col justify-between">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl -z-10 group-hover:bg-indigo-500/20 transition-colors duration-500" />
            <div>
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Timely Alerts</h3>
              <p className="text-slate-400 leading-relaxed max-w-[90%]">
                Receive proactive notifications via messages and email to stay on top of contract deadlines.
              </p>
            </div>
          </div>

          {/* Card 3: Coversational (Small) */}
          <div className="col-span-1 relative overflow-hidden rounded-4xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-500 group p-8 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full blur-2xl -z-10 group-hover:bg-cyan-100 transition-colors duration-500" />
            <div>
              <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 border border-cyan-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-3">Conversational Insights</h3>
              <p className="text-slate-600 leading-relaxed max-w-[90%]">
                Interact with your agreements using vector embeddings for intuitive, natural language queries.
              </p>
            </div>
          </div>

          {/* Card 4: Scalable (Large) */}
          <div className="md:col-span-2 relative overflow-hidden rounded-4xl bg-blue-600 shadow-lg hover:shadow-indigo-500/20 transition-all duration-500 group p-10 flex flex-col justify-between text-white">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none" />
            <div className="relative z-10 lg:w-2/3">
              <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                <Brain className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Scalable Solutions</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Efficiently manage multiple contracts simultaneously with our robust, workflow-driven platform designed to grow with your business needs.
              </p>
            </div>
            {/* Decorative Elements */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col space-y-4">
              <div className="w-48 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center px-4 transform translate-x-8 group-hover:translate-x-0 transition-transform duration-500">
                 <div className="w-3 h-3 rounded-full bg-green-400 mr-3" />
                 <div className="h-2 w-24 bg-white/40 rounded" />
              </div>
              <div className="w-56 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center px-4 transform group-hover:-translate-x-4 transition-transform duration-700 delay-75">
                 <div className="w-3 h-3 rounded-full bg-blue-400 mr-3" />
                 <div className="h-2 w-32 bg-white/40 rounded" />
              </div>
              <div className="w-40 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center px-4 transform translate-x-12 group-hover:translate-x-4 transition-transform duration-500 delay-150">
                 <div className="w-3 h-3 rounded-full bg-purple-400 mr-3" />
                 <div className="h-2 w-16 bg-white/40 rounded" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}