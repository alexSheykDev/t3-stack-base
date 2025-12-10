import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "~/_components/modules/dashboard/DashboardLayout";
import { auth } from "~/server/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }
  return <DashboardLayout>{children}</DashboardLayout>;
}
