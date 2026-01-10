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
    <main>
      <div className="bg-{#60A5FA]">
        <Navbar /> 
      <Hero />
      <Features />
      <Services />
      {/* <Testimonials /> */}
      <Demo />
      </div>
    </main>
  );
}