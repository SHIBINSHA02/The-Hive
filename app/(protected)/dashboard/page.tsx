
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome back, <span className="font-semibold">{session?.user?.name}</span>!
      </p>
      
      <div className="mt-8 rounded-lg border p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Your Application Status</h2>
        <p className="text-green-600">Active</p>
      </div>
    </div>
  );
}