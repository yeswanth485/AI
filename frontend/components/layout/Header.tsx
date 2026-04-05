"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between border-b border-border bg-ink2/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-[18px] font-black tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 bg-surface border border-border rounded-xl px-3 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-dark" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-dark w-32"
          />
        </div>
        <button className="relative rounded-xl p-2 text-muted hover:text-foreground hover:bg-white/[.04] transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red animate-pulse-custom" />
        </button>
        <div className="flex items-center gap-2.5 rounded-xl bg-surface border border-border px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-teal">
            <span className="text-[11px] font-black text-ink">{(user?.name || "U")[0].toUpperCase()}</span>
          </div>
          <span className="text-[13px] font-medium text-foreground hidden sm:inline">{user?.name || "User"}</span>
        </div>
      </div>
    </header>
  );
}
