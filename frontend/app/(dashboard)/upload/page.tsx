"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { uploadOrders } from "@/services/upload.service";
import { UploadResult } from "@/types";
import { Upload, AlertCircle, CheckCircle, XCircle, FileText, RefreshCw, Zap } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAppContext } from "@/context/AppContext";

const platforms = [
  { name: "Shiprocket", ico: "🚀", fields: "order_id, product_name, length_cm, breadth_cm, height_cm, weight_kg, quantity" },
  { name: "Delhivery", ico: "📦", fields: "waybill, product_desc, length, width, height, act_weight, qty" },
  { name: "Meesho", ico: "🛒", fields: "order_id, item_title, l_cm, b_cm, h_cm, dead_wt_kg, units" },
  { name: "Amazon", ico: "📱", fields: "order_id, asin, l_cm, b_cm, h_cm, unit_wt, order_quantity" },
  { name: "PackAI Standard", ico: "✅", fields: "order_id, product_name, sku, length, width, height, weight, quantity, fragility" },
];

const requiredFields = [
  { name: "order_id", req: true },
  { name: "product_name", req: true },
  { name: "length (cm)", req: true },
  { name: "width (cm)", req: true },
  { name: "height (cm)", req: true },
  { name: "weight (kg)", req: true },
  { name: "quantity", req: false },
  { name: "fragility", req: false },
  { name: "pincode", req: false },
];

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { addToast } = useAppContext();

  const [file, setFile] = useState<File | null>(null);
  const [shippingZone, setShippingZone] = useState("Zone A");
  const [priority, setPriority] = useState("cost");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [step, setStep] = useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") {
      setError("Only CSV and Excel (.xlsx) files are allowed");
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError(null);
    setStep(2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    const ext = droppedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx") {
      setError("Only CSV and Excel (.xlsx) files are allowed");
      setFile(null);
      return;
    }
    setFile(droppedFile);
    setError(null);
    setStep(2);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setUploading(true);
    setResult(null);
    setError(null);
    setStep(3);
    try {
      const uploadResult = await uploadOrders(file, user.id, shippingZone);
      setResult(uploadResult);
      setStep(4);
      addToast(`Upload complete — ${uploadResult.valid_rows} orders created`, "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      addToast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setStep(1);
  };

  const steps = [
    { n: 1, label: "Upload CSV / Excel" },
    { n: 2, label: "Configure" },
    { n: 3, label: "Optimize" },
    { n: 4, label: "Results" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-black text-foreground tracking-tight">Upload Orders</h2>
        <p className="text-[12px] text-muted-dark mt-0.5">Bulk import orders from any Indian ecommerce platform</p>
      </div>

      {/* Step Flow */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all whitespace-nowrap ${
                step > s.n
                  ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                  : step === s.n
                  ? "bg-accent/10 text-accent border border-accent/25"
                  : "border border-border text-muted-dark"
              }`}
            >
              {step > s.n ? <CheckCircle className="h-3.5 w-3.5" /> : s.n}
              {s.label}
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-2 min-w-[12px]" />}
          </div>
        ))}
      </div>

      {/* CSV Format Guide */}
      <Card>
        <div className="mb-3">
          <div className="text-[13px] font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            Supported CSV formats — Indian ecommerce platforms
          </div>
          <div className="text-[10px] text-muted-dark mt-0.5">Auto-detects column names from your platform export</div>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1">
          {platforms.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setActiveTab(i)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all whitespace-nowrap ${
                activeTab === i
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "bg-surface2 text-muted border border-border hover:border-border2"
              }`}
            >
              {p.ico} {p.name}
            </button>
          ))}
        </div>

        <div className="bg-ink2 border border-border rounded-xl p-3 mb-3">
          <div className="text-[11px] font-semibold text-foreground mb-1.5">{platforms[activeTab].ico} {platforms[activeTab].name}</div>
          <div className="text-[11px] text-muted leading-relaxed">{platforms[activeTab].fields}</div>
        </div>

        {/* Required Fields */}
        <div className="bg-accent/5 border border-accent/10 rounded-xl p-3">
          <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Required fields (minimum to optimize)</div>
          <div className="flex flex-wrap gap-1.5">
            {requiredFields.map((f) => (
              <span
                key={f.name}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  f.req
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "bg-surface2 text-muted border border-border"
                }`}
              >
                {f.name}
                {f.req && ""}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Upload Area */}
      <Card>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative ${
            file
              ? "border-accent bg-accent/5"
              : dragOver
              ? "border-accent bg-accent/3"
              : "border-border2 hover:border-border"
          }`}
        >
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload className="w-10 h-10 mx-auto text-muted mb-3" />
          {file ? (
            <div>
              <p className="text-foreground font-semibold text-sm">{file.name}</p>
              <p className="text-muted text-xs mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-foreground font-semibold text-sm">Drop your order CSV here</p>
              <p className="text-muted text-xs mt-1.5">Supports Shiprocket · Delhivery · Meesho · Amazon · Flipkart · Unicommerce exports</p>
              <p className="text-muted-dark text-[10px] mt-1">UTF-8 encoding · Max 10MB · Auto-detects column format</p>
            </div>
          )}
        </div>

        {/* Settings */}
        {file && (
          <div className="mt-4 space-y-3">
            <div className="text-[11px] font-bold text-muted-dark uppercase tracking-wider">⚙️ Optimization settings</div>

            <div>
              <label className="text-[11px] font-bold text-muted-dark uppercase tracking-wider mb-1.5 block">Courier / Destination zone</label>
              <select
                value={shippingZone}
                onChange={(e) => setShippingZone(e.target.value)}
                className="w-full rounded-xl border border-border2 bg-surface2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,255,0,.08)] transition-all"
              >
                <option value="Zone A">Zone A — Metro local (₹45/kg) — Mumbai, Delhi, Bangalore</option>
                <option value="Zone B">Zone B — Regional (₹55/kg) — Same state</option>
                <option value="Zone C">Zone C — National (₹65/kg) — Inter-state</option>
                <option value="Zone D">Zone D — Remote (₹80/kg) — Northeast, J&K, Andaman</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-dark uppercase tracking-wider mb-1.5 block">Optimization priority</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPriority("cost")}
                  className={`rounded-xl border px-3.5 py-2.5 text-[12px] font-semibold transition-all ${
                    priority === "cost"
                      ? "border-accent/30 bg-accent/8 text-accent"
                      : "border-border bg-surface2 text-muted hover:border-border2"
                  }`}
                >
                  💰 Minimize total cost
                </button>
                <button
                  onClick={() => setPriority("speed")}
                  className={`rounded-xl border px-3.5 py-2.5 text-[12px] font-semibold transition-all ${
                    priority === "speed"
                      ? "border-accent/30 bg-accent/8 text-accent"
                      : "border-border bg-surface2 text-muted hover:border-border2"
                  }`}
                >
                  ⚡ Minimize box size
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleUpload} loading={uploading} className="flex-1">
                🚀 Run AI packaging engine
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                ← Upload new file
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-accent-red bg-accent-red/8 border border-accent-red/20 rounded-xl px-4 py-3 text-[13px]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
              <div className="bg-accent h-full rounded-full animate-pulse-custom" style={{ width: "60%" }} />
            </div>
            <p className="text-[11px] text-muted mt-1.5">Processing orders...</p>
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-accent-green" />
              Packaging plan — per order
            </div>
            <button
              onClick={resetUpload}
              className="flex items-center gap-1.5 text-[11px] text-accent hover:underline font-semibold"
            >
              <RefreshCw className="h-3 w-3" />
              Upload more
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-ink2 border border-border rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-black text-foreground">{result.total_rows}</p>
              <p className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Total Rows</p>
            </div>
            <div className="bg-accent-green/8 border border-accent-green/20 rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-black text-accent-green">{result.valid_rows}</p>
              <p className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Valid Rows</p>
            </div>
            <div className="bg-accent-red/8 border border-accent-red/20 rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-black text-accent-red">{result.failed_rows}</p>
              <p className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Failed Rows</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-[11px] font-bold text-accent-red uppercase tracking-wider mb-2">Row Errors</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.errors.map((err, i) => (
                  <div key={i} className="bg-accent-red/6 border border-accent-red/15 rounded-xl p-3 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-accent-red text-[12px] font-semibold">Row {err.row}:</span>
                      <span className="text-muted text-[12px] ml-1">{err.error}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.order_ids.length > 0 && (
            <div className="flex gap-2">
              <Button onClick={() => router.push("/orders")} className="flex-1">
                <CheckCircle className="w-4 h-4" />
                View Orders ({result.order_ids.length} created)
              </Button>
              <Button onClick={() => router.push("/optimization")} variant="outline">
                <Zap className="w-4 h-4" />
                Optimize
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
