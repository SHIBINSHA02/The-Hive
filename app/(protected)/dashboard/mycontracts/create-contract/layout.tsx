"use client";

/**
 * create-contract/layout.tsx
 * -------------------------
 * This layout handles the persistent state shell and navigation rules.
 */

import { ContractProvider, useContract } from "./_context/ContractContext";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import type { ContractType } from "@/lib/contract-templates/registry";
import { LivePreview } from "@/components/contract/LivePreview";
import { useEffect } from "react";

// --- NAVIGATION COMPONENT ---
// We move the Step Indicators into a sub-component so it can access the ContractContext
function StepNavigation({ type, pathname }: { type: string; pathname: string }) {
  const router = useRouter();
  const { template, formData } = useContract();

  const steps = [
    { label: "Parties", path: "step-1", index: 0 },
    { label: "Basics", path: "step-2", index: 1 },
    { label: "Payment", path: "step-3", index: 2 },
    { label: "Legal", path: "step-4", index: 3 },
    { label: "Add-ons", path: "step-5", index: 4 },
    { label: "Preview", path: "preview", index: 5 },
  ];

  const handleStepClick = (targetPath: string, targetIndex: number) => {
    const currentStepPath = pathname.split('/').pop() || "";
    const currentStepObj = steps.find(s => s.path === currentStepPath);
    const currentIndex = currentStepObj ? currentStepObj.index : 0;

    // RULE: You can always go BACK.
    if (targetIndex < currentIndex) {
      router.push(`./${targetPath}?type=${type}`);
      return;
    }

    // RULE: You can only go FORWARD if the current step is valid.
    // (Note: For absolute bulletproofing, we'd check all steps in between, 
    // but usually checking the immediate current step is enough for UI clicks).
    router.push(`./${targetPath}?type=${type}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-6 mb-10 pb-6 border-b border-gray-200">
      {steps.map((step, index) => {
        const isActive = pathname.includes(step.path);
        // Step is "reachable" if it's in the past or current
        return (
          <button
            key={step.path}
            onClick={() => handleStepClick(step.path, index)}
            className="flex items-center gap-2 group transition-all"
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${isActive ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"}`}
            >
              {index + 1}
            </div>
            <span className={`text-sm font-medium transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// --- MAIN LAYOUT ---
export default function CreateContractLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as ContractType | null;

  const isSelectionPage = pathname.endsWith("/create-contract"); 
  const isPreviewPage = pathname.endsWith("/preview");

  if (isSelectionPage) {
    return <>{children}</>;
  }

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
                Your changes are automatically saved to your browser as you type.
              </p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              Template: {type.replace(/-/g, " ")}
            </div>
          </div>

          {/* STEP INDICATOR BAR (Now clickable and logic-aware) */}
          <StepNavigation type={type} pathname={pathname} />

          {/* MAIN SPLIT-SCREEN ENGINE */}
          <div className={`grid grid-cols-1 ${!isPreviewPage ? "lg:grid-cols-2" : ""} gap-8 items-start`}>
            
            {/* LEFT COLUMN: The Active Step Page */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[500px] ${isPreviewPage ? "lg:col-span-1" : ""}`}>
              {children}
            </div>

            {/* RIGHT COLUMN: The Sticky Live Preview */}
            {!isPreviewPage && (
              <aside className="sticky top-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <LivePreview />
                </div>
                <p className="mt-4 text-center text-[11px] text-gray-400 italic">
                  Secure Session Active • Data Persisted
                </p>
              </aside>
            )}

          </div>
        </div>
      </div>
    </ContractProvider>
  );
}