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

interface EfficiencyTrendChartProps {
  data: { order_id: number; efficiency: number }[];
}

export default function EfficiencyTrendChart({ data }: EfficiencyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No efficiency trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
        <XAxis dataKey="order_id" stroke="#6b7280" fontSize={12} />
        <YAxis stroke="#6b7280" fontSize={12} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#111111",
            border: "1px solid #1f1f1f",
            borderRadius: "8px",
            color: "#ededed",
          }}
          formatter={(value: unknown) => [`${(Number(value) * 100).toFixed(1)}%`, "Efficiency"]}
        />
        <Line
          type="monotone"
          dataKey="efficiency"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
