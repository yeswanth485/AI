"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Card from "@/components/ui/Card";

interface ProfitTrendChartProps {
  data: { date: string; profit: number }[];
}

export default function ProfitTrendChart({ data }: ProfitTrendChartProps) {
  return (
    <Card>
      <h3 className="mb-4 text-[13px] font-semibold text-foreground">Profit Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#c8ff00"
            strokeWidth={2}
            dot={{ fill: "#c8ff00", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
