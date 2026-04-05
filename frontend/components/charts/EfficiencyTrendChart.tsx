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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
        <XAxis dataKey="order_id" stroke="#44445a" fontSize={11} />
        <YAxis stroke="#44445a" fontSize={11} domain={[0, 1]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a24",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "10px",
            color: "#f2f2f8",
            fontSize: "12px",
          }}
          formatter={(value: unknown) => [`${(Number(value) * 100).toFixed(1)}%`, "Efficiency"]}
        />
        <Line
          type="monotone"
          dataKey="efficiency"
          stroke="#00d4b8"
          strokeWidth={2}
          dot={{ fill: "#00d4b8", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
