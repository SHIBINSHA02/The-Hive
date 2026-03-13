"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContract } from "../_context/ContractContext";
import { FormField } from "@/components/contract/FormField";

export default function StepThreePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  
  // ADDED: isInitialized to ensure we don't check before localStorage loads
  const { template, formData, isInitialized, updateField } = useContract();

  // --- URL GUARD LOGIC ---
  useEffect(() => {
    if (!isInitialized || !template) return;

    // Check if STEP 2 (index 1) is complete
    const prevStepConfig = template.templateConfig.steps[1];
    const prevMissing = prevStepConfig.fields.filter((key: string) => {
      const isRequired = template.contractPlaceholders[key].required;
      const value = formData[key];
      return isRequired && (!value || value.trim() === "");
    });

    // If Step 2 is missing required fields, bounce them back to Step 2
    if (prevMissing.length > 0) {
      router.replace(`./step-2?type=${type}`);
    }
  }, [isInitialized, formData, template, router, type]);
  // -----------------------

  if (!type || !template) return null;

  // Configuration for Step 3 (Index 2)
  const stepConfig = template.templateConfig.steps[2];

  const missingRequiredFields = stepConfig.fields.filter((key) => {
    const isRequired = template.contractPlaceholders[key].required;
    const value = formData[key];
    return isRequired && (!value || value.trim() === "");
  });

  const isStepComplete = missingRequiredFields.length === 0;

  // --- STRUCTURED PAYMENT LOGIC ---
  const [installments, setInstallments] = useState<{ date: string; amount: string }[]>([]);
  const [frequency, setFrequency] = useState<"one-time" | "weekly" | "monthly">("one-time");

  // Parse existing PAYMENT_SCHEDULE if it exists and is a markdown table
  useEffect(() => {
    const existing = formData.PAYMENT_SCHEDULE;
    if (existing && existing.includes("| Date | Amount |")) {
      const lines = existing.split("\n").filter(l => l.includes("|") && !l.includes("---") && !l.includes("Date | Amount"));
      const parsed = lines.map(line => {
        const parts = line.split("|").map(p => p.trim()).filter(Boolean);
        return { date: parts[0], amount: parts[1] };
      });
      if (parsed.length > 0) setInstallments(parsed);
    }
  }, [isInitialized]); // Only on mount

  // Sync installments back to formData as a markdown table
  useEffect(() => {
    if (installments.length === 0) return;

    let table = "| Date | Amount |\n| --- | --- |\n";
    installments.forEach(inst => {
      table += `| ${inst.date} | ${inst.amount} |\n`;
    });
    
    // Only update if different to avoid infinite loops
    if (formData.PAYMENT_SCHEDULE !== table) {
      updateField("PAYMENT_SCHEDULE", table);
    }
  }, [installments]);

  const generateSchedule = () => {
    const startDate = formData.START_DATE;
    const endDate = formData.END_DATE;
    const totalAmount = parseFloat(formData.PAYMENT_AMOUNT || "0");
    const currency = formData.PAYMENT_CURRENCY || "USD";

    if (!startDate || !endDate || isNaN(totalAmount)) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const newInstallments: { date: string; amount: string }[] = [];

    if (frequency === "one-time") {
      newInstallments.push({ date: endDate, amount: `${totalAmount} ${currency}` });
    } else {
      let current = new Date(start);
      const dates: Date[] = [];
      while (current <= end) {
        dates.push(new Date(current));
        if (frequency === "weekly") {
          current.setDate(current.getDate() + 7);
        } else {
          current.setMonth(current.getMonth() + 1);
        }
      }
      
      const amountPerInst = (totalAmount / dates.length).toFixed(2);
      dates.forEach(d => {
        newInstallments.push({ date: d.toISOString().split("T")[0], amount: `${amountPerInst} ${currency}` });
      });
    }

    setInstallments(newInstallments);
  };

  const addInstallment = () => {
    setInstallments([...installments, { date: "", amount: "" }]);
  };

  const updateInstallment = (index: number, field: "date" | "amount", value: string) => {
    const updated = [...installments];
    updated[index][field] = value;
    setInstallments(updated);
  };

  const removeInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };
  // --------------------------------

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Step 3: {stepConfig.title}
        </h1>
        <p className="text-gray-600 mt-1 text-sm">{stepConfig.description}</p>
      </div>

      <div className="space-y-5">
        {stepConfig.fields.map((key) => {
          if (key === "PAYMENT_SCHEDULE") {
            return (
              <div key={key} className="p-4 border border-blue-100 bg-blue-50/30 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-gray-700">Structured Payment Schedule</label>
                  <div className="flex gap-2">
                    <select 
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value as any)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="one-time">One-time</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <button 
                      onClick={generateSchedule}
                      disabled={!formData.START_DATE || !formData.END_DATE || !formData.PAYMENT_AMOUNT}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Generate
                    </button>
                    {installments.length > 0 && (
                      <button 
                        onClick={() => setInstallments([])}
                        className="text-xs border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-50 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {(!formData.START_DATE || !formData.END_DATE || !formData.PAYMENT_AMOUNT) && (
                  <p className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 italic">
                    Fill in Start Date, End Date, and Payment Amount in Step 2 to auto-generate a schedule.
                  </p>
                )}

                <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">Amount</th>
                        <th className="px-4 py-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {installments.map((inst, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            <input 
                              type="date"
                              value={inst.date}
                              onChange={(e) => updateInstallment(idx, "date", e.target.value)}
                              className="w-full border-none p-0 focus:ring-0 text-sm"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input 
                              type="text"
                              value={inst.amount}
                              onChange={(e) => updateInstallment(idx, "amount", e.target.value)}
                              className="w-full border-none p-0 focus:ring-0 text-sm"
                              placeholder="e.g. 1000 USD"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button 
                              onClick={() => removeInstallment(idx)}
                              className="text-red-400 hover:text-red-600"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                      {installments.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
                            No installments added yet. Click generate or add one manually.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <button 
                  onClick={addInstallment}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  + Add Installment
                </button>

                {installments.length > 0 && (
                  <div className="pt-2 border-t border-blue-100 flex justify-between text-[11px] text-gray-500 font-medium">
                    <span>Total Installments: {installments.length}</span>
                    <span>Total Value: {formData.PAYMENT_AMOUNT} {formData.PAYMENT_CURRENCY}</span>
                  </div>
                )}
              </div>
            );
          }
          return <FormField key={key} fieldKey={key} />;
        })}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-100">
        <button
          onClick={() => router.push(`./step-2?type=${type}`)}
          className="px-6 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        <div className="flex flex-col items-end">
          <button
            onClick={() => router.push(`./step-4?type=${type}`)}
            disabled={!isStepComplete}
            className={`px-8 py-2 rounded-md shadow-sm font-medium transition-all ${
              isStepComplete
                ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Next
          </button>
          
          {!isStepComplete && (
            <p className="text-[10px] text-red-500 mt-1">
              Required fields missing
            </p>
          )}
        </div>
      </div>
    </div>
  );
}