// app/(landing)/page.tsx

"use client"

import Hero  from "./_components/Hero";
import Features from "./_components/Features";
import Services from "./_components/Services";
import Navbar from "@/components/Navbar";
// import { Testimonials } from "./_components/Testimonials";
import { Demo } from "./_components/Demo";

export default  function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-slate-50">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-slate-100/50 -z-10 pointer-events-none" />
      <Navbar /> 
      <Hero />
      <Features />
      <Services />
      {/* <Testimonials /> */}
      <Demo />
    </main>
  );
}