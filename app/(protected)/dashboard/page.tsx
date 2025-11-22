// app/(protected)/dashboard/page.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64">Sidebar content</aside>
      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
