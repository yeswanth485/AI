"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProfitTrendChartProps {
  data: { date: string; profit: number }[];
}

export default function ProfitTrendChart({ data }: ProfitTrendChartProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Profit Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: "#10B981" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}