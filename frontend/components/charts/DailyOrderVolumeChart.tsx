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

interface DailyOrderVolumeChartProps {
  data: { date: string; count: number }[];
}

export default function DailyOrderVolumeChart({ data }: DailyOrderVolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No daily order volume data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
        <XAxis dataKey="date" stroke="#44445a" fontSize={11} />
        <YAxis stroke="#44445a" fontSize={11} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a24",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "10px",
            color: "#f2f2f8",
            fontSize: "12px",
          }}
          formatter={(value: unknown) => [`${value} orders`, "Volume"]}
        />
        <Bar dataKey="count" fill="#c8ff00" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
