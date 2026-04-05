"use client";

import { useEffect, useState } from "react";
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
import { Zap, RotateCcw, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import type { OptimizationResult } from "@/types";

type OptimizedOrder = {
  orderId: number;
  status: "optimizing" | "optimized" | "failed" | "no_savings";
  result: OptimizationResult | null;
};

export default function OptimizationPage() {
  const searchParams = useSearchParams();
  const preselectedOrder = searchParams.get("order");
  const { orders, loading: ordersLoading, refetch } = useOrders({ polling: true, pollingInterval: 3000 });
  const { result, loading: optLoading, error: optError, runOptimization, reset } = useOptimization();
  const { addToast } = useAppContext();
  const [selectedOrder, setSelectedOrder] = useState<number>(
    preselectedOrder ? Number(preselectedOrder) : 0
  );
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [optimizedOrders, setOptimizedOrders] = useState<OptimizedOrder[]>([]);
  const [viewingResult, setViewingResult] = useState<OptimizationResult | null>(null);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "optimized");
  const failedOrders = orders.filter((o) => o.status === "failed");
  const noSavingsOrders = orders.filter((o) => o.status === "no_savings");

  useEffect(() => {
    if (preselectedOrder) {
      setSelectedOrder(Number(preselectedOrder));
    }
  }, [preselectedOrder]);

  // Track orders that are being optimized in background
  useEffect(() => {
    const optimizingIds = new Set(optimizedOrders.filter(o => o.status === "optimizing").map(o => o.orderId));
    const newOptimizing = orders.filter(o => 
      (o.status === "optimized" || o.status === "failed" || o.status === "no_savings") && 
      optimizingIds.has(o.id)
    );

    if (newOptimizing.length > 0) {
      Promise.all(
        newOptimizing.map(async (order) => {
          try {
            const statusData = await getOrderOptimizationStatus(order.id);
            return {
              orderId: order.id,
              status: order.status as OptimizedOrder["status"],
              result: statusData.optimized_cost ? (statusData as OptimizationResult) : null,
            };
          } catch {
            return {
              orderId: order.id,
              status: order.status as OptimizedOrder["status"],
              result: null,
            };
          }
        })
      ).then((results) => {
        setOptimizedOrders((prev) =>
          prev.map((o) => {
            const updated = results.find((r) => r.orderId === o.orderId);
            return updated || o;
          })
        );
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  const handleOptimize = async () => {
    if (!selectedOrder) return;

    // Add to tracking list
    setOptimizedOrders((prev) => [
      ...prev,
      { orderId: selectedOrder, status: "optimizing", result: null },
    ]);

    try {
      const data = await runOptimization(selectedOrder);
      addToast("Optimization complete", "success");
      setOptimizedOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrder
            ? { orderId: selectedOrder, status: "optimized", result: data }
            : o
        )
      );
      setViewingResult(data);
      refetch();
    } catch {
      addToast("Optimization failed", "error");
      setOptimizedOrders((prev) =>
        prev.map((o) =>
          o.orderId === selectedOrder
            ? { orderId: selectedOrder, status: "failed", result: null }
            : o
        )
      );
    }
  };

  const handleReset = () => {
    reset();
    setSelectedOrder(0);
    setViewingResult(null);
  };

  const handleViewCompleted = async (orderId: number) => {
    try {
      const statusData = await getOrderOptimizationStatus(orderId);
      if (statusData.optimized_cost !== undefined) {
        setViewingResult(statusData as OptimizationResult);
      }
    } catch {
      addToast("Failed to load optimization result", "error");
    }
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
          <p className="text-[12px] text-muted-dark mt-0.5">Rule-based FFD engine</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] font-semibold text-muted hover:text-foreground hover:border-border2 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Step Flow */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {[
          { n: 1, label: "Upload CSV / Excel" },
          { n: 2, label: "Configure" },
          { n: 3, label: "Optimize" },
          { n: 4, label: "Results" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all whitespace-nowrap ${
                result || viewingResult
                  ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                  : "bg-accent/10 text-accent border border-accent/25"
              }`}
            >
              {result || viewingResult ? <CheckCircle className="h-3.5 w-3.5" /> : s.n}
              {s.label}
            </div>
            {i < 3 && <div className="flex-1 h-px bg-border mx-2 min-w-[12px]" />}
          </div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "pending", label: "All Pending", count: pendingOrders.length },
          { key: "completed", label: "Completed", count: completedOrders.length },
          { key: "failed", label: "Failed", count: failedOrders.length + noSavingsOrders.length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => { setStatusFilter(f.key); setViewingResult(null); }}
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

      {/* Loading */}
      {optLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-muted">Calculating optimal packaging...</p>
            <p className="text-[11px] text-muted-dark mt-1">Rule-based FFD engine</p>
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

      {/* Viewing a completed optimization result */}
      {viewingResult && !optLoading && (
        <div className="space-y-3">
          <OptimizationResultCard result={viewingResult} />
          <Button variant="ghost" onClick={() => setViewingResult(null)} className="w-full">
            <RotateCcw className="h-3.5 w-3.5" />
            Back to order selection
          </Button>
        </div>
      )}

      {/* Current optimization result */}
      {result && !optLoading && !viewingResult && (
        <OptimizationResultCard result={result} />
      )}

      {/* Order Selection */}
      {!result && !optLoading && !viewingResult && (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold text-muted-dark uppercase tracking-wider">
                Select Order
              </label>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-border2 bg-surface2 px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(200,255,0,.08)] transition-all"
              >
                <option value={0}>Choose an order...</option>
                {statusFilter === "pending" && pendingOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} — {order.shipping_zone} ({order.items?.length || 0} items)
                  </option>
                ))}
                {statusFilter === "completed" && completedOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} — {order.shipping_zone} ✓
                  </option>
                ))}
                {statusFilter === "failed" && [...failedOrders, ...noSavingsOrders].map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} — {order.shipping_zone} {order.status === "no_savings" ? "(no savings)" : "✗"}
                  </option>
                ))}
              </select>
            </div>

            {pendingOrders.length === 0 && statusFilter === "pending" && (
              <div className="rounded-xl bg-border/50 px-4 py-3 text-[13px] text-muted">
                No pending orders available. Upload orders first.
              </div>
            )}

            <div className="flex items-center gap-2.5 pt-2">
              <Button
                onClick={handleOptimize}
                disabled={!selectedOrder}
                loading={optLoading}
              >
                <Zap className="h-3.5 w-3.5" />
                Run AI packaging engine
              </Button>
              {result && (
                <Button variant="ghost" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Currently Optimizing (live tracking) */}
      {optimizedOrders.filter(o => o.status === "optimizing").length > 0 && (
        <Card>
          <div className="text-[13px] font-semibold text-foreground mb-3 flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-accent animate-spin" />
            Currently Optimizing
          </div>
          <div className="space-y-2">
            {optimizedOrders.filter(o => o.status === "optimizing").map((o) => (
              <div key={o.orderId} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-accent animate-spin" />
                  <span className="font-mono text-[12px] text-accent">#{o.orderId}</span>
                </div>
                <Badge variant="warning">optimizing...</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Completed Orders List */}
      {statusFilter === "completed" && completedOrders.length > 0 && (
        <Card>
          <div className="text-[13px] font-semibold text-foreground mb-3">Completed Optimizations</div>
          <div className="space-y-2">
            {completedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent-green" />
                  <span className="font-mono text-[12px] text-accent">#{order.id}</span>
                  <span className="text-[12px] text-muted">{order.shipping_zone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">optimized</Badge>
                  <button
                    onClick={() => handleViewCompleted(order.id)}
                    className="text-[11px] text-accent hover:underline font-semibold"
                  >
                    View result →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Failed Orders List */}
      {statusFilter === "failed" && (failedOrders.length > 0 || noSavingsOrders.length > 0) && (
        <Card>
          <div className="text-[13px] font-semibold text-foreground mb-3">Failed / No Savings</div>
          <div className="space-y-2">
            {failedOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-accent-red">#{order.id}</span>
                  <span className="text-[12px] text-muted">{order.shipping_zone}</span>
                </div>
                <Badge variant="danger">failed</Badge>
              </div>
            ))}
            {noSavingsOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] text-accent-orange">#{order.id}</span>
                  <span className="text-[12px] text-muted">{order.shipping_zone}</span>
                </div>
                <Badge variant="warning">no savings</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
