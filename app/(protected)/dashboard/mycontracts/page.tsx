// app/(protected)/dashboard/mycontracts/page.tsx
// app/(protected)/dashboard/contracts/page.tsx
"use client";

import { useState } from "react";
import { Plus, Filter, LayoutGrid, List, Search } from "lucide-react";
// We import the Dialog we created in the previous step
import CreateContractDialog from "@/components/dashboard/CreateContractDialog";
// Assuming you have a ContractCard component. If not, I've provided a simple version below the main component.
import ContractCard from "@/components/dashboard/ContractCard"; 

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

const filterOptions = ["All Contracts", "Active", "Pending", "Completed"];
export default function ContractPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All Contracts");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContracts = mockContracts.filter((contract) => {
    const matchesSearch =
      contract.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="w-full bg-[#f5f8fc] px-3 sm:px-6 lg:px-10 py-4 sm:py-6 lg:py-8 rounded-4xl min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ---------- HEADER ---------- */}
        <header className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
              Contract Management
            </h1>
            <p className="mt-1 sm:mt-2 text-base sm:text-lg text-blue-500">
              Streamline your business agreements with powerful tools.
            </p>
          </div>

          <blockquote className="border-l-4 border-black pl-3 sm:pl-4">
            <p className="font-serif text-sm sm:text-base lg:text-lg italic text-gray-700 leading-snug">
              &quot;A verbal contract isn&apos;t worth the paper it&apos;s written on.&quot;
            </p>
            <cite className="mt-1 block text-xs sm:text-sm text-blue-500 not-italic">
              — Samuel Goldwyn
            </cite>
          </blockquote>
        </header>

        {/* ---------- ACTIONS BAR ---------- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          {/* LEFT AREA */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Create Button */}
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="inline-flex items-center justify-center rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow hover:bg-black/90 transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Contract
            </button>

            {/* Filters */}
            <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 overflow-x-auto max-w-full">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                    activeFilter === filter
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT AREA */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">

            {/* Search */}
            <div className="relative w-full sm:w-72 lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 pl-10 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0"
              />
            </div>

            {/* View Toggle (Desktop Only) */}
            <div className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 p-1">
              <button className="rounded-md bg-gray-100 p-2 text-black">
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button className="rounded-md p-2 text-gray-500 hover:text-black">
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ---------- CONTRACT GRID ---------- */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 min-h-[60vh]">
          {filteredContracts.map((contract, index) => (
            <div
              key={contract.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <ContractCard {...contract} />
            </div>
          ))}
        </div>

        {/* ---------- EMPTY STATE ---------- */}
        {filteredContracts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gray-100 p-6">
              <Filter className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              No contracts found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filters, or create a new contract.
            </p>

            <button
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4 inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow hover:bg-black/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Contract
            </button>
          </div>
        )}
      </div>

      {/* Create Contract Dialog */}
      <CreateContractDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}