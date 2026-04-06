"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { uploadOrders } from "@/services/upload.service";
import { getOrderOptimizationStatus } from "@/services/orders.service";
import { UploadResult, OptimizationResult } from "@/types";
import { Upload, AlertCircle, CheckCircle, XCircle, FileText, RefreshCw, Zap, Loader2, ArrowRight, Package, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAppContext } from "@/context/AppContext";
import dynamic from "next/dynamic";
import api from "@/services/api";

const ThreeDPackViewer = dynamic(
  () => import("@/components/optimization/ThreeDPackViewer"),
  { ssr: false, loading: () => <div className="h-[300px] bg-[#0a0a14] rounded-xl flex items-center justify-center text-gray-500 text-sm border border-border">Loading 3D viewer...</div> }
);

const platforms = [
  { name: "PackAI Standard", ico: "✅", fields: "product_name, sku, length, width, height, weight, quantity, fragility, category, customer_name, phone, city, state, pincode, channel, payment_type, priority" },
  { name: "Shiprocket", ico: "🚀", fields: "order_id, customer_name, phone, city, state, pincode, product_name, sku, length, width, height, weight, qty, fragile, category, payment_method" },
  { name: "Shopify", ico: "🛍️", fields: "Name, Line: Title, Line: SKU, Line: Variant Weight, Line: Quantity, Shipping: City, Shipping: Province, Shipping: Zip, Shipping: Phone, Payment: Status, Source" },
  { name: "Amazon FBA", ico: "📦", fields: "order-id, item-name, sku, length, width, height, weight, quantity, ship-city, ship-state, ship-postal-code, ship-phone-number, payment-method" },
  { name: "Flipkart", ico: "🔵", fields: "Order ID, Item Name, SKU, Length, Breadth, Height, Weight, Quantity, Customer Name, City, State, Pincode, Phone, Payment Type" },
  { name: "Meesho", ico: "🟡", fields: "order_id, item_title, sku, l_cm, b_cm, h_cm, dead_wt_kg, units, customer_name, city, state, pincode, phone, prepaid_or_cod" },
  { name: "Delhivery", ico: "📮", fields: "waybill, product_desc, length, width, height, act_weight, qty, consignee_name, city, state, pin, phone, cod_flag" },
  { name: "Unicommerce", ico: "🔗", fields: "order_no, item_name, sku, length_cm, width_cm, height_cm, weight_kg, quantity, buyer_name, city, state, pincode, mobile, channel" },
];

const requiredFields = [
  { name: "product_name", aliases: "item_name, title, description, asin", req: true },
  { name: "length", aliases: "l, length_cm, item_length", req: true },
  { name: "width / breadth", aliases: "w, width_cm, breadth, b", req: true },
  { name: "height", aliases: "h, height_cm, depth, item_height", req: true },
  { name: "weight", aliases: "weight_kg, item_weight, act_weight, dead_wt", req: true },
  { name: "quantity", aliases: "qty, units, order_quantity", req: true },
  { name: "fragility", aliases: "fragile, is_fragile, handle_with_care", req: false },
  { name: "sku", aliases: "seller_sku, item_sku, variant_sku", req: false },
  { name: "category", aliases: "product_type, item_type, department", req: false },
  { name: "customer_name", aliases: "buyer_name, name, consignee", req: false },
  { name: "phone", aliases: "mobile, contact_number, phone_number", req: false },
  { name: "city", aliases: "customer_city, destination_city", req: false },
  { name: "state", aliases: "customer_state, province, region", req: false },
  { name: "pincode", aliases: "zip, postal_code, pin_code", req: false },
  { name: "channel", aliases: "source, marketplace, platform", req: false },
  { name: "payment_type", aliases: "payment_method, prepaid_or_cod, is_cod", req: false },
  { name: "priority", aliases: "express, service_level, delivery_speed", req: false },
];

interface BoxInfo {
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
}

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
  const [optimizingOrderIds, setOptimizingOrderIds] = useState<number[]>([]);
  const [optimizationResults, setOptimizationResults] = useState<Map<number, OptimizationResult>>(new Map());
  const [allOptimized, setAllOptimized] = useState(false);
  const [expandedUploadOrders, setExpandedUploadOrders] = useState<Set<number>>(new Set());
  const [show3DFor, setShow3DFor] = useState<number | null>(null);
  const [boxes, setBoxes] = useState<BoxInfo[]>([]);

  useEffect(() => {
    api.get("/inventory")
      .then(res => setBoxes(res.data))
      .catch(() => {});

    const savedState = sessionStorage.getItem("upload_state");
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.result) {
          setResult(parsed.result as UploadResult);
          setStep(parsed.step || 4);
          setOptimizingOrderIds(parsed.optimizingOrderIds || []);
          setAllOptimized(parsed.allOptimized || false);
          setExpandedUploadOrders(new Set(parsed.expandedUploadOrders || []));
          setShow3DFor(parsed.show3DFor);
          if (parsed.optimizationResults) {
            const optMap = new Map<number, OptimizationResult>(
              Object.entries(parsed.optimizationResults).map(([k, v]) => [Number(k), v as OptimizationResult])
            );
            setOptimizationResults(optMap);
          }
        }
      } catch {
        sessionStorage.removeItem("upload_state");
      }
    }
  }, []);

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
    setOptimizingOrderIds([]);
    setOptimizationResults(new Map());
    setAllOptimized(false);
    setExpandedUploadOrders(new Set());
    setShow3DFor(null);
  };

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultsRef = useRef<Map<number, OptimizationResult>>(new Map());
  const orderIdsRef = useRef<number[]>([]);
  const allOptimizedRef = useRef(false);

  const pollOptimizationStatus = useCallback(async () => {
    const pending = orderIdsRef.current.filter(
      (id) => !resultsRef.current.has(id)
    );
    if (pending.length === 0) {
      allOptimizedRef.current = true;
      setAllOptimized(true);
      return;
    }

    const results = new Map(resultsRef.current);
    let anyCompleted = false;

    for (const orderId of pending) {
      try {
        const statusData = await getOrderOptimizationStatus(orderId);
        if (statusData.status === "optimized" && statusData.optimized_cost !== undefined) {
          results.set(orderId, statusData as OptimizationResult);
          anyCompleted = true;
        } else if (statusData.status === "failed" || statusData.status === "no_savings") {
          results.set(orderId, {
            order_id: orderId,
            recommended_box: statusData.recommended_box || "N/A",
            baseline_cost: statusData.baseline_cost || 0,
            optimized_cost: statusData.optimized_cost || statusData.baseline_cost || 0,
            savings: statusData.savings || 0,
            efficiency_score: statusData.efficiency_score || 0,
            decision_explanation: statusData.decision_explanation || `Order ${statusData.status}`,
            profit: statusData.profit || 0,
            packing_instructions: "",
            item_order: [],
            packed_items: [],
          } as OptimizationResult);
          anyCompleted = true;
        }
      } catch {
        // Still optimizing, will retry
      }
    }

    if (anyCompleted) {
      resultsRef.current = results;
      setOptimizationResults(new Map(results));
    }

    if (orderIdsRef.current.every((id) => results.has(id))) {
      allOptimizedRef.current = true;
      setAllOptimized(true);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    }
  }, []);

  useEffect(() => {
    if (!result || result.order_ids.length === 0 || allOptimizedRef.current) return;

    const newlyCreated = result.order_ids.filter(
      (id) => !orderIdsRef.current.includes(id) && !resultsRef.current.has(id)
    );
    if (newlyCreated.length > 0) {
      orderIdsRef.current = [...orderIdsRef.current, ...newlyCreated];
      setOptimizingOrderIds(orderIdsRef.current);
    }

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(pollOptimizationStatus, 2000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [result, pollOptimizationStatus]);

  useEffect(() => {
    if (!result) return;
    const stateToSave = {
      result,
      step,
      optimizingOrderIds,
      optimizationResults: Object.fromEntries(optimizationResults),
      allOptimized,
      expandedUploadOrders: Array.from(expandedUploadOrders),
      show3DFor,
    };
    sessionStorage.setItem("upload_state", JSON.stringify(stateToSave));
  }, [result, step, optimizingOrderIds, optimizationResults, allOptimized, expandedUploadOrders, show3DFor]);

  const steps = [
    { n: 1, label: "Upload CSV / Excel" },
    { n: 2, label: "Configure" },
    { n: 3, label: "Optimize" },
    { n: 4, label: "Results" },
  ];

  const toggleExpandUploadOrder = (orderId: number) => {
    setExpandedUploadOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggle3DUpload = (orderId: number) => {
    setShow3DFor(prev => prev === orderId ? null : orderId);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-black text-foreground tracking-tight">Upload Orders</h2>
        <p className="text-[12px] text-muted-dark mt-1">Bulk import orders from any Indian ecommerce platform</p>
      </div>

      {/* Step Flow */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all whitespace-nowrap ${
                step > s.n
                  ? "bg-teal/10 text-teal border border-teal/20"
                  : step === s.n
                  ? "bg-accent/10 text-accent border border-accent/25 shadow-[0_0_20px_rgba(200,255,0,.05)]"
                  : "border border-border text-muted-dark"
              }`}
            >
              {step > s.n ? <CheckCircle className="h-3.5 w-3.5" /> : s.n}
              {s.label}
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-3 min-w-[16px]" />}
          </div>
        ))}
      </div>

      {/* CSV Format Guide */}
      <Card>
        <div className="mb-4">
          <div className="text-[13px] font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            Supported CSV formats — Indian ecommerce platforms
          </div>
          <div className="text-[10px] text-muted-dark mt-0.5">Auto-detects column names from your platform export</div>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-1.5 overflow-x-auto mb-4 pb-1">
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

        <div className="bg-ink2 border border-border rounded-xl p-4 mb-4">
          <div className="text-[11px] font-semibold text-foreground mb-1.5">{platforms[activeTab].ico} {platforms[activeTab].name}</div>
          <div className="text-[11px] text-muted leading-relaxed">{platforms[activeTab].fields}</div>
        </div>

        {/* Required Fields */}
        <div className="bg-accent/5 border border-accent/10 rounded-xl p-4">
          <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-3">Required fields (minimum to optimize)</div>
          <div className="space-y-2">
            {requiredFields.map((f) => (
              <div key={f.name} className="flex items-center gap-2 text-[10px]">
                <span className={`px-2 py-0.5 rounded-full font-semibold min-w-[100px] ${
                  f.req
                    ? "bg-accent/10 text-accent border border-accent/20"
                    : "bg-surface2 text-muted border border-border"
                }`}>
                  {f.name}
                </span>
                <span className="text-muted-dark">aliases: {f.aliases}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Upload Area */}
      <Card gradient glow>
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all cursor-pointer relative ${
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
          <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all ${
            file ? "bg-accent/10 border border-accent/20" : "bg-surface2 border border-border"
          }`}>
            <Upload className={`w-6 h-6 ${file ? "text-accent" : "text-muted"}`} />
          </div>
          {file ? (
            <div>
              <p className="text-foreground font-semibold text-base">{file.name}</p>
              <p className="text-muted text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-foreground font-semibold text-base">Drop your order CSV here</p>
              <p className="text-muted text-sm mt-2">Supports Shiprocket · Delhivery · Meesho · Amazon · Flipkart · Unicommerce exports</p>
              <p className="text-muted-dark text-[10px] mt-2">UTF-8 encoding · Max 10MB · Auto-detects column format</p>
            </div>
          )}
        </div>

        {/* Settings */}
        {file && (
          <div className="mt-5 space-y-4">
            <div className="text-[11px] font-bold text-muted-dark uppercase tracking-wider flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Optimization settings
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-dark uppercase tracking-wider mb-2 block">Courier / Destination zone</label>
              <select
                value={shippingZone}
                onChange={(e) => setShippingZone(e.target.value)}
                className="w-full rounded-xl border border-border2 bg-surface2 px-4 py-3 text-sm text-foreground outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,255,0,.08)] transition-all"
              >
                <option value="Zone A">Zone A — Metro local (₹45/kg) — Mumbai, Delhi, Bangalore</option>
                <option value="Zone B">Zone B — Regional (₹55/kg) — Same state</option>
                <option value="Zone C">Zone C — National (₹65/kg) — Inter-state</option>
                <option value="Zone D">Zone D — Remote (₹80/kg) — Northeast, J&K, Andaman</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-muted-dark uppercase tracking-wider mb-2 block">Optimization priority</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPriority("cost")}
                  className={`rounded-xl border px-4 py-3 text-[12px] font-semibold transition-all ${
                    priority === "cost"
                      ? "border-accent/30 bg-accent/8 text-accent"
                      : "border-border bg-surface2 text-muted hover:border-border2"
                  }`}
                >
                  💰 Minimize total cost
                </button>
                <button
                  onClick={() => setPriority("speed")}
                  className={`rounded-xl border px-4 py-3 text-[12px] font-semibold transition-all ${
                    priority === "speed"
                      ? "border-accent/30 bg-accent/8 text-accent"
                      : "border-border bg-surface2 text-muted hover:border-border2"
                  }`}
                >
                  ⚡ Minimize box size
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleUpload} loading={uploading} size="lg" className="flex-1">
                🚀 Run AI packaging engine
              </Button>
              <Button variant="outline" onClick={resetUpload}>
                ← Upload new file
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red bg-red/8 border border-red/20 rounded-xl px-4 py-3 text-[13px]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {uploading && (
          <div className="mt-4">
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div className="bg-accent h-full rounded-full animate-pulse-custom progress-glow" style={{ width: "60%" }} />
            </div>
            <p className="text-[11px] text-muted mt-2">Processing orders...</p>
          </div>
        )}
      </Card>

      {/* Results */}
      {result && (
        <Card gradient>
          <div className="flex items-center justify-between mb-5">
            <div className="text-[14px] font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-teal" />
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

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-ink2 border border-border rounded-xl p-5 text-center">
              <p className="font-display text-3xl font-black text-foreground">{result.total_rows}</p>
              <p className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5">Total Rows</p>
            </div>
            <div className="bg-teal/8 border border-teal/20 rounded-xl p-5 text-center">
              <p className="font-display text-3xl font-black text-teal">{result.valid_rows}</p>
              <p className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5">Valid Rows</p>
            </div>
            <div className="bg-red/8 border border-red/20 rounded-xl p-5 text-center">
              <p className="font-display text-3xl font-black text-red">{result.failed_rows}</p>
              <p className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5">Failed Rows</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-5">
              <h4 className="text-[11px] font-bold text-red uppercase tracking-wider mb-3 flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5" />
                Row Errors
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {result.errors.map((err, i) => (
                  <div key={i} className="bg-red/6 border border-red/15 rounded-xl p-3 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-red text-[12px] font-semibold">Row {err.row}:</span>
                      <span className="text-muted text-[12px] ml-1">{err.error}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.order_ids.length > 0 && (
            <div className="space-y-4">
              {/* Optimization progress */}
              <div className="flex items-center justify-between">
                <div className="text-[12px] font-semibold text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" />
                  Optimization Status
                </div>
                <div className="flex items-center gap-2">
                  {optimizingOrderIds.length > 0 && !allOptimized && (
                    <>
                      <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" />
                      <span className="text-[11px] text-accent">
                        {optimizationResults.size}/{optimizingOrderIds.length} completed
                      </span>
                    </>
                  )}
                  {allOptimized && (
                    <Badge variant="success">All optimized</Badge>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {optimizingOrderIds.length > 0 && (
                <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500 progress-glow"
                    style={{ width: `${(optimizationResults.size / optimizingOrderIds.length) * 100}%` }}
                  />
                </div>
              )}

              {/* Individual order results */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {result.order_ids.map((orderId) => {
                  const optResult = optimizationResults.get(orderId);
                  const isOptimizing = optimizingOrderIds.includes(orderId) && !optResult;
                  const isExpanded = expandedUploadOrders.has(orderId);
                  const show3D = show3DFor === orderId;
                  const box = boxes.find(b => b.name === optResult?.recommended_box);

                  return (
                    <div key={orderId} className="border border-border rounded-xl overflow-hidden hover:border-border2 transition-all">
                      <div className="flex items-center justify-between p-4 bg-ink2/50">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[12px] text-accent font-semibold">Order #{orderId}</span>
                          {isOptimizing && (
                            <div className="flex items-center gap-1.5">
                              <Loader2 className="h-3 w-3 text-accent animate-spin" />
                              <Badge variant="warning">optimizing...</Badge>
                            </div>
                          )}
                          {optResult && optResult.savings > 0 && (
                            <Badge variant="success">optimized</Badge>
                          )}
                          {optResult && optResult.savings === 0 && (
                            <Badge variant="warning">no savings</Badge>
                          )}
                        </div>
                        {optResult && (
                          <button
                            onClick={() => toggleExpandUploadOrder(orderId)}
                            className="text-[11px] text-accent hover:underline font-semibold"
                          >
                            {isExpanded ? "Collapse" : "View details"}
                          </button>
                        )}
                      </div>

                      {isExpanded && optResult && (
                        <div className="p-4 space-y-4 animate-fadeInScale">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Card className="border-l-[3px] border-l-accent/30 bg-accent/5">
                              <div className="flex items-start gap-2">
                                <Package className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[11px] text-muted-dark uppercase tracking-wider font-bold mb-1">Recommended Box</p>
                                  <p className="text-[14px] font-bold text-accent">{optResult.recommended_box}</p>
                                  {box && (
                                    <p className="text-[10px] text-muted mt-1">
                                      {box.length_cm} × {box.width_cm} × {box.height_cm} cm
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>

                            <Card className="border-l-[3px] border-l-teal/30 bg-teal/5">
                              <div className="flex items-start gap-2">
                                <TrendingUp className="h-4 w-4 text-teal mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-[11px] text-muted-dark uppercase tracking-wider font-bold mb-1">Cost Breakdown</p>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-[11px] text-muted line-through">Rs.{optResult.baseline_cost.toFixed(2)}</span>
                                    <ArrowRight className="h-3 w-3 text-muted" />
                                    <span className="text-[14px] font-bold text-teal">Rs.{optResult.optimized_cost.toFixed(2)}</span>
                                  </div>
                                  {optResult.savings > 0 && (
                                    <p className="text-[10px] text-teal mt-1">
                                      Saving Rs.{optResult.savings.toFixed(2)} ({((optResult.savings / optResult.baseline_cost) * 100).toFixed(1)}%)
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </div>

                          {optResult.decision_explanation && (
                            <Card className="bg-purple/5 border-purple/10">
                              <div className="flex items-start gap-2">
                                <span className="text-[11px] text-muted-dark uppercase tracking-wider font-bold mb-1">Why this box?</span>
                              </div>
                              <p className="text-[11px] text-muted leading-relaxed">{optResult.decision_explanation}</p>
                            </Card>
                          )}

                          {optResult.packed_items && optResult.packed_items.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-[12px] font-semibold text-foreground flex items-center gap-2">
                                  3D Packing Visualization
                                </p>
                                <button
                                  onClick={() => toggle3DUpload(orderId)}
                                  className="flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1 text-[10px] font-semibold hover:bg-accent/20 transition-all"
                                >
                                  {show3D ? "Hide 3D" : "Show 3D"}
                                </button>
                              </div>
                              {show3D && (
                                <ThreeDPackViewer
                                  box={{
                                    name: optResult.recommended_box,
                                    length_cm: box?.length_cm || 45,
                                    width_cm: box?.width_cm || 35,
                                    height_cm: box?.height_cm || 25,
                                  }}
                                  items={optResult.packed_items.map(item => ({
                                    product_name: item.product_name,
                                    position_x: item.position_x,
                                    position_y: item.position_y,
                                    position_z: item.position_z,
                                    length_cm: item.length_cm || 10,
                                    width_cm: item.width_cm || 10,
                                    height_cm: item.height_cm || 10,
                                    is_fragile: item.is_fragile,
                                    quantity: item.quantity,
                                  }))}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {optResult && optResult.savings === 0 && !isExpanded && (
                        <div className="px-4 py-3 text-[11px] text-muted-dark border-t border-border/50">
                          {optResult.decision_explanation || "No cost savings possible with available boxes"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-3 border-t border-border/50">
                <Button onClick={() => router.push("/orders")} className="flex-1">
                  <CheckCircle className="w-4 h-4" />
                  View All Orders
                </Button>
                <Button onClick={() => router.push("/analytics")} variant="outline" className="flex-1">
                  <Zap className="w-4 h-4" />
                  View Analytics
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
