"use client";

import { useContract } from "../_context/ContractContext";

export default function PreviewPage() {
  const { data } = useContract();

  const handleSubmit = () => {
    console.log("FINAL CONTRACT DATA:", data);
    // TODO: send to API
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Contract Preview</h1>

      <pre className="bg-gray-100 p-4 rounded-md text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm"
      >
        Create Contract
      </button>
    </div>
  );
}
