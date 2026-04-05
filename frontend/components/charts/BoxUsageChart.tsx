"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface BoxUsageChartProps {
  data: { box_name: string; count: number }[];
}

const COLORS = ["#c8ff00", "#00d4b8", "#9b7afe", "#ff7043", "#4da6ff", "#ff4444", "#84cc16", "#f59e0b"];

export default function BoxUsageChart({ data }: BoxUsageChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No box usage data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={95}
          paddingAngle={2}
          dataKey="count"
          nameKey="box_name"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a24",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "10px",
            color: "#f2f2f8",
            fontSize: "12px",
          }}
        />
        <Legend
          formatter={(value: string) => <span className="text-[11px] text-muted">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
