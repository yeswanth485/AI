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
import CostBreakdownChart from "@/components/charts/CostBreakdownChart";
import EfficiencyDistributionChart from "@/components/charts/EfficiencyDistributionChart";
import DailyOrderVolumeChart from "@/components/charts/DailyOrderVolumeChart";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { DollarSign, RefreshCw, Zap, Target, Layers } from "lucide-react";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load analytics";
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

  const efficiencyDistribution = [
    { range: "0-20%", count: efficiencyData.filter((e) => e.efficiency <= 0.2).length },
    { range: "20-40%", count: efficiencyData.filter((e) => e.efficiency > 0.2 && e.efficiency <= 0.4).length },
    { range: "40-60%", count: efficiencyData.filter((e) => e.efficiency > 0.4 && e.efficiency <= 0.6).length },
    { range: "60-80%", count: efficiencyData.filter((e) => e.efficiency > 0.6 && e.efficiency <= 0.8).length },
    { range: "80-100%", count: efficiencyData.filter((e) => e.efficiency > 0.8).length },
  ];

  const dailyVolume = analytics.savings_trend.map((s) => ({
    date: s.date,
    count: analytics.savings_trend.filter((st) => st.date === s.date).length,
  }));

  const seenDates = new Set<string>();
  const uniqueDailyVolume = dailyVolume.filter((d) => {
    if (seenDates.has(d.date)) return false;
    seenDates.add(d.date);
    return true;
  });

  const costBreakdown = analytics.cost_comparison.map((c) => ({
    order_id: c.order_id,
    shipping: c.optimized,
    box_cost: 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-black text-foreground tracking-tight">Analytics</h2>
          <p className="text-[12px] text-muted-dark mt-0.5">Comprehensive packaging performance metrics</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] font-semibold text-muted hover:text-foreground hover:border-border2 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Hero Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card hover className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-accent-green" />
          <div className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">Total cost saved</div>
          <div className="font-display text-[32px] font-black text-accent tracking-[-1.5px] leading-none">
            {formatCurrency(analytics.total_savings)}
          </div>
          <div className="text-[11px] text-muted mt-1">vs baseline packaging</div>
        </Card>
        <Card hover className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-green to-accent-purple" />
          <div className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">Avg space efficiency</div>
          <div className="font-display text-[32px] font-black text-accent-green tracking-[-1.5px] leading-none">
            {formatPercentage(analytics.avg_efficiency)}
          </div>
          <div className="text-[11px] text-muted mt-1">space utilization per box</div>
        </Card>
        <Card hover className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-purple to-accent-orange" />
          <div className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-2">Orders processed</div>
          <div className="font-display text-[32px] font-black text-accent-purple tracking-[-1.5px] leading-none">
            {analytics.total_orders}
          </div>
          <div className="text-[11px] text-muted mt-1">total optimized</div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-3.5 w-3.5 text-accent" />
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Avg savings/order</span>
          </div>
          <div className="font-display text-xl font-black text-foreground tracking-tight">
            {formatCurrency(analytics.avg_savings_per_order)}
          </div>
          <div className="text-[10px] text-muted mt-0.5">real rupees saved per order</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3.5 w-3.5 text-accent-green" />
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Engine status</span>
          </div>
          <div className="font-display text-xl font-black text-accent-green tracking-tight">Ready</div>
          <div className="text-[10px] text-muted mt-0.5">5-model ML + FFD</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-accent-purple" />
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Avg waste</span>
          </div>
          <div className="font-display text-xl font-black text-foreground tracking-tight">
            {formatPercentage(1 - analytics.avg_efficiency)}
          </div>
          <div className="text-[10px] text-muted mt-0.5">per order</div>
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-3.5 w-3.5 text-accent-orange" />
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Total profit</span>
          </div>
          <div className="font-display text-xl font-black text-foreground tracking-tight">
            {formatCurrency(analytics.total_profit)}
          </div>
          <div className="text-[10px] text-muted mt-0.5">cumulative</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="mb-3">
            <div className="text-[13px] font-semibold text-foreground">Savings trend</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Cumulative savings per order</div>
          </div>
          <SavingsTrendChart data={analytics.savings_trend} />
        </Card>
        <Card>
          <div className="mb-3">
            <div className="text-[13px] font-semibold text-foreground">Daily order volume</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Last 14 days — live</div>
          </div>
          <DailyOrderVolumeChart data={uniqueDailyVolume} />
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="mb-3">
            <div className="text-[13px] font-semibold text-foreground">Cost comparison</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Baseline vs optimized per order</div>
          </div>
          <CostComparisonChart data={analytics.cost_comparison} />
        </Card>
        <Card>
          <div className="mb-3">
            <div className="text-[13px] font-semibold text-foreground">Cost breakdown</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Shipping vs box material</div>
          </div>
          <CostBreakdownChart data={costBreakdown} />
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="mb-3">
            <div className="text-[13px] font-semibold text-foreground">Box usage by type</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Which boxes are selected most</div>
          </div>
          <BoxUsageChart data={analytics.box_usage} />
        </Card>
        <Card>
          <div className="mb-3">
            <div className="text-[13px] font-semibold text-foreground">Efficiency distribution</div>
            <div className="text-[10px] text-muted-dark mt-0.5">Space utilization histogram</div>
          </div>
          <EfficiencyDistributionChart data={efficiencyDistribution} />
        </Card>
      </div>

      <Card>
        <div className="mb-3">
          <div className="text-[13px] font-semibold text-foreground">Efficiency trend</div>
          <div className="text-[10px] text-muted-dark mt-0.5">Per order — live</div>
        </div>
        <EfficiencyTrendChart data={efficiencyData} />
      </Card>
    </div>
  );
}
