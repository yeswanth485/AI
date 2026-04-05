import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between bg-[rgba(12,12,16,.92)] backdrop-blur-[20px] border-b border-border">
        <div className="flex items-center gap-2">
          <span className="font-display text-[20px] font-black tracking-tight">
            Pack<span className="text-accent not-italic">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-7">
          <Link href="#features" className="text-[13px] text-muted hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-[13px] text-muted hover:text-foreground transition-colors">How it works</Link>
          <Link href="#results" className="text-[13px] text-muted hover:text-foreground transition-colors">Results</Link>
          <div className="flex items-center gap-2 ml-4">
            <Link href="/login">
              <span className="rounded-full border border-border2 px-4 py-2 text-[12px] font-semibold text-foreground hover:border-accent hover:text-accent transition-all cursor-pointer">
                Sign in
              </span>
            </Link>
            <Link href="/register">
              <span className="rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-ink hover:bg-[#d8ff20] transition-all cursor-pointer">
                Get started →
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-[800px] h-[800px] rounded-full bg-[radial-gradient(#c8ff00,transparent)] blur-[120px] opacity-[.1] top-[-300px] left-1/2 -translate-x-1/2" />
            <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(#00d4b8,transparent)] blur-[120px] opacity-[.1] bottom-[-150px] left-[-100px]" />
            <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(#9b7afe,transparent)] blur-[120px] opacity-[.1] bottom-[-150px] right-[-100px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(200,255,0,.012)_1px,transparent_1px),linear-gradient(90deg,rgba(200,255,0,.012)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_50%_0%,black_30%,transparent_70%)]" />
          </div>

          <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-full px-3.5 py-1 text-[11px] font-semibold text-accent uppercase tracking-widest mb-6 animate-fadeUp">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-custom" />
            AI Packaging · Indian Ecommerce · 2025
          </div>

          <h1 className="font-display text-[clamp(48px,8vw,100px)] font-black leading-[.95] tracking-[-4px] mb-5 max-w-[900px] animate-fadeUp" style={{ animationDelay: ".1s" }}>
            Reduce Packaging &amp;<br />Shipping Costs by <em className="text-accent not-italic">15–30%</em>
          </h1>

          <p className="text-[16px] text-muted leading-[1.7] max-w-[480px] mx-auto mb-9 animate-fadeUp" style={{ animationDelay: ".2s" }}>
            For high-volume ecommerce warehouses and D2C brands. Orders in → AI decides packaging → Pack faster &amp; cheaper.
          </p>

          <div className="flex items-center gap-3 mb-16 animate-fadeUp" style={{ animationDelay: ".3s" }}>
            <Link href="/register">
              <span className="rounded-full bg-accent px-5 py-2.5 text-[13px] font-semibold text-ink hover:bg-[#d8ff20] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(200,255,0,.25)] transition-all cursor-pointer">
                Start free today →
              </span>
            </Link>
            <Link href="/login">
              <span className="rounded-full border border-border2 px-5 py-2.5 text-[13px] font-semibold text-foreground hover:border-accent hover:text-accent transition-all cursor-pointer">
                View live demo
              </span>
            </Link>
          </div>

          <div className="max-w-[860px] w-full mx-auto mb-16 animate-fadeUp animate-float" style={{ animationDelay: ".4s" }}>
            <div className="bg-surface border border-border2 rounded-3xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,.06)]">
              <div className="bg-ink2 px-4 py-2.5 flex items-center gap-2 border-b border-border">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <div className="flex-1 bg-ink3 rounded px-3 py-1 text-[10px] text-muted-dark text-center mx-3">
                  app.packai.in — AI Decision Engine · Live
                </div>
              </div>
              <div className="p-4 grid grid-cols-3 gap-2.5">
                <div className="bg-accent border border-accent rounded-xl p-3">
                  <div className="font-display text-lg font-black text-ink">Box_M</div>
                  <div className="text-[9px] text-ink/50 uppercase tracking-wide">Recommended</div>
                </div>
                <div className="bg-ink2 border border-border rounded-xl p-3">
                  <div className="font-display text-lg font-black text-foreground">₹94</div>
                  <div className="text-[9px] text-muted-dark uppercase tracking-wide">Total cost</div>
                </div>
                <div className="bg-ink2 border border-border rounded-xl p-3">
                  <div className="font-display text-lg font-black text-accent-green">91%</div>
                  <div className="text-[9px] text-muted-dark uppercase tracking-wide">Efficiency</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-12 justify-center pt-10 border-t border-border animate-fadeUp" style={{ animationDelay: ".4s" }}>
            <div>
              <div className="font-display text-[32px] font-black text-accent tracking-[-2px]">₹2.4Cr</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Saved</div>
            </div>
            <div>
              <div className="font-display text-[32px] font-black text-accent tracking-[-2px]">87%</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Avg efficiency</div>
            </div>
            <div>
              <div className="font-display text-[32px] font-black text-accent tracking-[-2px]">200ms</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Per decision</div>
            </div>
            <div>
              <div className="font-display text-[32px] font-black text-accent tracking-[-2px]">6+</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Platforms</div>
            </div>
            <div>
              <div className="font-display text-[32px] font-black text-accent tracking-[-2px]">35%</div>
              <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Cost reduction</div>
            </div>
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 py-20" id="features">
          <div className="text-[10px] uppercase tracking-[3px] text-accent font-bold mb-3">Core capabilities</div>
          <h2 className="font-display text-[clamp(30px,4vw,52px)] font-black tracking-[-2px] leading-[1.05] mb-4">
            Everything your Indian<br />warehouse needs
          </h2>
          <p className="text-[14px] text-muted max-w-[460px] leading-[1.7] mb-11">
            Built from the ground up for Indian ecommerce reality — volumetric pricing, courier zones, fragility, live inventory.
          </p>

          <div className="grid gap-0 border border-border rounded-3xl overflow-hidden">
            {[
              { ico: "🧠", t: "Hybrid AI Engine", d: "Rule-based FFD bin packing + 5 ML models working together. Rules handle 95% of cases instantly.", bg: "rgba(200,255,0,.06)" },
              { ico: "📦", t: "Multi-Platform CSV Import", d: "Auto-detects Shiprocket, Delhivery, Meesho, Amazon, Flipkart CSV exports. No column renaming.", bg: "rgba(0,212,184,.06)" },
              { ico: "💸", t: "Volumetric Pricing Engine", d: "Auto-calculates dim weight (L×W×H÷5000) vs actual weight. Picks chargeable weight precisely.", bg: "rgba(155,127,232,.06)" },
              { ico: "📊", t: "Real-time Analytics", d: "Live dashboard shows cost saved, efficiency score, box distribution — refreshed per order.", bg: "rgba(255,112,67,.06)" },
              { ico: "🏭", t: "Live Box Inventory", d: "Tracks box stock in real-time. Engine only selects in-stock boxes. Low-stock alerts built in.", bg: "rgba(200,255,0,.06)" },
              { ico: "🔶", t: "Fragility Intelligence", d: "Auto-detects fragile items. Selects padded fragile-safe boxes only. Prevents damage claims.", bg: "rgba(0,212,184,.06)" },
            ].map((f, i) => (
              <div key={i} className="bg-ink border-t border-border p-8 transition-colors hover:bg-surface first:border-t-0">
                <div className="w-9 h-9 rounded-lg border border-border2 flex items-center justify-center text-[17px] mb-4" style={{ background: f.bg }}>
                  {f.ico}
                </div>
                <div className="text-[14px] font-semibold mb-1.5">{f.t}</div>
                <p className="text-[13px] text-muted leading-[1.65]">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 py-20" id="how-it-works">
          <div className="text-[10px] uppercase tracking-[3px] text-accent font-bold mb-3">How it works</div>
          <h2 className="font-display text-[clamp(30px,4vw,52px)] font-black tracking-[-2px] leading-[1.05] mb-4">
            From CSV to optimized<br />packaging in 4 steps
          </h2>
          <p className="text-[14px] text-muted max-w-[460px] leading-[1.7] mb-11">
            No integration needed. Export from your platform, upload, get results. That simple.
          </p>

          <div className="grid grid-cols-4 gap-5 relative">
            <div className="absolute top-5 left-[calc(12.5%+14px)] right-[calc(12.5%+14px)] h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-20" />
            {[
              { n: "1", t: "Export your orders", d: "Download your order CSV from Shiprocket, Delhivery, Meesho, Amazon, or Flipkart." },
              { n: "2", t: "Upload & configure", d: "Drop your CSV in PackAI. Select your courier zone and optimization priority." },
              { n: "3", t: "AI engine runs", d: "FFD bin packing + volumetric weight + fragility check — all done in under 200ms." },
              { n: "4", t: "Get results & track", d: "Per-order box recommendations, cost breakdown, savings vs naive approach." },
            ].map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-11 h-11 rounded-full border border-accent flex items-center justify-center font-display text-lg font-black text-accent mx-auto mb-3.5 bg-accent/6">
                  {s.n}
                </div>
                <div className="text-[14px] font-semibold mb-1.5">{s.t}</div>
                <p className="text-[12px] text-muted leading-[1.65]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 py-20" id="results">
          <div className="text-[10px] uppercase tracking-[3px] text-accent font-bold mb-3 text-center">What we are doing</div>
          <div className="bg-surface border border-border rounded-2xl p-10 grid grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="font-display text-[clamp(24px,3vw,40px)] font-black tracking-[-2px] leading-[1.05] mb-4">
                Fixing the ₹8,000 crore packaging waste problem
              </h2>
              <p className="text-[14px] text-muted leading-[1.8] mb-5">
                Indian ecommerce ships over 100 crore packages a year. Most warehouses pick boxes by guesswork — oversized boxes, unused air, inflated volumetric charges.
              </p>
              <Link href="/register">
                <span className="rounded-full bg-accent px-6 py-3 text-[13px] font-semibold text-ink hover:bg-[#d8ff20] transition-all cursor-pointer inline-block">
                  Start optimizing →
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { label: "Avg cost reduction", value: "35%", color: "text-accent" },
                { label: "Space efficiency", value: "87%", color: "text-accent-green" },
                { label: "Decision speed", value: "<200ms", color: "text-accent-purple" },
              ].map((s) => (
                <div key={s.label} className="bg-ink2 border border-border rounded-xl p-4">
                  <div className={`font-display text-2xl font-black tracking-[-1px] ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-accent py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,.02)_20px,rgba(0,0,0,.02)_40px)]" />
          <h2 className="font-display text-[clamp(28px,4vw,48px)] font-black text-ink tracking-[-2px] mb-3 relative">
            Ready to cut your shipping costs?
          </h2>
          <p className="text-[15px] text-ink/55 mb-7 relative">Join hundreds of warehouses already saving with PackAI.</p>
          <Link href="/register" className="relative">
            <span className="rounded-full bg-ink text-accent font-bold px-8 py-3 text-[14px] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.3)] transition-all cursor-pointer inline-block">
              Get started free →
            </span>
          </Link>
        </section>

        <footer className="bg-ink2 border-t border-border py-7 px-6 flex items-center justify-between text-[12px] text-muted-dark">
          <span>PackAI — AI Packaging Automation Platform</span>
          <span>© 2025 All rights reserved</span>
        </footer>
      </main>
    </div>
  );
}
