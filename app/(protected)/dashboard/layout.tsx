// components/DashboardLayout.tsx (or your layout file)
"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8">
        {/* Note: pt-20 added on mobile to account for the fixed Mobile Navbar height */}
        {children}
      </main>
    </div>
    
  );
}