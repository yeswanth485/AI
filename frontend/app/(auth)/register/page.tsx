"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { register } from "@/services/auth.service";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error && "response" in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : "Registration failed";
      setError(msg || "Registration failed");
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
            Start saving on<br /><span className="text-accent">packaging today</span>
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Create your account and start optimizing packaging costs in minutes.
          </p>
        </div>
        <div className="flex gap-8">
          <div>
            <div className="font-display text-2xl font-black text-accent">200ms</div>
            <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Per decision</div>
          </div>
          <div>
            <div className="font-display text-2xl font-black text-accent">35%</div>
            <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Cost reduction</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="w-full max-w-[360px]">
          <h2 className="font-display text-[28px] font-black tracking-tight mb-1">Create account</h2>
          <p className="text-[13px] text-muted mb-6">Get started with PackAI</p>

          {error && (
            <div className="bg-accent-red/8 border border-accent-red/20 text-accent-red px-3.5 py-2.5 rounded-xl text-[13px] mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              id="register-name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
            <Input
              id="register-email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              id="register-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Create Account →
            </Button>
          </form>

          <p className="mt-4 text-center text-[13px] text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
