"use client";

import { useState, useEffect } from "react";
import { getOrderOptimizationStatus } from "@/services/orders.service";
import type { OptimizationResult } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import {
  TrendingUp, Info, Rotate3D, ArrowRight,
  X, Box, Layers, CheckCircle, AlertTriangle, Zap, Ruler
} from "lucide-react";
import dynamic from "next/dynamic";
import api from "@/services/api";

const ThreeDPackViewer = dynamic(
  () => import("@/components/optimization/ThreeDPackViewer"),
  { ssr: false, loading: () => <div className="h-[400px] bg-[#0a0a14] rounded-xl flex items-center justify-center text-gray-500 text-sm border border-border">Loading 3D viewer...</div> }
);

interface BoxInfo {
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  max_weight_kg: number;
  supports_fragile: boolean;
}

interface PackNowModalProps {
  orderId: number;
  onClose: () => void;
}

export default function PackNowModal({ orderId, onClose }: PackNowModalProps) {
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [boxInfo, setBoxInfo] = useState<BoxInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [showDimensions, setShowDimensions] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOrderOptimizationStatus(orderId);
        setResult(data);

        if (data.recommended_box) {
          try {
            const boxes = await api.get("/inventory");
            const box = boxes.data.find((b: BoxInfo) => b.name === data.recommended_box);
            if (box) setBoxInfo(box);
          } catch { /* box not found */ }
        }
      } catch {
        setError("Failed to load optimization data. Please run optimization first.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-ink2 border border-border rounded-2xl shadow-2xl animate-fadeInScale">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-ink2/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-foreground">Pack Now — Order #{orderId}</h3>
              <p className="text-[10px] text-muted-dark">FFD Engine optimization result</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[.04] border border-border flex items-center justify-center text-muted hover:text-foreground hover:bg-white/[.08] transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Spinner size="lg" />
              <p className="mt-4 text-sm text-muted">Loading optimization data...</p>
            </div>
          )}

          {error && (
            <Card className="border-red/20 bg-red/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-red">Failed to Load</p>
                  <p className="text-[12px] text-muted mt-1">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-3 text-[12px] text-accent hover:underline font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </Card>
          )}

          {result && !loading && (
            <>
              {/* Status Banner */}
              <div className={`rounded-xl p-4 border ${
                result.savings > 0
                  ? "bg-teal/5 border-teal/20"
                  : result.savings === 0
                  ? "bg-orange/5 border-orange/20"
                  : "bg-red/5 border-red/20"
              }`}>
                <div className="flex items-center gap-3">
                  {result.savings > 0 ? (
                    <CheckCircle className="h-5 w-5 text-teal flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-orange flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-[13px] font-semibold ${
                      result.savings > 0 ? "text-teal" : "text-orange"
                    }`}>
                      {result.savings > 0
                        ? `Optimized — Saved Rs.${result.savings.toFixed(2)}`
                        : "Best fit only — No cost savings possible"
                      }
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      Efficiency: {(result.efficiency_score * 100).toFixed(0)}% space utilization
                    </p>
                  </div>
                </div>
              </div>

              {/* Why This Box */}
              <Card className="border-l-[3px] border-l-accent/30 bg-accent/5">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[12px] font-bold text-foreground mb-1">Why this box?</p>
                    <p className="text-[12px] text-muted leading-relaxed">
                      {result.decision_explanation || "The FFD engine selected this box as the optimal fit based on volume, weight, and fragility constraints."}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Box Recommendation + Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-surface2 border-border">
                  <div className="flex items-start gap-3">
                    <Box className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">Recommended Box</p>
                      <p className="text-[18px] font-bold text-accent">{result.recommended_box}</p>
                      {boxInfo && (
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                          <Ruler className="h-3 w-3" />
                          {boxInfo.length_cm} × {boxInfo.width_cm} × {boxInfo.height_cm} cm
                          <span className="text-muted-dark">·</span>
                          Max {boxInfo.max_weight_kg}kg
                          {boxInfo.supports_fragile && (
                            <>
                              <span className="text-muted-dark">·</span>
                              <span className="text-teal">Fragile-safe</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                <Card className="bg-surface2 border-border">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">Cost Breakdown</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] text-muted line-through">Rs.{result.baseline_cost.toFixed(2)}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted" />
                        <span className="text-[20px] font-bold text-teal">Rs.{result.optimized_cost.toFixed(2)}</span>
                      </div>
                      {result.savings > 0 && (
                        <p className="text-[11px] text-teal mt-1">
                          Saving Rs.{result.savings.toFixed(2)} ({((result.savings / result.baseline_cost) * 100).toFixed(1)}%)
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Packing Instructions */}
              {result.item_order && result.item_order.length > 0 && (
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <Layers className="h-4 w-4 text-purple" />
                    <p className="text-[13px] font-semibold text-foreground">How to Pack (bottom to top)</p>
                  </div>
                  <div className="space-y-2">
                    {result.item_order.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-ink2/50 border border-border/50">
                        <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[11px] font-bold text-accent flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[12px] text-foreground font-medium">{item.product_name}</span>
                          <span className="text-[11px] text-muted ml-1">×{item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.is_fragile ? "danger" : "success"}>
                            {item.layer}
                          </Badge>
                          {item.is_fragile && (
                            <span className="text-[9px] text-orange bg-orange/10 px-1.5 py-0.5 rounded-full border border-orange/20">
                              ⚠ Handle with care
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 3D Pack View */}
              {result.packed_items && result.packed_items.length > 0 && (
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Rotate3D className="h-4 w-4 text-accent" />
                      <p className="text-[13px] font-semibold text-foreground">Pack 3D View</p>
                      <Badge variant="warning">Interactive</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowDimensions(!showDimensions)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                          showDimensions
                            ? "bg-lime/10 text-lime border border-lime/20"
                            : "bg-surface2 text-muted border border-border hover:border-border2"
                        }`}
                      >
                        <Ruler className="h-3 w-3" />
                        {showDimensions ? "Hide Dims" : "Show Dims"}
                      </button>
                      <button
                        onClick={() => setShow3D(!show3D)}
                        className="flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1.5 text-[11px] font-semibold hover:bg-accent/20 transition-all"
                      >
                        <Rotate3D className="h-3 w-3" />
                        {show3D ? "Close 3D" : "Open 3D"}
                      </button>
                    </div>
                  </div>

                  {show3D && (
                    <ThreeDPackViewer
                      box={{
                        name: result.recommended_box,
                        length_cm: boxInfo?.length_cm || 45,
                        width_cm: boxInfo?.width_cm || 35,
                        height_cm: boxInfo?.height_cm || 25,
                      }}
                      items={result.packed_items.map(item => ({
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
                      showDimensions={showDimensions}
                    />
                  )}

                  {!show3D && (
                    <div className="flex flex-col items-center justify-center py-12 bg-ink2/50 rounded-xl border border-border/50 border-dashed">
                      <Rotate3D className="h-10 w-10 text-muted-dark mb-3" />
                      <p className="text-[13px] text-muted font-medium">Click &quot;Open 3D&quot; to view the interactive 3D pack</p>
                      <p className="text-[11px] text-muted-dark mt-1">Rotate 360° · See exact box dimensions · Zoom in/out</p>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
