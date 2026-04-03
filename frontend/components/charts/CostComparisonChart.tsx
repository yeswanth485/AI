"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CostComparisonChartProps {
  data: { order_id: number; baseline: number; optimized: number }[];
}

export default function CostComparisonChart({ data }: CostComparisonChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No cost comparison data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
        <XAxis dataKey="order_id" stroke="#6b7280" fontSize={12} tickFormatter={(v) => `#${v}`} />
        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `₹${v}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111111",
            border: "1px solid #1f1f1f",
            borderRadius: "8px",
            color: "#ededed",
          }}
          formatter={(value: unknown, name: unknown) => [
            formatCurrency(Number(value)),
            name === "baseline" ? "Baseline" : "Optimized",
          ]}
        />
        <Legend
          formatter={(value: string) => (
            <span className="text-xs text-muted">
              {value === "baseline" ? "Baseline Cost" : "Optimized Cost"}
            </span>
          )}
        />
        <Bar dataKey="baseline" fill="#6b7280" radius={[4, 4, 0, 0]} />
        <Bar dataKey="optimized" fill="#22c55e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
