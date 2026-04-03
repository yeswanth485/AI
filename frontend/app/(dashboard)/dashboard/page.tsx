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
import { TrendingUp, Package, DollarSign, Gauge } from "lucide-react";

const statusVariant: Record<string, "warning" | "success" | "danger" | "info"> = {
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

  const fetchData = async () => {
    try {
      setError(null);
      const [analyticsData, ordersData] = await Promise.all([
        getAnalytics(),
        getOrders(),
      ]);
      setAnalytics(analyticsData);
      setRecentOrders(ordersData.slice(-5).reverse());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(msg);
    } finally {
      setLoading(false);
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
    return <EmptyState title="No data available" description="Connect the backend to see analytics" />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Total Orders</p>
              <p className="text-xl font-bold text-foreground">{analytics.total_orders}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/15">
              <DollarSign className="h-5 w-5 text-accent-green" />
            </div>
            <div>
              <p className="text-xs text-muted">Total Savings</p>
              <p className="text-xl font-bold text-accent-green">{formatCurrency(analytics.total_savings)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted">Avg Savings / Order</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(analytics.avg_savings_per_order)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-green/15">
              <Gauge className="h-5 w-5 text-accent-green" />
            </div>
            <div>
              <p className="text-xs text-muted">Avg Efficiency</p>
              <p className="text-xl font-bold text-foreground">
                {formatPercentage(analytics.avg_efficiency)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Savings Trend</h3>
          <SavingsTrendChart data={analytics.savings_trend} />
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Box Usage</h3>
          <BoxUsageChart data={analytics.box_usage} />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Recent Orders</h3>
          <button
            onClick={() => router.push("/orders")}
            className="text-xs text-accent hover:underline"
          >
            View all
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 font-medium text-muted">Order</th>
                  <th className="pb-2 font-medium text-muted">Zone</th>
                  <th className="pb-2 font-medium text-muted">Status</th>
                  <th className="pb-2 font-medium text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50">
                    <td className="py-2.5 font-mono text-xs text-accent">#{order.id}</td>
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
