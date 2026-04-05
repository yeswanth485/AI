"use client";

import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { User, Mail, Globe, LogOut, Shield, Key, Settings, Bell, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-black text-foreground tracking-tight">Settings</h2>
        <p className="text-[12px] text-muted-dark mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card gradient className="overflow-hidden">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-teal flex items-center justify-center text-2xl font-black text-ink shadow-[0_0_20px_rgba(200,255,0,.2)]">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <div className="font-display text-xl font-black text-foreground">{user?.name || "User"}</div>
            <div className="text-[13px] text-muted">{user?.email || ""}</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-ink2/50 border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <User className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Full Name</p>
              <p className="text-[13px] font-medium text-foreground">{user?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-ink2/50 border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
              <Mail className="h-4 w-4 text-teal" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Email</p>
              <p className="text-[13px] font-medium text-foreground">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-ink2/50 border border-border/50">
            <div className="w-10 h-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center">
              <Shield className="h-4 w-4 text-purple" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Role</p>
              <p className="text-[13px] font-medium text-foreground">Warehouse Manager</p>
            </div>
          </div>
        </div>
      </Card>

      {/* API Configuration */}
      <Card>
        <h3 className="mb-4 text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Globe className="h-4 w-4 text-accent" />
          API Configuration
        </h3>
        <div className="bg-ink2 border border-border rounded-xl p-4">
          <div className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">API Base URL</div>
          <code className="text-[13px] text-accent font-mono bg-ink3 px-3 py-2 rounded-lg inline-block">
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
          </code>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <h3 className="mb-4 text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Lock className="h-4 w-4 text-purple" />
          Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-3 px-4 rounded-xl bg-ink2/50 border border-border/50">
            <Key className="h-4 w-4 text-muted-dark" />
            <div className="text-[12px] text-muted">
              <p>JWT authentication with 7-day token expiry.</p>
              <p className="mt-0.5 text-muted-dark">Tokens are stored in localStorage and sent with every request.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h3 className="mb-4 text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Bell className="h-4 w-4 text-teal" />
          Notifications
        </h3>
        <div className="text-[12px] text-muted">
          <p>Real-time notifications for optimization completion and low-stock alerts.</p>
        </div>
      </Card>

      {/* Session */}
      <Card>
        <h3 className="mb-4 text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Settings className="h-4 w-4 text-orange" />
          Session
        </h3>
        <Button variant="danger" onClick={logout}>
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
