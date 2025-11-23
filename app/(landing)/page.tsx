// app/(landing)/page.tsx

"use client"

import Hero  from "./_components/Hero";
import Features from "./_components/Features";
import Services from "./_components/Services";

export default function HomePage() {
  return (
    <main>
      <div className="bg-{#60A5FA]">
      <Hero />
      <Features />
      <Services />
      </div>
    </main>
  );
}