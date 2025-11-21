// app/(protected)/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar (Mock) */}
      <aside className="hidden w-64 border-r bg-gray-50 p-6 md:block">
        <h3 className="font-bold text-gray-700">User Menu</h3>
        <ul className="mt-4 space-y-2">
          <li className="font-medium text-black">Overview</li>
          <li className="text-gray-500">Settings</li>
        </ul>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}