import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardLayout } from "~/_components/modules/dashboard/DashboardLayout";

export const metadata: Metadata = { title: "Dashboard" };

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
