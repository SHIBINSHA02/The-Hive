"use client";

/**
 * LivePreview.tsx
 * ---------------
 * This component acts as a "Real-Time Mirror" of the contract data.
 * It consumes the ContractContext to show a summary of what has been filled.
 */

import { useContract } from "@/app/(protected)/dashboard/mycontracts/create-contract/_context/ContractContext";

export function LivePreview() {
  // 1. Pull current form state and template metadata from Context
  const { formData, template, selectedClauses } = useContract();

  // 2. Logic: Check if the user has started typing anything at all
  // We use .some() to check if at least one value in formData is truthy
  const hasData = Object.values(formData).some(val => val && val.trim() !== "");

  return (
    <div className="space-y-6">
      {/* HEADER: Displays the specific contract type name from the Registry */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Contract Preview
        </h2>
        <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded border border-blue-100">
          {template.templateConfig.name}
        </span>
      </div>

      {!hasData ? (
        /* EMPTY STATE: Shown when no data has been entered yet */
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-xl">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm italic">
            Waiting for data... <br /> Fill out the forms on the left.
          </p>
        </div>
      ) : (
        /* ACTIVE STATE: Fades in as data is populated */
        <div className="space-y-6 animate-in fade-in duration-500">
          
          {/* PARTIES SECTION: Renders if either Party A or Party B names exist */}
          {(formData.PARTY_A_NAME || formData.PARTY_B_NAME) && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Contracting Parties
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="border-r border-gray-200 pr-2">
                  <span className="block text-gray-400 text-[10px] mb-1">Entity A</span>
                  <p className="font-semibold text-gray-900 leading-tight">
                    {formData.PARTY_A_NAME || "—"}
                  </p>
                </div>
                <div className="pl-2">
                  <span className="block text-gray-400 text-[10px] mb-1">Entity B</span>
                  <p className="font-semibold text-gray-900 leading-tight">
                    {formData.PARTY_B_NAME || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* KEY TERMS SECTION: Loops through high-impact fields */}
          <div className="space-y-5">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Essential Terms
            </h3>
            
            {[
              "EFFECTIVE_DATE",
              "SERVICE_DESCRIPTION",
              "PAYMENT_AMOUNT",
              "JURISDICTION"
            ].map((key) => {
              const val = formData[key];
              if (!val) return null; 
              
              // We pull the human-readable label from the template's placeholder config
              const label = template.contractPlaceholders[key]?.label;
              return (
                <div key={key} className="border-l-2 border-blue-100 pl-3">
                  <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
                  <p className="text-sm text-gray-800 font-medium leading-relaxed">
                    {val}
                  </p>
                </div>
              );
            })}
          </div>

          {/* OPTIONAL CLAUSES: Displays badges for clauses selected in Step 5 */}
          {selectedClauses.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Included Addendums
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedClauses.map(id => (
                  <span 
                    key={id} 
                    className="text-[10px] bg-white text-blue-700 px-2 py-1 rounded border border-blue-200 shadow-sm font-medium flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full" />
                    {id.replace(/_/g, " ").toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* SIGNATORY FOOTER: A subtle preview of who is signing */}
          {formData.PARTY_A_SIGNATORY_NAME && (
            <div className="pt-4 border-t border-gray-100 opacity-60 italic">
              <p className="text-[10px] text-gray-400">Proposed Signatory</p>
              <p className="text-xs text-gray-900">
                Authorized: {formData.PARTY_A_SIGNATORY_NAME}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}