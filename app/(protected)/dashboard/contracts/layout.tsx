// app/(protected)/dashboard/contracts/layout.tsx
"use client";
import { ReactNode } from "react";

export default function ContractsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div>
    
    {children}
    </div>;
}