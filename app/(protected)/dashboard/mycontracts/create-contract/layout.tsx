"use client";

/**
 * create-contract/layout.tsx
 * -------------------------
 * Wraps all contract creation steps with:
 * - ContractProvider (loads correct template based on ?type= param)
 * - Page structure (header + step indicator)
 *
 * IMPORTANT:
 * This layout persists across all step pages so context data is NOT lost.
 */

import { ContractProvider } from "./_context/ContractContext";
import { usePathname, useSearchParams } from "next/navigation";
import type { ContractType } from "@/lib/contract-templates/registry";

export default function CreateContractLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isSelectionPage = pathname.endsWith("/create-contract"); 

  // 2. BYPASS: If on selection page, just render children (the cards)
  if (isSelectionPage) {
    return <>{children}</>;
  }

  // Read contract type from query param
  const type = searchParams.get("type") as ContractType | null;

  // Basic safety: if no type provided, show error
  if (!type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-lg w-full">
          <h1 className="text-xl font-semibold text-gray-900">
            Missing Contract Type
          </h1>
          <p className="text-gray-600 mt-2">
            Please go back and select a contract type first.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { label: "Step 1", path: "step-1" },
    { label: "Step 2", path: "step-2" },
    { label: "Step 3", path: "step-3" },
    { label: "Step 4", path: "step-4" },
    { label: "Step 5", path: "step-5" },
    { label: "Preview", path: "preview" },
  ];

  return (
    <ContractProvider contractType={type}>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">
              Create Contract
            </h1>
            <p className="text-gray-600 mt-2">
              Fill out the steps below to generate your contract.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            {steps.map((step, index) => {
              const isActive = pathname.includes(step.path);

              return (
                <div key={step.path} className="flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {index + 1}
                  </div>

                  <span
                    className={`text-sm ${
                      isActive ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {children}
            </div>

            {/* RIGHT: Preview Placeholder */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sticky top-10 h-fit">
              <h2 className="text-lg font-semibold text-gray-900">
                Live Preview
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Preview will appear here as you fill out the form.
              </p>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                Coming soon...
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContractProvider>
  );
}
