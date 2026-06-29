"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyLog, FoodSource } from "@/lib/types";
import { calcCaloriesTotal } from "@/lib/calculations";

interface ChartCaloriesProps {
  logs: DailyLog[];
  sources: FoodSource[];
  goal: number;
}

export default function ChartCalories({ logs, sources, goal }: ChartCaloriesProps) {
  if (logs.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-muted">
        No data yet
      </div>
    );
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 13);

  const data = logs
    .filter((l) => new Date(l.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({
      date: l.date.slice(5),
      cal: Math.round(calcCaloriesTotal(l.entries, sources)),
    }));

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="calGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E8A838" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#E8A838" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#252540" />
        <XAxis dataKey="date" tick={{ fill: "#888888", fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: "#888888", fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ background: "#1a1a2e", border: "1px solid #252540", borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: "#888888" }}
          itemStyle={{ color: "#E8A838" }}
          formatter={(v) => [`${v} cal`, "Calories"]}
        />
        <ReferenceLine y={goal} stroke="#E8A838" strokeDasharray="4 4" strokeOpacity={0.5} />
        <Area
          type="monotone"
          dataKey="cal"
          stroke="#E8A838"
          strokeWidth={2}
          fill="url(#calGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#E8A838" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
