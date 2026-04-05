"use client";

import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { User, Mail, Globe, LogOut, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-black text-foreground tracking-tight">Settings</h2>
        <p className="text-[12px] text-muted-dark mt-0.5">Manage your account and preferences</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-xl font-black text-ink">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="font-display text-lg font-black text-foreground">{user?.name || "User"}</div>
            <div className="text-[12px] text-muted">{user?.email || ""}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2.5 border-b border-border/50">
            <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center">
              <User className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Full Name</p>
              <p className="text-[13px] font-medium text-foreground">{user?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2.5 border-b border-border/50">
            <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center">
              <Mail className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Email</p>
              <p className="text-[13px] font-medium text-foreground">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-2.5 border-b border-border/50">
            <div className="w-9 h-9 rounded-lg border border-border flex items-center justify-center">
              <Shield className="h-4 w-4 text-accent-green" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Role</p>
              <p className="text-[13px] font-medium text-foreground">Warehouse Manager</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" />
          API Configuration
        </h3>
        <div className="bg-ink2 border border-border rounded-xl p-3">
          <div className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-1">API Base URL</div>
          <code className="text-[13px] text-accent font-mono">
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
          </code>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Key className="h-4 w-4 text-accent-purple" />
          Security
        </h3>
        <div className="text-[12px] text-muted">
          <p>JWT authentication with 7-day token expiry.</p>
          <p className="mt-1">Tokens are stored in localStorage and sent with every request.</p>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-[13px] font-semibold text-foreground">Session</h3>
        <Button variant="danger" onClick={logout}>
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
