"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { login } from "@/services/auth.service";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      setAuth({ ...data.user, token: data.token });
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error && "response" in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : "Login failed. Please check your credentials.";
      setError(msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      <div className="bg-surface p-12 flex flex-col justify-between border-r border-border relative overflow-hidden">
        <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(rgba(200,255,0,.07),transparent)] bottom-[-150px] left-[-100px] pointer-events-none" />
        <div>
          <span className="font-display text-[20px] font-black tracking-tight">
            Pack<span className="text-accent not-italic">AI</span>
          </span>
        </div>
        <div>
          <h2 className="font-display text-2xl font-black text-foreground mb-2 tracking-tight">
            Smart Packaging<br /><span className="text-accent">Optimization</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Reduce shipping costs with AI-driven box selection and packaging optimization.
          </p>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="font-display text-2xl font-black text-accent">₹2.4Cr</div>
            <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Saved</div>
          </div>
          <div>
            <div className="font-display text-2xl font-black text-accent">87%</div>
            <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Efficiency</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="w-full max-w-[360px]">
          <h2 className="font-display text-[28px] font-black tracking-tight mb-1">Welcome back</h2>
          <p className="text-[13px] text-muted mb-6">Sign in to your PackAI account</p>

          {error && (
            <div className="bg-accent-red/8 border border-accent-red/20 text-accent-red px-3.5 py-2.5 rounded-xl text-[13px] mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              id="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign In →
            </Button>
          </form>

          <p className="mt-4 text-center text-[13px] text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-accent font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
