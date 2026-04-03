import Link from "next/link";
import { Package, TrendingUp, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">PackAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <span className="text-sm text-muted hover:text-foreground transition-all">Login</span>
            </Link>
            <Link href="/register">
              <span className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-all">
                Get Started
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Smart Packaging
            <br />
            <span className="text-accent">Optimization</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            Reduce shipping costs with AI-driven box selection and packaging optimization.
            Real-time analytics, automated decisions, measurable savings.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <span className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-all">
                Login to Dashboard
              </span>
            </Link>
            <Link href="/register">
              <span className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground hover:bg-border transition-all">
                Create Account
              </span>
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Cost Optimization</h3>
              <p className="mt-2 text-sm text-muted">
                AI analyzes every order to find the most cost-effective packaging solution,
                reducing shipping costs automatically.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/15">
                <Zap className="h-5 w-5 text-accent-green" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Real-time Processing</h3>
              <p className="mt-2 text-sm text-muted">
                Orders are optimized instantly with live dashboards showing savings trends,
                efficiency scores, and box utilization.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Smart Packaging</h3>
              <p className="mt-2 text-sm text-muted">
                Intelligent box selection based on dimensions, weight, fragility, and
                shipping zone — every time.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted">
          PackAI — AI Packaging Automation Platform
        </div>
      </footer>
    </div>
  );
}
