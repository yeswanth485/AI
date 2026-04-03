"use client";

import { OptimizationResult } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { CheckCircle, TrendingUp, Box, Info } from "lucide-react";

interface OptimizationResultProps {
  result: OptimizationResult;
}

export default function OptimizationResultCard({ result }: OptimizationResultProps) {
  const savingsPercent =
    result.baseline_cost > 0
      ? ((result.baseline_cost - result.optimized_cost) / result.baseline_cost) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-accent-green" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Optimization Complete</h3>
          <p className="text-sm text-muted">Order #{result.order_id}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={result.savings > 0 ? "success" : "info"}>
            {result.savings > 0 ? "optimized" : "no_savings"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <p className="text-xs text-muted">Recommended Box</p>
          <div className="mt-1 flex items-center gap-2">
            <Box className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">{result.recommended_box}</p>
          </div>
        </Card>
        <Card>
          <p className="text-xs text-muted">Baseline Cost</p>
          <p className="mt-1 text-sm font-semibold text-muted">{formatCurrency(result.baseline_cost)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Optimized Cost</p>
          <p className="mt-1 text-sm font-semibold text-accent-green">{formatCurrency(result.optimized_cost)}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Savings</p>
          <p className="mt-1 text-sm font-semibold text-accent-green">
            {formatCurrency(result.savings)}
            <span className="ml-1 text-xs text-muted">({savingsPercent.toFixed(1)}%)</span>
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          <p className="text-sm font-medium text-foreground">Efficiency Score</p>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent-green transition-all duration-500"
            style={{ width: `${result.efficiency_score * 100}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-muted">{formatPercentage(result.efficiency_score)}</p>
      </Card>

      <Card className="border-l-4 border-l-accent">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
          <div>
            <p className="text-sm font-medium text-foreground">Decision Explanation</p>
            <p className="mt-1 text-sm text-muted leading-relaxed">{result.decision_explanation}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
