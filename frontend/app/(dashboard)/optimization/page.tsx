"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { useOptimization } from "@/hooks/useOptimization";
import { getOrderOptimizationStatus } from "@/services/orders.service";
import OptimizationResultCard from "@/components/optimization/OptimizationResult";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppContext } from "@/context/AppContext";
import { Zap, RotateCcw, RefreshCw, CheckCircle, Loader2, Package, TrendingUp, Info, Rotate3D, ChevronDown, ChevronUp } from "lucide-react";
import type { OptimizationResult } from "@/types";
import dynamic from "next/dynamic";
import api from "@/services/api";

const ThreeDPackViewer = dynamic(
  () => import("@/components/optimization/ThreeDPackViewer"),
  { ssr: false, loading: () => <div className="h-[400px] bg-[#111111] rounded-xl flex items-center justify-center text-gray-500 text-sm">Loading 3D viewer...</div> }
);

interface BoxInfo {
  name: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  max_weight_kg: number;
  supports_fragile: boolean;
}

interface ExtendedResult extends OptimizationResult {
  status: string;
  updated_at: string | null;
  boxInfo?: BoxInfo;
}

export default function OptimizationPage() {
  const searchParams = useSearchParams();
  const preselectedOrder = searchParams.get("order");
  const { orders, loading: ordersLoading, refetch } = useOrders();
  const { result: currentResult, loading: optLoading, error: optError, runOptimization, reset } = useOptimization();
  const { addToast } = useAppContext();
  const [selectedOrder, setSelectedOrder] = useState<number>(preselectedOrder ? Number(preselectedOrder) : 0);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [completedResults, setCompletedResults] = useState<Map<number, ExtendedResult>>(new Map());
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [show3DFor, setShow3DFor] = useState<number | null>(null);
  const [boxes, setBoxes] = useState<BoxInfo[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingOrderIdsRef = useRef<Set<number>>(new Set());

  // Fetch boxes for 3D viewer
  useEffect(() => {
    api.get("/inventory")
      .then(res => setBoxes(res.data))
      .catch(() => {});
  }, []);

  // Poll for background optimization status (from upload)
  const pollCompletedOrders = useCallback(async () => {
    const pendingIds = Array.from(pollingOrderIdsRef.current);
    if (pendingIds.length === 0) return;

    const newResults = new Map(completedResults);
    let changed = false;

    for (const orderId of pendingIds) {
      if (completedResults.has(orderId)) continue;
      try {
        const data = await getOrderOptimizationStatus(orderId);
        if (data.status === "optimized" || data.status === "no_savings" || data.status === "failed") {
          const box = boxes.find(b => b.name === data.recommended_box);
          newResults.set(orderId, {
            ...data,
            boxInfo: box,
          } as ExtendedResult);
          pollingOrderIdsRef.current.delete(orderId);
          changed = true;
        }
      } catch {
        // still running
      }
    }

    if (changed) {
      setCompletedResults(newResults);
    }

    if (pollingOrderIdsRef.current.size === 0 && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxes]);

  // Start polling when we have new order IDs from upload
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const orderIdsToTrack = orders
      .filter(o => (o.status === "optimized" || o.status === "no_savings") && !completedResults.has(o.id))
      .map(o => o.id);

    if (orderIdsToTrack.length > 0) {
      orderIdsToTrack.forEach(id => pollingOrderIdsRef.current.add(id));

      if (!pollingRef.current) {
        pollingRef.current = setInterval(pollCompletedOrders, 2000);
      }
    }
  }, [orders]);

  useEffect(() => {
    if (preselectedOrder) {
      setSelectedOrder(Number(preselectedOrder));
    }
  }, [preselectedOrder]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "optimized");
  const failedOrders = orders.filter((o) => o.status === "failed");
  const noSavingsOrders = orders.filter((o) => o.status === "no_savings");

  const handleOptimize = async () => {
    if (!selectedOrder) return;

    try {
      const data = await runOptimization(selectedOrder);
      const box = boxes.find(b => b.name === data.recommended_box);
      const extendedResult: ExtendedResult = {
        ...data,
        status: "optimized",
        updated_at: new Date().toISOString(),
        boxInfo: box,
      };

      setCompletedResults(prev => new Map(prev).set(selectedOrder, extendedResult));
      setExpandedOrders(prev => new Set(prev).add(selectedOrder));
      addToast(`Optimization complete — Saved Rs.${data.savings.toFixed(2)}`, "success");
      refetch();
    } catch {
      addToast("Optimization failed", "error");
    }
  };

  const handleReset = () => {
    reset();
    setSelectedOrder(0);
  };

  const handleViewCompleted = async (orderId: number) => {
    // Check if we already have it cached
    const cached = completedResults.get(orderId);
    if (cached) {
      setExpandedOrders(prev => {
        const next = new Set(prev);
        if (next.has(orderId)) next.delete(orderId);
        else next.add(orderId);
        return next;
      });
      return;
    }

    try {
      const data = await getOrderOptimizationStatus(orderId);
      const box = boxes.find(b => b.name === data.recommended_box);
      const extendedResult: ExtendedResult = {
        ...data,
        boxInfo: box,
      };
      setCompletedResults(prev => new Map(prev).set(orderId, extendedResult));
      setExpandedOrders(prev => new Set(prev).add(orderId));
    } catch {
      addToast("Failed to load optimization result", "error");
    }
  };

  const toggleExpand = (orderId: number) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
        setShow3DFor(null);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const toggle3D = (orderId: number) => {
    setShow3DFor(prev => prev === orderId ? null : orderId);
  };

  if (ordersLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black text-foreground tracking-tight">Optimize</h2>
          <p className="text-[12px] text-muted-dark mt-0.5">Rule-based FFD engine — select a box, see savings, view 3D pack</p>
        </div>
        <button
          onClick={async () => {
            setIsRefreshing(true);
            await refetch();
            setIsRefreshing(false);
          }}
          className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] font-semibold text-muted hover:text-foreground hover:border-border2 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "pending", label: "Pending", count: pendingOrders.length },
          { key: "completed", label: "Optimized", count: completedOrders.length },
          { key: "no_savings", label: "No Savings", count: noSavingsOrders.length },
          { key: "failed", label: "Failed", count: failedOrders.length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all whitespace-nowrap ${
              statusFilter === f.key
                ? "bg-accent/10 text-accent border border-accent/20"
                : "bg-surface border border-border text-muted hover:border-border2"
            }`}
          >
            {f.label}
            <span className="text-[10px] text-muted-dark">{f.count}</span>
          </button>
        ))}
      </div>

      {/* Manual Optimization */}
      {statusFilter === "pending" && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-accent" />
              <h3 className="text-[13px] font-semibold text-foreground">Run Optimization</h3>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-muted-dark uppercase tracking-wider">
                Select Order
              </label>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-border2 bg-surface2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,255,0,.08)] transition-all"
              >
                <option value={0}>Choose a pending order...</option>
                {pendingOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} — {order.shipping_zone} ({order.channel ? order.channel + " · " : ""}{order.customer_name || "No customer"})
                  </option>
                ))}
              </select>
            </div>

            {pendingOrders.length === 0 && (
              <div className="rounded-xl bg-border/50 px-4 py-3 text-[13px] text-muted">
                No pending orders. Upload orders or wait for background optimization to complete.
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <Button onClick={handleOptimize} disabled={!selectedOrder} loading={optLoading}>
                <Zap className="h-3.5 w-3.5" />
                Run AI packaging engine
              </Button>
              {currentResult && (
                <Button variant="ghost" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Current optimization result */}
      {currentResult && !optLoading && (
        <OptimizationResultCard result={currentResult} />
      )}

      {/* Optimization loading */}
      {optLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-muted">Calculating optimal packaging...</p>
            <p className="text-[11px] text-muted-dark mt-1">Evaluating all boxes for best fit</p>
          </div>
        </Card>
      )}

      {/* Error */}
      {optError && !optLoading && (
        <EmptyState
          title="Optimization Failed"
          description={optError}
          action={
            <Button onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" />
              Try Again
            </Button>
          }
        />
      )}

      {/* Background optimization tracking */}
      {pollingOrderIdsRef.current.size > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 text-accent animate-spin" />
            <span className="text-[13px] font-semibold text-foreground">Background Optimization in Progress</span>
            <Badge variant="warning">{pollingOrderIdsRef.current.size} remaining</Badge>
          </div>
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all duration-500"
              style={{ width: `${((completedResults.size) / (completedResults.size + pollingOrderIdsRef.current.size)) * 100}%` }}
            />
          </div>
        </Card>
      )}

      {/* Completed Orders with Results */}
      {(statusFilter === "completed" || statusFilter === "no_savings" || statusFilter === "failed") && (
        <div className="space-y-3">
          {(statusFilter === "completed" ? completedOrders : statusFilter === "no_savings" ? noSavingsOrders : failedOrders).map((order) => {
            const optResult = completedResults.get(order.id);
            const isExpanded = expandedOrders.has(order.id);
            const show3D = show3DFor === order.id;

            return (
              <Card key={order.id} hover>
                {/* Order Header - always visible */}
                <button
                  onClick={() => {
                    if (!optResult) handleViewCompleted(order.id);
                    else toggleExpand(order.id);
                  }}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {optResult?.status === "optimized" ? (
                      <CheckCircle className="h-4 w-4 text-accent-green flex-shrink-0" />
                    ) : optResult?.status === "no_savings" ? (
                      <Info className="h-4 w-4 text-accent-orange flex-shrink-0" />
                    ) : (
                      <span className="h-4 w-4 rounded-full bg-accent-red/20 flex-shrink-0" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] text-accent font-semibold">#{order.id}</span>
                        {order.channel && (
                          <Badge variant="purple">{order.channel}</Badge>
                        )}
                        {optResult?.status === "optimized" && (
                          <Badge variant="success">
                            Saved Rs.{optResult.savings.toFixed(2)}
                          </Badge>
                        )}
                        {optResult?.status === "no_savings" && (
                          <Badge variant="warning">Best fit only</Badge>
                        )}
                        {optResult?.status === "failed" && (
                          <Badge variant="danger">Failed</Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted mt-0.5">
                        {order.customer_name || "No customer"} · {order.shipping_zone}
                        {order.customer_city && ` · ${order.customer_city}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {optResult && (
                      <div className="text-right">
                        <div className="text-[11px] text-muted">Box: <span className="text-foreground font-medium">{optResult.recommended_box}</span></div>
                        <div className="text-[11px] text-muted">Efficiency: <span className="text-accent-green font-medium">{(optResult.efficiency_score * 100).toFixed(0)}%</span></div>
                      </div>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && optResult && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
                    {/* Box Recommendation & Why */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Card className="border-l-[3px] border-l-accent/30">
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[12px] font-semibold text-foreground mb-1">Recommended Box</p>
                            <p className="text-[14px] font-bold text-accent">{optResult.recommended_box}</p>
                            {optResult.boxInfo && (
                              <p className="text-[11px] text-muted mt-1">
                                {optResult.boxInfo.length_cm} × {optResult.boxInfo.width_cm} × {optResult.boxInfo.height_cm} cm · Max {optResult.boxInfo.max_weight_kg}kg
                                {optResult.boxInfo.supports_fragile && " · Supports fragile"}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>

                      <Card className="border-l-[3px] border-l-accent-green/30">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-accent-green mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-[12px] font-semibold text-foreground mb-1">Cost Breakdown</p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-[11px] text-muted line-through">Rs.{optResult.baseline_cost.toFixed(2)}</span>
                              <span className="text-[14px] font-bold text-accent-green">Rs.{optResult.optimized_cost.toFixed(2)}</span>
                            </div>
                            {optResult.savings > 0 && (
                              <p className="text-[11px] text-accent-green mt-0.5">
                                Saving Rs.{optResult.savings.toFixed(2)} ({((optResult.savings / optResult.baseline_cost) * 100).toFixed(1)}%)
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Why this box */}
                    <Card className="bg-accent/5 border-accent/10">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-[12px] font-semibold text-foreground mb-1">Why this box?</p>
                          <p className="text-[12px] text-muted leading-relaxed">{optResult.decision_explanation}</p>
                        </div>
                      </div>
                    </Card>

                    {/* Packing Order */}
                    {optResult.item_order && optResult.item_order.length > 0 && (
                      <Card>
                        <p className="text-[12px] font-semibold text-foreground mb-3">Packing Order (bottom to top)</p>
                        <div className="space-y-1.5">
                          {optResult.item_order.map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5 py-1.5">
                              <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent flex-shrink-0">
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <span className="text-[12px] text-foreground font-medium">{item.product_name}</span>
                                <span className="text-[11px] text-muted ml-1">×{item.quantity}</span>
                              </div>
                              <Badge variant={item.is_fragile ? "danger" : "success"}>
                                {item.layer}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* 3D Viewer */}
                    {optResult.packed_items && optResult.packed_items.length > 0 && (
                      <Card>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Rotate3D className="h-4 w-4 text-accent" />
                            <p className="text-[12px] font-semibold text-foreground">3D Packing Visualization</p>
                          </div>
                          <button
                            onClick={() => toggle3D(order.id)}
                            className="flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1.5 text-[11px] font-semibold hover:bg-accent/20 transition-all"
                          >
                            <Rotate3D className="h-3 w-3" />
                            {show3D ? "Hide 3D" : "Show 3D"}
                          </button>
                        </div>
                        {show3D && (
                          <ThreeDPackViewer
                            box={{
                              name: optResult.recommended_box,
                              length_cm: optResult.boxInfo?.length_cm || 45,
                              width_cm: optResult.boxInfo?.width_cm || 35,
                              height_cm: optResult.boxInfo?.height_cm || 25,
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
                      </Card>
                    )}
                  </div>
                )}

                {/* Loading state for completed orders without cached result */}
                {!optResult && order.status !== "pending" && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                    <Loader2 className="h-3 w-3 text-accent animate-spin" />
                    <span className="text-[11px] text-muted">Loading optimization details...</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Pending orders list when no optimization running */}
      {statusFilter === "pending" && pendingOrders.length > 0 && !currentResult && !optLoading && (
        <Card>
          <div className="text-[13px] font-semibold text-foreground mb-3">Pending Orders</div>
          <div className="space-y-2">
            {pendingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-accent">#{order.id}</span>
                  <span className="text-[12px] text-muted">{order.shipping_zone}</span>
                  {order.channel && <Badge variant="purple">{order.channel}</Badge>}
                  {order.customer_name && (
                    <span className="text-[11px] text-muted-dark">{order.customer_name}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(order.id);
                    setStatusFilter("pending");
                  }}
                  className="text-[11px] text-accent hover:underline font-semibold"
                >
                  Select →
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {statusFilter === "pending" && pendingOrders.length === 0 && (
        <EmptyState
          title="No pending orders"
          description="All orders have been optimized. Check the Optimized tab for results."
        />
      )}
    </div>
  );
}
