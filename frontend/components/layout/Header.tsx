"use client";

import { useAuth } from "@/hooks/useAuth";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-muted hover:bg-surface hover:text-foreground transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-red" />
        </button>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20">
            <User className="h-3.5 w-3.5 text-accent" />
          </div>
          <span className="text-sm font-medium text-foreground">{user?.name || "User"}</span>
        </div>
      </div>
    </header>
  );
}
