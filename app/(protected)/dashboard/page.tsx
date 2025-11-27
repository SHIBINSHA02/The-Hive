// app/(protected)/dashboard/page.tsx

export default function DashboardPage() {

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome back!</h1>
      <p className="text-gray-600">Here is your dashboard overview.</p>

      {/* Example Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
          <p className="text-2xl font-bold">$12,345</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Active Now</h3>
          <p className="text-2xl font-bold">573</p>
        </div>
      </div>
    </div>
  );
}