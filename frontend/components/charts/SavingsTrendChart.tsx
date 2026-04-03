"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface SavingsTrendChartProps {
  data: { date: string; savings: number }[];
}

export default function SavingsTrendChart({ data }: SavingsTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No savings trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `₹${v}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111111",
            border: "1px solid #1f1f1f",
            borderRadius: "8px",
            color: "#ededed",
          }}
          formatter={(value: unknown) => [formatCurrency(Number(value)), "Savings"]}
        />
        <Line
          type="monotone"
          dataKey="savings"
          stroke="#22c55e"
          strokeWidth={2}
          dot={{ fill: "#22c55e", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
