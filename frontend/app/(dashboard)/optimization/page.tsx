"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { useOptimization } from "@/hooks/useOptimization";
import { getOrderOptimizationStatus } from "@/services/orders.service";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { useAppContext } from "@/context/AppContext";
import {
  Zap, RotateCcw, RefreshCw, CheckCircle, Loader2, Package,
  TrendingUp, Info, Rotate3D, ChevronDown, ChevronUp,
  Box, AlertTriangle, XCircle, Clock
} from "lucide-react";
import type { OptimizationResult } from "@/types";
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

  useEffect(() => {
    api.get("/inventory")
      .then(res => setBoxes(res.data))
      .catch(() => {});
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  useEffect(() => {
    if (preselectedOrder) {
      setSelectedOrder(Number(preselectedOrder));
    }
  }, [preselectedOrder]);

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

  const filterOptions = [
    { key: "pending", label: "Pending", count: pendingOrders.length, icon: Clock, color: "text-accent" },
    { key: "completed", label: "Optimized", count: completedOrders.length, icon: CheckCircle, color: "text-teal" },
    { key: "no_savings", label: "No Savings", count: noSavingsOrders.length, icon: AlertTriangle, color: "text-orange" },
    { key: "failed", label: "Failed", count: failedOrders.length, icon: XCircle, color: "text-red" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-foreground tracking-tight">Optimize</h2>
          <p className="text-[12px] text-muted-dark mt-1">Rule-based FFD engine — select a box, see savings, view 3D pack</p>
        </div>
        <button
          onClick={async () => {
            setIsRefreshing(true);
            await refetch();
            setIsRefreshing(false);
          }}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] font-semibold text-muted hover:text-foreground hover:border-border2 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterOptions.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-all whitespace-nowrap ${
                statusFilter === f.key
                  ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_20px_rgba(200,255,0,.05)]"
                  : "bg-surface border border-border text-muted hover:border-border2"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${statusFilter === f.key ? f.color : "text-muted-dark"}`} />
              {f.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                statusFilter === f.key ? "bg-accent/10 text-accent/70" : "bg-ink2 text-muted-dark"
              }`}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Manual Optimization */}
      {statusFilter === "pending" && (
        <Card gradient glow>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <h3 className="text-[14px] font-semibold text-foreground">Run AI Packaging Engine</h3>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold text-muted-dark uppercase tracking-wider">
                Select Order
              </label>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-border2 bg-surface2 px-4 py-3 text-sm text-foreground outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,255,0,.08)] transition-all"
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
              <div className="rounded-xl bg-border/50 px-4 py-3 text-[13px] text-muted flex items-center gap-2">
                <Info className="h-4 w-4" />
                No pending orders. Upload orders or wait for background optimization to complete.
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button onClick={handleOptimize} disabled={!selectedOrder} loading={optLoading} size="lg">
                <Zap className="h-4 w-4" />
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
        <Card gradient className="border-accent/20">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-teal" />
            <h3 className="text-[14px] font-semibold text-foreground">Optimization Complete</h3>
            <Badge variant="success">Saved Rs.{currentResult.savings.toFixed(2)}</Badge>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <Card className="bg-accent/5 border-accent/20 border-l-[4px] border-l-accent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Box className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-dark uppercase tracking-wider font-bold mb-1">Recommended Box</p>
                    <p className="text-[28px] font-black text-accent tracking-tight leading-none mb-2">{currentResult.recommended_box}</p>
                    {currentResult.boxInfo && (
                      <p className="text-[12px] text-muted font-medium">
                        {currentResult.boxInfo.length_cm} × {currentResult.boxInfo.width_cm} × {currentResult.boxInfo.height_cm} cm · Max {currentResult.boxInfo.max_weight_kg}kg
                        {currentResult.boxInfo.supports_fragile && <span className="text-amber-500 font-bold ml-1">· Fragile-safe</span>}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-[3px] border-accent text-accent shadow-[0_0_15px_rgba(200,255,0,0.2)] bg-accent/10">
                    <span className="text-[16px] font-black leading-none">{(currentResult.efficiency_score * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-[10px] text-muted-dark font-bold mt-2 uppercase tracking-wider">Efficiency</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-surface2 border-border">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                  <div className="flex-1 w-full">
                    <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-3">Cost Analysis</p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-muted">Baseline Cost</span>
                        <span className="text-muted line-through">Rs.{currentResult.baseline_cost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[13px] font-semibold">
                        <span className="text-foreground">Optimized Cost</span>
                        <span className="text-foreground">Rs.{currentResult.optimized_cost.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-border my-1"></div>
                      {currentResult.savings > 0 ? (
                        <div className="flex justify-between items-center text-[14px] font-bold text-teal">
                          <span>Total Savings</span>
                          <span>Rs.{currentResult.savings.toFixed(2)}</span>
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

              {currentResult.decision_explanation && (
                <Card className="bg-purple/5 border-purple/10">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-purple mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-purple/80 uppercase tracking-wider font-bold mb-2">Why this box?</p>
                      <p className="text-[13px] text-foreground/80 leading-relaxed font-medium">{currentResult.decision_explanation}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {currentResult.packed_items && currentResult.packed_items.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Rotate3D className="h-4 w-4 text-accent" />
                  <p className="text-[13px] font-semibold text-foreground">3D Packing Visualization</p>
                </div>
                <button
                  onClick={() => toggle3D(selectedOrder)}
                  className="flex items-center gap-1.5 rounded-full bg-accent/10 text-accent px-3 py-1.5 text-[11px] font-semibold hover:bg-accent/20 transition-all"
                >
                  <Rotate3D className="h-3 w-3" />
                  {show3DFor === selectedOrder ? "Hide 3D" : "Show 3D"}
                </button>
              </div>
              {show3DFor === selectedOrder && (
                <ThreeDPackViewer
                  box={{
                    name: currentResult.recommended_box,
                    length_cm: currentResult.boxInfo?.length_cm || 45,
                    width_cm: currentResult.boxInfo?.width_cm || 35,
                    height_cm: currentResult.boxInfo?.height_cm || 25,
                  }}
                  items={currentResult.packed_items.map(item => ({
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
        </Card>
      )}

      {/* Optimization loading */}
      {optLoading && (
        <Card gradient glow>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
              <Zap className="h-6 w-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-5 text-sm text-muted font-medium">Calculating optimal packaging...</p>
            <p className="text-[11px] text-muted-dark mt-1.5">Evaluating all boxes with FFD engine for best fit</p>
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
        <Card gradient>
          <div className="flex items-center gap-2 mb-3">
            <Loader2 className="h-4 w-4 text-accent animate-spin" />
            <span className="text-[13px] font-semibold text-foreground">Background Optimization in Progress</span>
            <Badge variant="warning">{pollingOrderIdsRef.current.size} remaining</Badge>
          </div>
          <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all duration-500 progress-glow"
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
              <Card key={order.id} hover className="group">
                {/* Order Header */}
                <button
                  onClick={() => {
                    if (!optResult) handleViewCompleted(order.id);
                    else toggleExpand(order.id);
                  }}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {optResult?.status === "optimized" ? (
                      <div className="w-8 h-8 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-teal" />
                      </div>
                    ) : optResult?.status === "no_savings" ? (
                      <div className="w-8 h-8 rounded-full bg-orange/10 border border-orange/20 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-orange" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red/10 border border-red/20 flex items-center justify-center">
                        <XCircle className="h-4 w-4 text-red" />
                      </div>
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
                      <div className="text-right hidden sm:block">
                        <div className="text-[11px] text-muted">Box: <span className="text-foreground font-medium">{optResult.recommended_box}</span></div>
                        <div className="text-[11px] text-muted">Efficiency: <span className="text-teal font-medium">{(optResult.efficiency_score * 100).toFixed(0)}%</span></div>
                      </div>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && optResult && (
                  <div className="mt-5 pt-5 border-t border-border/50 space-y-4 animate-fadeInScale">
                    {/* Box Recommendation & Why */}
                    <div className="flex flex-col gap-4">
                      <Card className="bg-accent/5 border-accent/20 border-l-[4px] border-l-accent relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                        <div className="flex items-start justify-between relative z-10">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                              <Box className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-1">Recommended Box</p>
                              <p className="text-[20px] font-black text-accent tracking-tight leading-none mb-1.5">{optResult.recommended_box}</p>
                              {optResult.boxInfo && (
                                <p className="text-[11px] text-muted font-medium">
                                  {optResult.boxInfo.length_cm} × {optResult.boxInfo.width_cm} × {optResult.boxInfo.height_cm} cm · Max {optResult.boxInfo.max_weight_kg}kg
                                  {optResult.boxInfo.supports_fragile && <span className="text-amber-500 font-bold ml-1">· Fragile-safe</span>}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right flex flex-col items-center">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full border-[2px] border-accent text-accent shadow-[0_0_10px_rgba(200,255,0,0.2)] bg-accent/10">
                              <span className="text-[12px] font-black leading-none">{(optResult.efficiency_score * 100).toFixed(0)}%</span>
                            </div>
                            <p className="text-[9px] text-muted-dark font-bold mt-1.5 uppercase tracking-wider">Efficiency</p>
                          </div>
                        </div>
                      </Card>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="bg-surface2 border-border">
                          <div className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-teal mt-0.5 flex-shrink-0" />
                            <div className="flex-1 w-full">
                              <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-3">Cost Analysis</p>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-[12px]">
                                  <span className="text-muted">Baseline Cost</span>
                                  <span className="text-muted line-through">Rs.{optResult.baseline_cost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px] font-semibold">
                                  <span className="text-foreground">Optimized Cost</span>
                                  <span className="text-foreground">Rs.{optResult.optimized_cost.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-border my-1"></div>
                                {optResult.savings > 0 ? (
                                  <div className="flex justify-between items-center text-[13px] font-bold text-teal">
                                    <span>Total Savings</span>
                                    <span>Rs.{optResult.savings.toFixed(2)}</span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center text-[13px] font-bold text-orange">
                                    <span>Best Fit Only</span>
                                    <span>Rs.0.00</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>

                        {optResult.decision_explanation && (
                          <Card className="bg-purple/5 border-purple/10">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-purple mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-[10px] text-purple/80 uppercase tracking-wider font-bold mb-1.5">Why this box?</p>
                                <p className="text-[12px] text-foreground/80 leading-relaxed font-medium">{optResult.decision_explanation}</p>
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>

                    {/* Packing Order */}
                    {optResult.item_order && optResult.item_order.length > 0 && (
                      <Card>
                        <p className="text-[12px] font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4 text-accent" />
                          Packing Order (bottom to top)
                        </p>
                        <div className="space-y-2">
                          {optResult.item_order.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-ink2/50 border border-border/50">
                              <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent flex-shrink-0">
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
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Rotate3D className="h-4 w-4 text-accent" />
                            <p className="text-[13px] font-semibold text-foreground">3D Packing Visualization</p>
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

                {/* Loading state */}
                {!optResult && order.status !== "pending" && (
                  <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 text-accent animate-spin" />
                    <span className="text-[11px] text-muted">Loading optimization details...</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Pending orders list */}
      {statusFilter === "pending" && pendingOrders.length > 0 && !currentResult && !optLoading && (
        <Card>
          <div className="text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            Pending Orders
          </div>
          <div className="space-y-2">
            {pendingOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-3 px-3 rounded-xl bg-ink2/50 border border-border/50 hover:border-border transition-all">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[12px] text-accent font-semibold">#{order.id}</span>
                  <span className="text-[12px] text-muted">{order.shipping_zone}</span>
                  {order.channel && <Badge variant="purple">{order.channel}</Badge>}
                  {order.customer_name && (
                    <span className="text-[11px] text-muted-dark">{order.customer_name}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedOrder(order.id);
                  }}
                  className="text-[11px] text-accent hover:bg-accent/10 px-3 py-1.5 rounded-full transition-all font-semibold"
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
