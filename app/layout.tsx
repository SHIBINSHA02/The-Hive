// app/layout.tsx
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
// 👇 1. Import your components here

import Footer from "@/components/Footer"; 

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Hive | AI Contract Platform",
  description: "AI-powered contract generation, analysis, and management platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.className} antialiased bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900`}
      >
        {children}
        <Footer /> 
      </body>
    </html>
    </ClerkProvider>
  );
}