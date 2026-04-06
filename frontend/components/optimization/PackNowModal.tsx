"use client";

import { useState, useEffect } from "react";
import { getOrderOptimizationStatus } from "@/services/orders.service";
import type { OptimizationResult } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import {
  TrendingUp, Info, Rotate3D,
  X, Box, Layers, CheckCircle, AlertTriangle, Zap, Ruler, ShieldAlert, ArrowDownCircle, ArrowUpCircle, Circle
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
  const [show3D, setShow3D] = useState(true);

  const hasFragile = result?.item_order?.some(item => item.is_fragile) || false;

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
              {/* Fragile Alert */}
              {hasFragile && (
                <div className="rounded-xl p-4 border bg-amber-500/10 border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold text-amber-500 uppercase tracking-wide">
                        Fragile Order
                      </p>
                      <p className="text-[12px] text-amber-500/80 mt-0.5 font-medium">
                        Contains delicate items. Pack carefully and add necessary padding. Follow packing instructions strictly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                    <div className="flex-1 w-full">
                      <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-3">Cost Analysis</p>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="text-muted">Baseline Cost</span>
                          <span className="text-muted line-through">Rs.{result.baseline_cost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-[13px] font-semibold">
                          <span className="text-foreground">Optimized Cost</span>
                          <span className="text-foreground">Rs.{result.optimized_cost.toFixed(2)}</span>
                        </div>
                        <div className="h-px bg-border my-1"></div>
                        {result.savings > 0 ? (
                          <div className="flex justify-between items-center text-[14px] font-bold text-teal">
                            <span>Total Savings</span>
                            <span>Rs.{result.savings.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center text-[14px] font-bold text-orange">
                            <span>Best Fit Only</span>
                            <span>Rs.0.00</span>
                          </div>
                        )}
                      </div>
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
                      <div key={i} className={`flex items-center gap-3 py-3 px-4 rounded-xl border border-border/50 ${
                        item.is_fragile ? "bg-amber-500/5 border-amber-500/20" : "bg-ink2/50"
                      }`}>
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-[12px] font-bold text-muted flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-foreground font-semibold block">{item.product_name}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] text-muted bg-surface2 px-1.5 py-0.5 rounded">× {item.quantity} units</span>
                            
                            {item.is_fragile && (
                              <span className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                <ShieldAlert className="h-3 w-3" />
                                Add Padding
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {item.layer === "bottom" && (
                            <div className="flex items-center gap-1.5 text-blue text-[11px] font-semibold bg-blue/10 px-2.5 py-1.5 rounded-lg border border-blue/20">
                              <ArrowDownCircle className="h-3.5 w-3.5" />
                              Heavy (Bottom)
                            </div>
                          )}
                          {item.layer === "middle" && (
                            <div className="flex items-center gap-1.5 text-teal text-[11px] font-semibold bg-teal/10 px-2.5 py-1.5 rounded-lg border border-teal/20">
                              <Circle className="h-3.5 w-3.5" />
                              Standard (Middle)
                            </div>
                          )}
                          {item.layer === "top" && (
                            <div className="flex items-center gap-1.5 text-purple text-[11px] font-semibold bg-purple/10 px-2.5 py-1.5 rounded-lg border border-purple/20">
                              <ArrowUpCircle className="h-3.5 w-3.5" />
                              Light (Top)
                            </div>
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
