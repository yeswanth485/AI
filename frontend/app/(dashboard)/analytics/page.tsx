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
import { DollarSign, RefreshCw, Zap, Target, Layers, TrendingUp, Package, BarChart3 } from "lucide-react";

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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-foreground tracking-tight">Analytics</h2>
          <p className="text-[12px] text-muted-dark mt-1">Comprehensive packaging performance metrics</p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-[12px] font-semibold text-muted hover:text-foreground hover:border-border2 transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Hero Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card hover gradient className="group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-teal" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Total cost saved</span>
          </div>
          <div className="font-display text-[36px] font-black text-accent tracking-[-1.5px] leading-none">
            {formatCurrency(analytics.total_savings)}
          </div>
          <div className="text-[11px] text-muted mt-1.5">vs baseline packaging</div>
        </Card>
        <Card hover gradient className="group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal to-purple" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-teal/10 border border-teal/20 flex items-center justify-center">
              <Target className="h-4 w-4 text-teal" />
            </div>
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Avg space efficiency</span>
          </div>
          <div className="font-display text-[36px] font-black text-teal tracking-[-1.5px] leading-none">
            {formatPercentage(analytics.avg_efficiency)}
          </div>
          <div className="text-[11px] text-muted mt-1.5">space utilization per box</div>
        </Card>
        <Card hover gradient className="group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple to-blue" />
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple/10 border border-purple/20 flex items-center justify-center">
              <Package className="h-4 w-4 text-purple" />
            </div>
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Orders processed</span>
          </div>
          <div className="font-display text-[36px] font-black text-purple tracking-[-1.5px] leading-none">
            {analytics.total_orders}
          </div>
          <div className="text-[11px] text-muted mt-1.5">total optimized</div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card hover>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-3.5 w-3.5 text-accent" />
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Avg savings/order</span>
          </div>
          <div className="font-display text-xl font-black text-foreground tracking-tight">
            {formatCurrency(analytics.avg_savings_per_order)}
          </div>
          <div className="text-[10px] text-muted mt-0.5">real rupees saved per order</div>
        </Card>
        <Card hover>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3.5 w-3.5 text-teal" />
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Engine status</span>
          </div>
          <div className="font-display text-xl font-black text-teal tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal animate-pulse-custom" />
            Ready
          </div>
          <div className="text-[10px] text-muted mt-0.5">5-model ML + FFD</div>
        </Card>
        <Card hover>
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-3.5 w-3.5 text-purple" />
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Avg waste</span>
          </div>
          <div className="font-display text-xl font-black text-foreground tracking-tight">
            {formatPercentage(1 - analytics.avg_efficiency)}
          </div>
          <div className="text-[10px] text-muted mt-0.5">per order</div>
        </Card>
        <Card hover>
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-3.5 w-3.5 text-orange" />
            <span className="text-[10px] text-muted-dark uppercase tracking-wider font-bold">Total profit</span>
          </div>
          <div className="font-display text-xl font-black text-foreground tracking-tight">
            {formatCurrency(analytics.total_profit)}
          </div>
          <div className="text-[10px] text-muted mt-0.5">cumulative</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card hover>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-teal" />
              <div className="text-[13px] font-semibold text-foreground">Savings trend</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Cumulative savings per order</div>
          </div>
          <SavingsTrendChart data={analytics.savings_trend} />
        </Card>
        <Card hover>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple" />
              <div className="text-[13px] font-semibold text-foreground">Daily order volume</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Last 14 days — live</div>
          </div>
          <DailyOrderVolumeChart data={uniqueDailyVolume} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card hover>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" />
              <div className="text-[13px] font-semibold text-foreground">Cost comparison</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Baseline vs optimized per order</div>
          </div>
          <CostComparisonChart data={analytics.cost_comparison} />
        </Card>
        <Card hover>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange" />
              <div className="text-[13px] font-semibold text-foreground">Cost breakdown</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Shipping vs box material</div>
          </div>
          <CostBreakdownChart data={costBreakdown} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card hover>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple" />
              <div className="text-[13px] font-semibold text-foreground">Box usage by type</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Which boxes are selected most</div>
          </div>
          <BoxUsageChart data={analytics.box_usage} />
        </Card>
        <Card hover>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-teal" />
              <div className="text-[13px] font-semibold text-foreground">Efficiency distribution</div>
            </div>
            <div className="text-[10px] text-muted-dark mt-0.5">Space utilization histogram</div>
          </div>
          <EfficiencyDistributionChart data={efficiencyDistribution} />
        </Card>
      </div>

      <Card hover>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <div className="text-[13px] font-semibold text-foreground">Efficiency trend</div>
          </div>
          <div className="text-[10px] text-muted-dark mt-0.5">Per order — live</div>
        </div>
        <EfficiencyTrendChart data={efficiencyData} />
      </Card>
    </div>
  );
}
