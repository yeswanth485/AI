"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Zap,
  BarChart3,
  Settings,
  LogOut,
  Upload,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const mainNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/optimization", label: "Optimize", icon: Zap },
  { href: "/orders", label: "Orders", icon: Package },
];

const toolsNav = [
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/inventory", label: "Inventory", icon: Warehouse },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[210px] flex-col border-r border-border bg-ink2">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display text-[18px] font-black tracking-tight">
            Pack<span className="text-accent not-italic">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-1.5 py-3 space-y-4 overflow-y-auto">
        <div>
          <div className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-widest text-muted-dark">
            Main
          </div>
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                  isActive
                    ? "text-accent bg-accent/10"
                    : "text-muted hover:text-foreground hover:bg-white/[.04]"
                )}
              >
                <item.icon className="h-3.5 w-3.5 opacity-50" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div>
          <div className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-widest text-muted-dark">
            Tools
          </div>
          {toolsNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                  isActive
                    ? "text-accent bg-accent/10"
                    : "text-muted hover:text-foreground hover:bg-white/[.04]"
                )}
              >
                <item.icon className="h-3.5 w-3.5 opacity-50" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border p-2">
        <div className="mb-2 flex items-center gap-2.5 px-2.5 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[12px] font-black text-ink">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{user?.name || "User"}</p>
            <p className="truncate text-[11px] text-muted-dark">Warehouse Manager</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted hover:bg-white/[.04] hover:text-accent-red transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
