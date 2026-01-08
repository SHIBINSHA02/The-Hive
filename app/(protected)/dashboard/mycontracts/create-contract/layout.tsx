// app/(protected)/dashboard/mycontracts/create-contract/layout.tsx
"use client";

import { ContractProvider } from "./_context/ContractContext";
import { usePathname } from "next/navigation";

export default function CreateContractLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const steps = [
    { label: "Basic Details", path: "step-1" },
    { label: "Company Info", path: "step-2" },
    { label: "Introduction", path: "step-3" },
    { label: "Preview", path: "preview" },
  ];

  return (
    <ContractProvider>
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">
              Create Contract
            </h1>
            <p className="text-gray-600 mt-2">
              Follow the steps below to create a legally binding agreement.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-10">
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

          {/* Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {children}
          </div>
        </div>
      </div>
    </ContractProvider>
  );
}
