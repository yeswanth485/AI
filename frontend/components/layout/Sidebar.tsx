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
  Sparkles,
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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[220px] flex-col border-r border-border bg-ink2/95 backdrop-blur-xl">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_15px_rgba(200,255,0,.2)]">
            <span className="text-ink font-black text-sm">P</span>
          </div>
          <span className="font-display text-[18px] font-black tracking-tight">
            Pack<span className="text-accent not-italic">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-5 overflow-y-auto">
        <div>
          <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[2px] text-muted-dark flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Main
          </div>
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 mb-0.5",
                  isActive
                    ? "text-accent bg-accent/10 shadow-[0_0_20px_rgba(200,255,0,.05)]"
                    : "text-muted hover:text-foreground hover:bg-white/[.04]"
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-all", isActive ? "opacity-100" : "opacity-50")} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div>
          <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[2px] text-muted-dark flex items-center gap-2">
            <Settings className="h-3 w-3" />
            Tools
          </div>
          {toolsNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 mb-0.5",
                  isActive
                    ? "text-accent bg-accent/10 shadow-[0_0_20px_rgba(200,255,0,.05)]"
                    : "text-muted hover:text-foreground hover:bg-white/[.04]"
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-all", isActive ? "opacity-100" : "opacity-50")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[.02] border border-border/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-teal text-[12px] font-black text-ink shadow-[0_0_10px_rgba(200,255,0,.2)]">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{user?.name || "User"}</p>
            <p className="truncate text-[10px] text-muted-dark">Warehouse Manager</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-muted hover:bg-red/5 hover:text-red transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
