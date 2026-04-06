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
import { TrendingUp, Package, DollarSign, Gauge, RefreshCw, Zap, ArrowUpRight, Clock } from "lucide-react";

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
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
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

  const pendingCount = recentOrders.filter(o => o.status === "pending").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-foreground tracking-tight">Overview</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-custom" />
            <p className="text-[12px] text-muted-dark">Real-time packaging performance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] font-semibold text-muted hover:text-foreground hover:border-border2 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => router.push("/optimization")}
            className="btn-primary flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-ink hover:bg-[#d8ff20] hover:shadow-[0_4px_20px_rgba(200,255,0,.25)] transition-all"
          >
            <Zap className="h-3.5 w-3.5" />
            Optimize
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover gradient className="group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:bg-accent/10 transition-all" />
          <div className="flex items-center justify-between mb-4 relative">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <Badge variant="warning">{pendingCount} pending</Badge>
          </div>
          <div className="font-display text-[28px] font-black tracking-tight leading-none relative z-10">
            {analytics.total_orders}
          </div>
          <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5 relative z-10">Orders optimized</div>
        </Card>

        <Card hover gradient className="group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal/10 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:bg-teal/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-teal" />
            </div>
            <Badge variant="success">Today</Badge>
          </div>
          <div className="font-display text-[28px] font-black tracking-tight leading-none text-teal relative z-10">
            {formatCurrency(analytics.today_savings)}
          </div>
          <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5 relative z-10">Today&apos;s Savings</div>
        </Card>

        <Card hover gradient className="group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple/5 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:bg-purple/10 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-purple/10 border border-purple/20 flex items-center justify-center">
              <Gauge className="h-5 w-5 text-purple" />
            </div>
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
              ↑5%
            </span>
          </div>
          <div className="font-display text-[28px] font-black tracking-tight leading-none text-purple relative z-10">
            {formatPercentage(analytics.avg_efficiency)}
          </div>
          <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5 relative z-10">Avg efficiency</div>
        </Card>

        <Card hover gradient className="group overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue/5 rounded-full blur-2xl -translate-y-6 translate-x-6 group-hover:bg-blue/10 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-blue/10 border border-blue/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-blue" />
            </div>
          </div>
          <div className="font-display text-[28px] font-black tracking-tight leading-none text-blue relative z-10">
            {formatCurrency(analytics.total_savings)}
          </div>
          <div className="text-[10px] text-muted-dark uppercase tracking-wider mt-1.5 relative z-10">Total Savings (est.)</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card hover>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal" />
              <div className="text-[13px] font-semibold text-foreground">Efficiency trend</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Per order — live</div>
          </div>
          <SavingsTrendChart data={analytics.savings_trend} />
        </Card>
        <Card hover>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple" />
              <div className="text-[13px] font-semibold text-foreground">Box distribution</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Usage share</div>
          </div>
          <BoxUsageChart data={analytics.box_usage} />
        </Card>
      </div>

      {/* Recent Orders */}
      <Card hover>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              <div className="text-[13px] font-semibold text-foreground">Orders processed</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Last 14 days — live from API</div>
          </div>
          <button
            onClick={() => router.push("/orders")}
            className="text-[11px] text-accent hover:underline font-semibold flex items-center gap-1"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Order</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Zone</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-[10px] font-bold text-muted-dark uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 table-row-hover transition-colors">
                    <td className="py-3 font-mono text-[12px] text-accent">#{order.id}</td>
                    <td className="py-3 text-foreground">{order.shipping_zone}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant[order.status] || "default"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-muted text-[12px]">{formatDate(order.created_at)}</td>
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
