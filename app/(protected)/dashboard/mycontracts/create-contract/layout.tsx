"use client";

/**
 * create-contract/layout.tsx
 * -------------------------
 * This is the "Main Frame" of the contract creation experience.
 * * WHY THIS IS A LAYOUT:
 * 1. PERSISTENCE: The ContractProvider stays mounted as you switch steps,
 * meaning your form data is never lost during navigation.
 * 2. STRUCTURE: It defines the 50/50 split-screen layout used by all steps.
 * 3. REACTIVITY: It places the LivePreview next to the form pages so users
 * see their contract grow in real-time.
 */

import { ContractProvider } from "./_context/ContractContext";
import { usePathname, useSearchParams } from "next/navigation";
import type { ContractType } from "@/lib/contract-templates/registry";

// IMPORTANT: We import the real LivePreview component to replace the placeholder
import { LivePreview } from "@/components/contract/LivePreview";

export default function CreateContractLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * 1. ROUTING CHECK
   * If the user is on the main "/create-contract" selection page, we don't
   * want the split-screen or the Provider yet. We just show the grid of cards.
   */
  const isSelectionPage = pathname.endsWith("/create-contract"); 

  if (isSelectionPage) {
    return <>{children}</>;
  }

  /**
   * 2. DATA INITIALIZATION
   * We grab the contract type (e.g., 'service-agreement') from the URL.
   * This is passed into the Provider to load the correct legal logic.
   */
  const type = searchParams.get("type") as ContractType | null;

  // Safety Gate: If no type is in the URL, the app can't know which contract to build.
  if (!type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-lg w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900">Missing Contract Type</h1>
          <p className="text-gray-600 mt-2">Please return to the dashboard and select a template.</p>
        </div>
      </div>
    );
  }

  // Define the labels for the breadcrumb/indicator bar
  const steps = [
    { label: "Parties", path: "step-1" },
    { label: "Basics", path: "step-2" },
    { label: "Payment", path: "step-3" },
    { label: "Legal", path: "step-4" },
    { label: "Add-ons", path: "step-5" },
    { label: "Preview", path: "preview" },
  ];

  return (
    <ContractProvider contractType={type}>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* HEADER SECTION */}
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Contract Builder
              </h1>
              <p className="text-gray-500 mt-1">
                Complete the fields below to generate your legal document.
              </p>
            </div>
            {/* Displaying the active contract type as a subtle badge */}
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              Template: {type.replace(/-/g, " ")}
            </div>
          </div>

          {/* STEP INDICATOR BAR */}
          <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-gray-200">
            {steps.map((step, index) => {
              const isActive = pathname.includes(step.path);
              return (
                <div key={step.path} className="flex items-center gap-2">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                      ${isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}
                  >
                    {index + 1}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* MAIN SPLIT-SCREEN ENGINE */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* LEFT COLUMN: The Active Step Page */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[500px]">
              {children}
            </div>

            {/* RIGHT COLUMN: The Sticky Live Preview */}
            <aside className="sticky top-10">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <LivePreview />
              </div>
              
              {/* Subtle helper text below the preview */}
              <p className="mt-4 text-center text-[11px] text-gray-400 italic">
                Changes are saved locally as you type.
              </p>
            </aside>

          </div>
        </div>
      </div>
    </ContractProvider>
  );
}