// app/dashboard/layout.tsx
import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/layout/student/DashboardHeader";
import { DashboardFooter } from "@/components/layout/student/DashboardFooter";
import { GlobalBreadcrumb } from "@/components/layout/GlobalBreadcrumb";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />

      <GlobalBreadcrumb />

      <main className="flex-1">
        <div className="">
          {children}
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
