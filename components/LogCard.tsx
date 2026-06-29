"use client";

import Link from "next/link";
import { formatDisplayDate, todayStr, calcCaloriesTotal, calcProteinTotal, calcFiberTotal } from "@/lib/calculations";
import type { DailyLog, FoodSource, Profile } from "@/lib/types";

interface LogCardProps {
  log: DailyLog;
  sources: FoodSource[];
  profile: Profile;
  onDelete?: () => void;
}

export default function LogCard({ log, sources, profile, onDelete }: LogCardProps) {
  const cal = Math.round(calcCaloriesTotal(log.entries, sources));
  const pro = Math.round(calcProteinTotal(log.entries, sources));
  const fib = Math.round(calcFiberTotal(log.entries, sources));
  const water = log.waterGlasses ?? 0;
  const isToday = log.date === todayStr();
  const calPct = Math.round((cal / profile.calorieGoal) * 100);
  const isOver = cal > profile.calorieGoal;

  return (
    <div className="relative group">
      <Link
        href={`/log?date=${log.date}`}
        className="block bg-surface rounded-xl p-4 border border-border hover:border-accent/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-app-text">{formatDisplayDate(log.date)}</span>
            {isToday && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                Today
              </span>
            )}
          </div>
          <span className={`text-sm font-bold ${isOver ? "text-danger" : "text-success"}`}>
            {cal} cal
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-border overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${isOver ? "bg-danger" : calPct >= 100 ? "bg-success" : "bg-accent"}`}
            style={{ width: `${Math.min(100, calPct)}%` }}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-secondary">{calPct}% of {profile.calorieGoal} cal</span>
          {pro > 0 && <span className="text-xs text-secondary">🥩 {pro}g</span>}
          {fib > 0 && <span className="text-xs text-secondary">🌿 {fib}g</span>}
          {water > 0 && <span className="text-xs text-secondary">💧 {water} gl</span>}
          {log.note && (
            <span className="text-xs text-muted italic truncate max-w-[120px]">"{log.note}"</span>
          )}
        </div>
      </Link>
      {onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-danger bg-danger/10 rounded px-2 py-1 font-semibold"
        >
          Delete
        </button>
      )}
    </div>
  );
}
