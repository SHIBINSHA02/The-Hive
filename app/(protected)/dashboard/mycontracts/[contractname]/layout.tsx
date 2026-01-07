// app/(protected)/dashboard/mycontracts/[contractname]/layout.tsx
export default function ContractLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen lg:bg-[#f5f8fc] lg:px-6 lg:py-6 rounded-xl">
      {children}
    </div>
  );
}
