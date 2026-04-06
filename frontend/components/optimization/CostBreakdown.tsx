"use client";

import { ArrowRight, TrendingDown } from "lucide-react";

interface CostBreakdownProps {
  baseline: number;
  optimized: number;
  savings: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function CostBreakdown({
  baseline,
  optimized,
  savings,
  size = "md",
  showLabel = true,
}: CostBreakdownProps) {
  const savingsPct = baseline > 0 ? ((savings / baseline) * 100).toFixed(1) : "0.0";

  const baselineSize = {
    sm: "text-[11px]",
    md: "text-[13px]",
    lg: "text-[15px]",
  }[size];

  const optimizedSize = {
    sm: "text-[14px]",
    md: "text-[18px]",
    lg: "text-[24px]",
  }[size];

  const savingsSize = {
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-[13px]",
  }[size];

  return (
    <div className="flex flex-col gap-1">
      {showLabel && (
        <p className="text-[10px] text-muted-dark uppercase tracking-wider font-bold mb-1">
          Cost Breakdown
        </p>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`${baselineSize} text-muted line-through`}>
          ₹{baseline.toFixed(2)}
        </span>
        <ArrowRight className="h-3 w-3 text-muted flex-shrink-0" />
        <span className={`${optimizedSize} font-bold text-teal`}>
          ₹{optimized.toFixed(2)}
        </span>
      </div>
      {savings > 0 && (
        <div className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3 text-teal" />
          <span className={`${savingsSize} text-teal font-semibold`}>
            Save ₹{savings.toFixed(2)} ({savingsPct}%)
          </span>
        </div>
      )}
    </div>
  );
}
