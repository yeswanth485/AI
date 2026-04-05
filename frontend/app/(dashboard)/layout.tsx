"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuth } from "@/hooks/useAuth";

const pageTitleMap: Record<string, string> = {
  "/dashboard": "Overview",
  "/orders": "Orders",
  "/inventory": "Inventory",
  "/optimization": "Optimize",
  "/analytics": "Analytics",
  "/settings": "Settings",
  "/upload": "Upload",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  const title = pageTitleMap[pathname || "/dashboard"] || "Dashboard";

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-[210px]">
        <Header title={title} />
        <PageWrapper>{children}</PageWrapper>
      </div>
    </div>
  );
}
