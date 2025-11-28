import { useState } from "react";

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateContractDialog = ({ open, onOpenChange }: CreateContractDialogProps) => {
  const [formData, setFormData] = useState({
    companyName: "",
    title: "",
    description: "",
    startDate: "",
    deadline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating contract:", formData);
    onOpenChange(false);
    setFormData({
      companyName: "",
      title: "",
      description: "",
      startDate: "",
      deadline: "",
    });
  };

  // If the dialog is not open, do not render anything
  if (!open) return null;

  return (
    // Backdrop / Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      
      {/* Modal Content */}
      <div className="w-full max-w-[500px] rounded-lg border bg-white p-6 shadow-lg sm:rounded-xl">
        
        {/* Header */}
        <div className="mb-6 space-y-1.5 text-left">
          <h2 className="text-xl font-semibold leading-none tracking-tight">
            Create New Contract
          </h2>
          <p className="text-sm text-gray-500">
            Fill in the details below to create a new contract.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="companyName" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Company Name
            </label>
            <input
              id="companyName"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Enter company name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="title" 
              className="text-sm font-medium leading-none"
            >
              Contract Title
            </label>
            <input
              id="title"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              placeholder="Enter contract title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="description" 
              className="text-sm font-medium leading-none"
            >
              Description
            </label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              placeholder="Enter contract description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label 
                htmlFor="startDate" 
                className="text-sm font-medium leading-none"
              >
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label 
                htmlFor="deadline" 
                className="text-sm font-medium leading-none"
              >
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Create Contract
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateContractDialog;