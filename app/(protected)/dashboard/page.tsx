// app/(protected)/dashboard/page.tsx
"use client";
import { Users, DollarSign, Activity, FileText, Clock, AlertCircle } from "lucide-react";

import { EmergencyEmailDialog } from "@/components/dashboard/EmergencyEmailDialog";

import { StatCard } from "@/components/dashboard/StatCard";
import { RowContractCard } from "@/components/dashboard/RowContractCard";

const mockContracts = [
  {
    id: 1,
    companyName: "Apple Inc.",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    title: "Enterprise Software License",
    description: "Annual software licensing agreement for enterprise-level solutions including cloud services and support.",
    startDate: "Jan 15, 2024",
    deadline: "Dec 31, 2024",
    progress: 65,
    backgroundImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    companyName: "Google LLC",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
    title: "Cloud Infrastructure Partnership",
    description: "Strategic partnership for cloud infrastructure deployment and managed services across multiple regions.",
    startDate: "Mar 01, 2024",
    deadline: "Feb 28, 2025",
    progress: 35,
    backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    companyName: "Microsoft",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    title: "Security Compliance Audit",
    description: "Comprehensive security audit and compliance certification for enterprise systems and data protection.",
    startDate: "Feb 10, 2024",
    deadline: "Aug 10, 2024",
    progress: 85,
    backgroundImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    companyName: "Amazon",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    title: "Supply Chain Integration",
    description: "Integration of supply chain management systems with real-time tracking and analytics capabilities.",
    startDate: "Apr 05, 2024",
    deadline: "Oct 05, 2024",
    progress: 50,
    backgroundImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop",
  },
  {
    id: 5,
    companyName: "Tesla",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg",
    title: "Sustainable Energy Contract",
    description: "Long-term agreement for sustainable energy solutions and electric vehicle fleet management services.",
    startDate: "May 20, 2024",
    deadline: "May 19, 2026",
    progress: 15,
    backgroundImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop",
  },
  {
    id: 6,
    companyName: "Meta",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    title: "Digital Marketing Agreement",
    description: "Comprehensive digital marketing and advertising services agreement with performance-based metrics.",
    startDate: "Jun 01, 2024",
    deadline: "Nov 30, 2024",
    progress: 40,
    backgroundImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop",
  },
  {
    id: 7,
    companyName: "Apple Inc.",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    title: "Enterprise Software License",
    description: "Annual software licensing agreement for enterprise-level solutions including cloud services and support.",
    startDate: "Jan 15, 2024",
    deadline: "Dec 31, 2024",
    progress: 65,
    backgroundImage: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
  },
  {
    id: 8,
    companyName: "Google LLC",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
    title: "Cloud Infrastructure Partnership",
    description: "Strategic partnership for cloud infrastructure deployment and managed services across multiple regions.",
    startDate: "Mar 01, 2024",
    deadline: "Feb 28, 2025",
    progress: 35,
    backgroundImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop",
  },
  {
    id: 9,
    companyName: "Microsoft",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    title: "Security Compliance Audit",
    description: "Comprehensive security audit and compliance certification for enterprise systems and data protection.",
    startDate: "Feb 10, 2024",
    deadline: "Aug 10, 2024",
    progress: 85,
    backgroundImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop",
  },
  {
    id: 10,
    companyName: "Amazon",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    title: "Supply Chain Integration",
    description: "Integration of supply chain management systems with real-time tracking and analytics capabilities.",
    startDate: "Apr 05, 2024",
    deadline: "Oct 05, 2024",
    progress: 50,
    backgroundImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop",
  },
  {
    id: 11,
    companyName: "Tesla",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/Tesla_T_symbol.svg",
    title: "Sustainable Energy Contract",
    description: "Long-term agreement for sustainable energy solutions and electric vehicle fleet management services.",
    startDate: "May 20, 2024",
    deadline: "May 19, 2026",
    progress: 15,
    backgroundImage: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop",
  },
  {
    id: 12,
    companyName: "Meta",
    companyLogo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    title: "Digital Marketing Agreement",
    description: "Comprehensive digital marketing and advertising services agreement with performance-based metrics.",
    startDate: "Jun 01, 2024",
    deadline: "Nov 30, 2024",
    progress: 40,
    backgroundImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop",
  },
];


export default function DashboardPage() {
  const handleSendReminder = () => {
    // Implement email sending logic here
    alert(`Reminder email sent to the client!`);
  };
  const items = mockContracts
  return (
    <div className="bg-background ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-y-scroll h-[95vh] ">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                Contract Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                AI-powered contract generation and analysis
              </p>
            </div>
            <EmergencyEmailDialog />
          </div>
        </header>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Clients"
            value="1,234"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value="$12,345"
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Active Contracts"
            value="573"
            icon={FileText}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Pending Actions"
            value="24"
            icon={AlertCircle}
            trend={{ value: 3, isPositive: false }}
          />
        </section>

        <section className="space-y-8">
          {
            items.map((item) => (
              <RowContractCard
                key={item.id}
                companyName={item.companyName}
                companyLogo={item.companyLogo}
                title={item.title}
                description={item.description}
                startDate={item.startDate}
                deadline={item.deadline}
                progress={item.progress}
              />

            ))
          }
               
          
         
        </section>
        
         
    </div>
    </div>
  );
}