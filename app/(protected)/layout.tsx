// app/(protected)/layout.tsx
import { syncUser } from "@/lib/syncUser";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await syncUser();   
  return <>{children}</>;
}
