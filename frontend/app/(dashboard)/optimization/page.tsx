"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useOrders } from "@/hooks/useOrders";
import { useOptimization } from "@/hooks/useOptimization";
import OptimizationResultCard from "@/components/optimization/OptimizationResult";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";
import { useAppContext } from "@/context/AppContext";
import { Zap, RotateCcw } from "lucide-react";

export default function OptimizationPage() {
  const searchParams = useSearchParams();
  const preselectedOrder = searchParams.get("order");
  const { orders, loading: ordersLoading, refetch } = useOrders();
  const { result, loading: optLoading, error: optError, runOptimization, reset } = useOptimization();
  const { addToast } = useAppContext();
  const [selectedOrder, setSelectedOrder] = useState<number>(
    preselectedOrder ? Number(preselectedOrder) : 0
  );

  const pendingOrders = orders.filter((o) => o.status === "pending");

  useEffect(() => {
    if (preselectedOrder) {
      setSelectedOrder(Number(preselectedOrder));
    }
  }, [preselectedOrder]);

  const handleOptimize = async () => {
    if (!selectedOrder) return;
    try {
      await runOptimization(selectedOrder);
      addToast("Optimization complete", "success");
      refetch();
    } catch {
      addToast("Optimization failed", "error");
    }
  };

  const handleReset = () => {
    reset();
    setSelectedOrder(0);
  };

  if (ordersLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Packaging Optimization</h2>
        <p className="text-sm text-muted">Select an order and run the optimization engine</p>
      </div>

      {optLoading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-sm text-muted">Calculating optimal packaging...</p>
          </div>
        </Card>
      )}

      {optError && (
        <EmptyState
          title="Optimization Failed"
          description={optError}
          action={
            <Button onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Try Again
            </Button>
          }
        />
      )}

      {result && !optLoading && (
        <OptimizationResultCard result={result} />
      )}

      {!result && !optLoading && (
        <Card>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-muted">
                Select Order
              </label>
              <select
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent"
              >
                <option value={0}>Choose a pending order...</option>
                {pendingOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    Order #{order.id} — {order.shipping_zone} ({order.items?.length || 0} items)
                  </option>
                ))}
              </select>
            </div>

            {pendingOrders.length === 0 && (
              <div className="rounded-lg bg-border/50 px-4 py-3 text-sm text-muted">
                No pending orders available. Create an order first.
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleOptimize}
                disabled={!selectedOrder}
                loading={optLoading}
              >
                <Zap className="h-4 w-4" />
                Run Optimization
              </Button>
              {result && (
                <Button variant="ghost" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
