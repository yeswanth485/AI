"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between border-b border-border bg-ink2/95 backdrop-blur-sm px-5">
      <div>
        <h2 className="font-display text-[17px] font-black tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-1.5 text-muted hover:text-foreground transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent-red animate-pulse-custom" />
        </button>
        <div className="flex items-center gap-2 rounded-lg bg-surface border border-border px-3 py-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15">
            <span className="text-[11px] font-bold text-accent">{(user?.name || "U")[0].toUpperCase()}</span>
          </div>
          <span className="text-[13px] font-medium text-foreground">{user?.name || "User"}</span>
        </div>
      </div>
    </header>
  );
}
