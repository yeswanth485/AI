"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAnalytics } from "@/services/analytics.service";
import { getOrders } from "@/services/orders.service";
import type { AnalyticsSummary, Order } from "@/types";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import SavingsTrendChart from "@/components/charts/SavingsTrendChart";
import BoxUsageChart from "@/components/charts/BoxUsageChart";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { TrendingUp, Package, DollarSign, Gauge, RefreshCw, Zap } from "lucide-react";

const statusVariant: Record<string, "warning" | "success" | "danger" | "info" | "purple"> = {
  pending: "warning",
  optimized: "success",
  failed: "danger",
  no_savings: "info",
};

export default function DashboardPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const [analyticsData, ordersData] = await Promise.all([
        getAnalytics(),
        getOrders(),
      ]);
      setAnalytics(analyticsData);
      setRecentOrders(ordersData.slice(-10).reverse());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description={error}
        action={
          <button onClick={fetchData} className="text-sm text-accent hover:underline">
            Retry
          </button>
        }
      />
    );
  }

  if (!analytics) {
    return (
      <EmptyState
        title="No data available"
        description="Connect the backend to see analytics"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black text-foreground tracking-tight">Overview</h2>
          <p className="text-[12px] text-muted-dark mt-0.5">Real-time packaging performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] font-semibold text-muted hover:text-foreground hover:border-border2 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => router.push("/optimization")}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-[12px] font-semibold text-ink hover:bg-[#d8ff20] transition-all"
          >
            <Zap className="h-3.5 w-3.5" />
            Optimize
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg border border-border flex items-center justify-center">
              <Package className="h-4 w-4 text-accent" />
            </div>
          </div>
          <div className="font-display text-[24px] font-black tracking-tight leading-none">
            {analytics.total_orders}
          </div>
          <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Orders optimized</div>
        </Card>
        <Card hover>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg border border-border flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-accent-green" />
            </div>
            <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full">
              ↑28%
            </span>
          </div>
          <div className="font-display text-[24px] font-black tracking-tight leading-none text-accent-green">
            {formatCurrency(analytics.total_savings)}
          </div>
          <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Cost saved (est.)</div>
        </Card>
        <Card hover>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg border border-border flex items-center justify-center">
              <Gauge className="h-4 w-4 text-accent-green" />
            </div>
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              ↑5%
            </span>
          </div>
          <div className="font-display text-[24px] font-black tracking-tight leading-none">
            {formatPercentage(analytics.avg_efficiency)}
          </div>
          <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Avg efficiency</div>
        </Card>
        <Card hover>
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg border border-border flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-accent-purple" />
            </div>
            <span className="text-[10px] font-bold text-muted-dark bg-surface2 px-2 py-0.5 rounded-full">
              per order
            </span>
          </div>
          <div className="font-display text-[24px] font-black tracking-tight leading-none">
            {formatCurrency(analytics.avg_savings_per_order)}
          </div>
          <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1">Avg savings / order</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="mb-3">
            <div className="text-[13px] font-semibold text-foreground">Efficiency trend</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Per order — live</div>
          </div>
          <SavingsTrendChart data={analytics.savings_trend} />
        </Card>
        <Card>
          <div className="mb-3">
            <div className="text-[13px] font-semibold text-foreground">Box distribution</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Usage share</div>
          </div>
          <BoxUsageChart data={analytics.box_usage} />
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-foreground">Orders processed</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Last 14 days — live from API</div>
          </div>
          <button
            onClick={() => router.push("/orders")}
            className="text-[11px] text-accent hover:underline font-semibold"
          >
            View all →
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Order</th>
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Zone</th>
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Status</th>
                  <th className="pb-2 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-white/[.015] transition-colors">
                    <td className="py-2.5 font-mono text-[12px] text-accent">#{order.id}</td>
                    <td className="py-2.5 text-foreground">{order.shipping_zone}</td>
                    <td className="py-2.5">
                      <Badge variant={statusVariant[order.status] || "default"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-muted">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
