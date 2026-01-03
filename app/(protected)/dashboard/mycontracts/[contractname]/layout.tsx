// app/(protected)/dashboard/mycontracts/[contractname]/layout.tsx
export default function ContractLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f8fc] px-6 py-6">
      {children}
    </div>
  );
}
