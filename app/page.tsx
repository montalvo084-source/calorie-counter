"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useFoodSources } from "@/lib/food-sources-context";
import ChartCalories from "@/components/ChartCalories";
import {
  calcAvgCalories,
  calcCaloriesTotal,
  calcProteinTotal,
  calcFiberTotal,
  calcWaterFromFood,
  calcStreak,
  todayStr,
  formatDisplayDate,
} from "@/lib/calculations";
import type { DailyLog, Profile } from "@/lib/types";

export default function Dashboard() {
  const { sources, loaded } = useFoodSources();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    async function load() {
      const [logsRes, profileRes] = await Promise.all([
        fetch("/api/logs"),
        fetch("/api/profile"),
      ]);
      setLogs(await logsRes.json());
      setProfile(await profileRes.json());
      setFetching(false);
    }
    load();
  }, []);

  const today = todayStr();
  const todayLog = logs.find((l) => l.date === today);

  const calorieGoal = profile?.calorieGoal ?? 2000;
  const proteinGoal = profile?.proteinGoal ?? 150;
  const fiberGoal = profile?.fiberGoal ?? 25;
  const waterGoal = profile?.waterGoal ?? 8;

  const totalCal = todayLog ? calcCaloriesTotal(todayLog.entries, sources) : 0;
  const totalPro = todayLog ? calcProteinTotal(todayLog.entries, sources) : 0;
  const totalFib = todayLog ? calcFiberTotal(todayLog.entries, sources) : 0;
  const totalWater = (todayLog?.waterGlasses ?? 0) + (todayLog ? calcWaterFromFood(todayLog.entries, sources) : 0);

  const streak = calcStreak(logs);
  const avg = calcAvgCalories(logs, sources);

  const goalCards = [
    {
      emoji: "🔥",
      label: "Calories",
      left: calorieGoal - Math.round(totalCal),
      total: Math.round(totalCal),
      goal: calorieGoal,
      unit: "cal",
      isOver: totalCal > calorieGoal,
    },
    {
      emoji: "🥩",
      label: "Protein",
      left: proteinGoal - Math.round(totalPro),
      total: Math.round(totalPro),
      goal: proteinGoal,
      unit: "g",
      isOver: totalPro > proteinGoal,
    },
    {
      emoji: "🌿",
      label: "Fiber",
      left: fiberGoal - Math.round(totalFib),
      total: Math.round(totalFib),
      goal: fiberGoal,
      unit: "g",
      isOver: totalFib > fiberGoal,
    },
    {
      emoji: "💧",
      label: "Water",
      left: waterGoal - totalWater,
      total: totalWater,
      goal: waterGoal,
      unit: "gl",
      isOver: totalWater > waterGoal,
    },
  ];

  if (fetching || !loaded) {
    return (
      <div className="pt-8 flex flex-col gap-4 animate-pulse">
        <div className="h-8 w-40 bg-surface rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-surface rounded-xl" />)}
        </div>
        <div className="h-12 bg-surface rounded-xl" />
        <div className="h-36 bg-surface rounded-xl" />
      </div>
    );
  }

  return (
    <div className="pt-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-app-text">Daily Tracker</h1>
          <p className="text-xs text-secondary">{formatDisplayDate(today)}</p>
        </div>
        <Link href="/settings" className="text-secondary hover:text-app-text transition-colors text-xl">
          ⚙️
        </Link>
      </div>

      {/* 4-goal countdown grid */}
      <div className="grid grid-cols-2 gap-2">
        {goalCards.map(({ emoji, label, left, total, goal, unit, isOver }) => {
          const pct = Math.min(100, Math.round((total / goal) * 100));
          const atGoal = !isOver && left === 0;
          return (
            <div key={label} className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                {emoji} {label}
              </p>
              {atGoal ? (
                <p className="text-2xl font-extrabold text-success leading-none">Done! 🎉</p>
              ) : (
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-2xl font-extrabold leading-none ${isOver ? "text-danger" : "text-accent"}`}>
                    {isOver ? `+${Math.abs(left)}` : left}
                  </span>
                  <span className="text-xs text-secondary ml-1">{unit} {isOver ? "over" : "left"}</span>
                </div>
              )}
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-danger" : atGoal ? "bg-success" : "bg-accent"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[10px] text-muted">{total} / {goal} {unit}</p>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Streak", value: `${streak}🔥`, sub: "days" },
          { label: "Logs", value: String(logs.length), sub: "total" },
          { label: "14-day Avg", value: avg > 0 ? String(avg) : "—", sub: "cal/day" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl p-3 border border-border text-center">
            <p className="text-xl font-extrabold text-app-text">{stat.value}</p>
            <p className="text-[10px] text-muted uppercase tracking-wide">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href={`/log?date=${today}`}
        className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-center text-base hover:bg-accent/80 transition-colors"
      >
        {todayLog ? "✏️ Update Today" : "📝 Log Today"}
      </Link>

      {/* Chart */}
      <div className="bg-surface rounded-xl p-4 border border-border">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-3">
          14-Day Calories
        </p>
        <ChartCalories logs={logs} sources={sources} goal={calorieGoal} />
      </div>
    </div>
  );
}
