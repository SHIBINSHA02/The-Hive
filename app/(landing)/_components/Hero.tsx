// app/(landing)/_components/Hero.tsx
"use client"
import React from 'react';
import { FileText, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from 'next/link';

export default function Hero() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-120 h-120 bg-indigo-400/20 rounded-full blur-[120px] -z-10 mix-blend-multiply delay-1000 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-160 bg-cyan-300/20 rounded-full blur-[120px] -z-10 mix-blend-multiply delay-500 animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className={`flex flex-col text-center lg:text-left transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="inline-flex items-center justify-center lg:justify-start space-x-2 mb-6">
              <span className="px-4 py-1.5 rounded-full bg-blue-100/80 text-blue-800 text-sm font-medium tracking-wide border border-blue-200 backdrop-blur-md flex items-center shadow-sm">
                <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                Next-Gen Contract Intelligence
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Empower Your Agreements with <br className="hidden sm:block" />
              <span className="text-blue-600">
                The Hive
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Streamline contractor agreements with AI-driven contract generation, analysis, and management powered by advanced deep learning models.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-medium text-lg overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
                    <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center justify-center">
                      Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link href="/dashboard" className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-medium text-lg overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto flex justify-center items-center">
                  <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center">
                    Dashboard <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </SignedIn>

              <a href="#demo" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-medium text-lg hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-sm hover:shadow transition-all duration-300 w-full sm:w-auto text-center">
                Watch Demo
              </a>
            </div>
            
            {/* Social Proof / Stats */}
            <div className={`mt-12 pt-8 border-t border-slate-200 flex items-center justify-center lg:justify-start gap-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
               <div className="flex flex-col">
                 <span className="text-3xl font-semibold text-slate-900">99%</span>
                 <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Accuracy</span>
               </div>
               <div className="w-px h-12 bg-slate-200" />
               <div className="flex flex-col">
                 <span className="text-3xl font-semibold text-slate-900">10x</span>
                 <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-1">Faster</span>
               </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className={`relative flex justify-center items-center transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="relative w-full max-w-md aspect-square rounded-[2.5rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 flex flex-col items-center justify-center z-10 overflow-hidden group hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-500">
               <div className="absolute inset-0 bg-white/40 -z-10" />
               
               {/* Decorative background element inside card */}
               <div className="absolute -top-24 -right-24 w-56 h-56 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
               <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />

               <div className="w-24 h-24 mb-6 rounded-3xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                 <Brain className="w-12 h-12 text-white" />
               </div>
               
               <h3 className="text-3xl font-medium text-slate-900 mb-3 tracking-tight">Contract AI</h3>
               <p className="text-center text-slate-500 px-4">Analyzing clauses and generating compliance reports...</p>
               
               {/* Progress bar mock */}
               <div className="w-full h-2.5 bg-slate-200/80 rounded-full mt-8 overflow-hidden shadow-inner">
                 <div className="h-full bg-blue-500 rounded-full w-2/3 animate-[pulse_2s_ease-in-out_infinite]" />
               </div>

               {/* Floating elements */}
               <div className="absolute top-12 left-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 animate-[bounce_3s_infinite]">
                 <FileText className="w-6 h-6 text-blue-600" />
               </div>
            </div>

            {/* Behind card glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/15 blur-[80px] -z-10 rounded-full animate-pulse" />
          </div>

        </div>
      </div>
    </section>
  );
}
