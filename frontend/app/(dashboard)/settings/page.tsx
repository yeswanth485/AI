"use client";

import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { User, Mail, Globe, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted">Manage your account and preferences</p>
      </div>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Account Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
              <User className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Name</p>
              <p className="text-sm font-medium text-foreground">{user?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email || "—"}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">API Configuration</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15">
            <Globe className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-xs text-muted">API Base URL</p>
            <p className="text-sm font-mono text-foreground">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Session</h3>
        <Button variant="danger" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </Card>
    </div>
  );
}
