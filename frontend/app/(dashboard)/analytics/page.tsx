"use client";

import { useEffect, useState } from "react";
import { getAnalytics } from "@/services/analytics.service";
import type { AnalyticsSummary } from "@/types";
import Card from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";
import EmptyState from "@/components/ui/EmptyState";
import SavingsTrendChart from "@/components/charts/SavingsTrendChart";
import BoxUsageChart from "@/components/charts/BoxUsageChart";
import EfficiencyTrendChart from "@/components/charts/EfficiencyTrendChart";
import CostComparisonChart from "@/components/charts/CostComparisonChart";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingUp, DollarSign, Gauge, BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load analytics";
      setError(msg);
    } finally {
      setLoading(false);
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
        title="Failed to load analytics"
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
    return <EmptyState title="No analytics data" description="Run some optimizations first" />;
  }

  const efficiencyData = analytics.cost_comparison.map((c) => ({
    order_id: c.order_id,
    efficiency: c.optimized > 0 ? c.optimized / c.baseline : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
              <BarChart3 className="h-5 w-5 text-accent" />
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

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Savings Trend</h3>
        <SavingsTrendChart data={analytics.savings_trend} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Cost Comparison</h3>
          <CostComparisonChart data={analytics.cost_comparison} />
        </Card>
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-foreground">Box Usage</h3>
          <BoxUsageChart data={analytics.box_usage} />
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 text-sm font-semibold text-foreground">Efficiency Trend</h3>
        <EfficiencyTrendChart data={efficiencyData} />
      </Card>
    </div>
  );
}
