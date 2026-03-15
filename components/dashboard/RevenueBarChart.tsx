"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface WeekRevenue {
  week: string;
  revenue: number;
  target: number;
}

interface RevenueBarChartProps {
  data: WeekRevenue[];
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Revenue Trend (Weekly)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="target" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
          Actual
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-2.5 h-2.5 rounded-sm bg-indigo-100 inline-block" />
          Target
        </div>
      </div>
    </div>
  );
}
