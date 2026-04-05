"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EfficiencyDistributionChartProps {
  data: { range: string; count: number }[];
}

export default function EfficiencyDistributionChart({ data }: EfficiencyDistributionChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No efficiency distribution data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
        <XAxis dataKey="range" stroke="#44445a" fontSize={11} />
        <YAxis stroke="#44445a" fontSize={11} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a24",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "10px",
            color: "#f2f2f8",
            fontSize: "12px",
          }}
        />
        <Bar dataKey="count" fill="#9b7afe" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
