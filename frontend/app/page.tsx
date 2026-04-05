import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between glass-strong border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-ink font-black text-sm">P</span>
          </div>
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
              <span className="rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-ink hover:bg-[#d8ff20] hover:shadow-[0_4px_20px_rgba(200,255,0,.3)] transition-all cursor-pointer">
                Get started →
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-[900px] h-[900px] rounded-full bg-[radial-gradient(#c8ff00,transparent)] blur-[150px] opacity-[.08] top-[-350px] left-1/2 -translate-x-1/2 animate-pulse-custom" />
            <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(#00e4c8,transparent)] blur-[130px] opacity-[.07] bottom-[-200px] left-[-150px]" />
            <div className="absolute w-[500px] h-[500px] rounded-full bg-[radial-gradient(#a78bfa,transparent)] blur-[130px] opacity-[.06] bottom-[-100px] right-[-150px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(200,255,0,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(200,255,0,.015)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_50%_0%,black_30%,transparent_70%)]" />
            <div className="absolute top-1/4 left-1/4 w-[1px] h-[120px] bg-gradient-to-b from-transparent via-accent/20 to-transparent animate-float" />
            <div className="absolute top-1/3 right-1/3 w-[1px] h-[80px] bg-gradient-to-b from-transparent via-teal/20 to-transparent animate-float" style={{ animationDelay: "2s" }} />
            <div className="absolute bottom-1/4 left-1/3 w-[1px] h-[100px] bg-gradient-to-b from-transparent via-purple/20 to-transparent animate-float" style={{ animationDelay: "4s" }} />
          </div>

          <div className="inline-flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-full px-4 py-1.5 text-[11px] font-semibold text-accent uppercase tracking-widest mb-8 animate-fadeUp shadow-[0_0_30px_rgba(200,255,0,.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-custom" />
            AI Packaging · Indian Ecommerce · 2025
          </div>

          <h1 className="font-display text-[clamp(48px,8vw,110px)] font-black leading-[.95] tracking-[-4px] mb-6 max-w-[950px] animate-fadeUp" style={{ animationDelay: ".1s" }}>
            Reduce Packaging &amp;<br />Shipping Costs by <em className="gradient-text not-italic">15–30%</em>
          </h1>

          <p className="text-[17px] text-muted leading-[1.7] max-w-[520px] mx-auto mb-10 animate-fadeUp" style={{ animationDelay: ".2s" }}>
            For high-volume ecommerce warehouses and D2C brands. Orders in → AI decides packaging → Pack faster &amp; cheaper.
          </p>

          <div className="flex items-center gap-3 mb-20 animate-fadeUp" style={{ animationDelay: ".3s" }}>
            <Link href="/register">
              <span className="rounded-full bg-accent px-6 py-3 text-[14px] font-semibold text-ink hover:bg-[#d8ff20] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(200,255,0,.3)] transition-all cursor-pointer">
                Start free today →
              </span>
            </Link>
            <Link href="/login">
              <span className="rounded-full border border-border2 px-6 py-3 text-[14px] font-semibold text-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all cursor-pointer">
                View live demo
              </span>
            </Link>
          </div>

          <div className="max-w-[920px] w-full mx-auto mb-20 animate-fadeUp animate-float" style={{ animationDelay: ".4s" }}>
            <div className="bg-surface border border-border2 rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,.7),inset_0_1px_0_rgba(255,255,255,.06)]">
              <div className="bg-ink2 px-4 py-3 flex items-center gap-2 border-b border-border">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                <div className="flex-1 bg-ink3 rounded-lg px-3 py-1.5 text-[10px] text-muted-dark text-center mx-3">
                  app.packai.in — AI Decision Engine · Live
                </div>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 rounded-xl p-4">
                  <div className="font-display text-xl font-black text-accent">Box_M</div>
                  <div className="text-[9px] text-accent/60 uppercase tracking-wide mt-1">Recommended</div>
                </div>
                <div className="bg-gradient-to-br from-teal/10 to-teal/5 border border-teal/20 rounded-xl p-4">
                  <div className="font-display text-xl font-black text-teal">₹94</div>
                  <div className="text-[9px] text-teal/60 uppercase tracking-wide mt-1">Total cost</div>
                </div>
                <div className="bg-gradient-to-br from-purple/10 to-purple/5 border border-purple/20 rounded-xl p-4">
                  <div className="font-display text-xl font-black text-purple">91%</div>
                  <div className="text-[9px] text-purple/60 uppercase tracking-wide mt-1">Efficiency</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-14 justify-center pt-12 border-t border-border animate-fadeUp" style={{ animationDelay: ".5s" }}>
            {[
              { value: "₹2.4Cr", label: "Saved" },
              { value: "87%", label: "Avg efficiency" },
              { value: "200ms", label: "Per decision" },
              { value: "6+", label: "Platforms" },
              { value: "35%", label: "Cost reduction" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-[36px] font-black gradient-text tracking-[-2px]">{s.value}</div>
                <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 py-24" id="features">
          <div className="text-[10px] uppercase tracking-[4px] text-accent font-bold mb-4">Core capabilities</div>
          <h2 className="font-display text-[clamp(32px,4vw,56px)] font-black tracking-[-2px] leading-[1.05] mb-5">
            Everything your Indian<br />warehouse <em className="gradient-text not-italic">needs</em>
          </h2>
          <p className="text-[15px] text-muted max-w-[500px] leading-[1.7] mb-14">
            Built from the ground up for Indian ecommerce reality — volumetric pricing, courier zones, fragility, live inventory.
          </p>

          <div className="grid gap-0 border border-border rounded-3xl overflow-hidden">
            {[
              { ico: "🧠", t: "Hybrid AI Engine", d: "Rule-based FFD bin packing + 5 ML models working together. Rules handle 95% of cases instantly.", bg: "rgba(200,255,0,.08)", border: "border-accent/10" },
              { ico: "📦", t: "Multi-Platform CSV Import", d: "Auto-detects Shiprocket, Delhivery, Meesho, Amazon, Flipkart CSV exports. No column renaming.", bg: "rgba(0,228,200,.08)", border: "border-teal/10" },
              { ico: "💸", t: "Volumetric Pricing Engine", d: "Auto-calculates dim weight (L×W×H÷5000) vs actual weight. Picks chargeable weight precisely.", bg: "rgba(167,139,250,.08)", border: "border-purple/10" },
              { ico: "📊", t: "Real-time Analytics", d: "Live dashboard shows cost saved, efficiency score, box distribution — refreshed per order.", bg: "rgba(255,112,67,.08)", border: "border-orange/10" },
              { ico: "🏭", t: "Live Box Inventory", d: "Tracks box stock in real-time. Engine only selects in-stock boxes. Low-stock alerts built in.", bg: "rgba(200,255,0,.08)", border: "border-accent/10" },
              { ico: "🔶", t: "Fragility Intelligence", d: "Auto-detects fragile items. Selects padded fragile-safe boxes only. Prevents damage claims.", bg: "rgba(0,228,200,.08)", border: "border-teal/10" },
            ].map((f, i) => (
              <div key={i} className="bg-ink border-t border-border p-9 transition-all duration-300 hover:bg-surface first:border-t-0 group">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-[18px] mb-5 transition-all duration-300 group-hover:scale-110 ${f.border}`} style={{ background: f.bg }}>
                  {f.ico}
                </div>
                <div className="text-[15px] font-semibold mb-2 group-hover:text-accent transition-colors">{f.t}</div>
                <p className="text-[13px] text-muted leading-[1.7]">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 py-24" id="how-it-works">
          <div className="text-[10px] uppercase tracking-[4px] text-accent font-bold mb-4">How it works</div>
          <h2 className="font-display text-[clamp(32px,4vw,56px)] font-black tracking-[-2px] leading-[1.05] mb-5">
            From CSV to optimized<br />packaging in <em className="gradient-text not-italic">4 steps</em>
          </h2>
          <p className="text-[15px] text-muted max-w-[500px] leading-[1.7] mb-14">
            No integration needed. Export from your platform, upload, get results. That simple.
          </p>

          <div className="grid grid-cols-4 gap-6 relative">
            <div className="absolute top-6 left-[calc(12.5%+16px)] right-[calc(12.5%+16px)] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            {[
              { n: "1", t: "Export your orders", d: "Download your order CSV from Shiprocket, Delhivery, Meesho, Amazon, or Flipkart." },
              { n: "2", t: "Upload & configure", d: "Drop your CSV in PackAI. Select your courier zone and optimization priority." },
              { n: "3", t: "AI engine runs", d: "FFD bin packing + volumetric weight + fragility check — all done in under 200ms." },
              { n: "4", t: "Get results & track", d: "Per-order box recommendations, cost breakdown, savings vs naive approach." },
            ].map((s) => (
              <div key={s.n} className="text-center group">
                <div className="w-12 h-12 rounded-full border-2 border-accent/30 flex items-center justify-center font-display text-lg font-black text-accent mx-auto mb-4 bg-accent/8 group-hover:bg-accent group-hover:text-ink group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(200,255,0,.1)]">
                  {s.n}
                </div>
                <div className="text-[15px] font-semibold mb-2 group-hover:text-accent transition-colors">{s.t}</div>
                <p className="text-[12px] text-muted leading-[1.7]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1280px] mx-auto px-6 py-24" id="results">
          <div className="text-[10px] uppercase tracking-[4px] text-accent font-bold mb-4 text-center">What we are doing</div>
          <div className="bg-gradient-to-br from-surface to-surface2 border border-border2 rounded-3xl p-12 grid grid-cols-2 gap-12 items-center shadow-[0_20px_60px_rgba(0,0,0,.4)]">
            <div>
              <h2 className="font-display text-[clamp(26px,3vw,44px)] font-black tracking-[-2px] leading-[1.05] mb-5">
                Fixing the ₹8,000 crore packaging waste problem
              </h2>
              <p className="text-[15px] text-muted leading-[1.8] mb-6">
                Indian ecommerce ships over 100 crore packages a year. Most warehouses pick boxes by guesswork — oversized boxes, unused air, inflated volumetric charges.
              </p>
              <Link href="/register">
                <span className="rounded-full bg-accent px-7 py-3.5 text-[14px] font-semibold text-ink hover:bg-[#d8ff20] hover:shadow-[0_8px_32px_rgba(200,255,0,.3)] transition-all cursor-pointer inline-block">
                  Start optimizing →
                </span>
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { label: "Avg cost reduction", value: "35%", color: "text-accent" },
                { label: "Space efficiency", value: "87%", color: "text-teal" },
                { label: "Decision speed", value: "<200ms", color: "text-purple" },
              ].map((s) => (
                <div key={s.label} className="bg-ink2 border border-border rounded-xl p-5 hover:border-border2 transition-all">
                  <div className={`font-display text-3xl font-black tracking-[-1px] ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-accent via-[#d8ff20] to-teal py-20 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_20px,rgba(0,0,0,.02)_20px,rgba(0,0,0,.02)_40px)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,.1),transparent_70%)]" />
          <h2 className="font-display text-[clamp(30px,4vw,52px)] font-black text-ink tracking-[-2px] mb-4 relative">
            Ready to cut your shipping costs?
          </h2>
          <p className="text-[16px] text-ink/60 mb-8 relative">Join hundreds of warehouses already saving with PackAI.</p>
          <Link href="/register" className="relative">
            <span className="rounded-full bg-ink text-accent font-bold px-10 py-4 text-[15px] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,.4)] transition-all cursor-pointer inline-block">
              Get started free →
            </span>
          </Link>
        </section>

        <footer className="bg-ink2 border-t border-border py-8 px-6 flex items-center justify-between text-[12px] text-muted-dark">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <span className="text-ink font-black text-[10px]">P</span>
            </div>
            <span>PackAI — AI Packaging Automation Platform</span>
          </div>
          <span>© 2025 All rights reserved</span>
        </footer>
      </main>
    </div>
  );
}
