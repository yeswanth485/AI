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

interface CostBreakdownChartProps {
  data: { order_id: number; shipping: number; box_cost: number }[];
}

export default function CostBreakdownChart({ data }: CostBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted">
        No cost breakdown data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
        <XAxis dataKey="order_id" stroke="#44445a" fontSize={11} tickFormatter={(v) => `#${v}`} />
        <YAxis stroke="#44445a" fontSize={11} tickFormatter={(v) => `₹${v}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a24",
            border: "1px solid rgba(255,255,255,.12)",
            borderRadius: "10px",
            color: "#f2f2f8",
            fontSize: "12px",
          }}
          formatter={(value: unknown, name: unknown) => [
            formatCurrency(Number(value)),
            name === "shipping" ? "Shipping Cost" : "Box Material",
          ]}
        />
        <Legend
          formatter={(value: string) => (
            <span className="text-[11px] text-muted">
              {value === "shipping" ? "Shipping" : "Box Material"}
            </span>
          )}
        />
        <Bar dataKey="shipping" fill="#00d4b8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="box_cost" fill="#c8ff00" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
