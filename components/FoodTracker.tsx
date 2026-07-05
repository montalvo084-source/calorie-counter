"use client";

import { useEffect, useRef, useState } from "react";
import { useFoodSources } from "@/lib/food-sources-context";
import ProgressBar from "@/components/ProgressBar";
import {
  calcCaloriesTotal,
  calcProteinTotal,
  calcFiberTotal,
} from "@/lib/calculations";
import type { AdhocDraftEntry, CalorieCounts, CalorieEntry } from "@/lib/types";

interface FoodTrackerProps {
  counts: CalorieCounts;
  onChange: (counts: CalorieCounts | ((prev: CalorieCounts) => CalorieCounts)) => void;
  calorieGoal: number;
  proteinGoal: number;
  fiberGoal: number;
  adhocEntries?: AdhocDraftEntry[];
}

interface Milestone {
  label: string;
  color: string;
}

const MILESTONES: Record<number, string> = {
  25: "25% used!",
  50: "Halfway there!",
  75: "75% used!",
  100: "Goal reached! 🎉",
};

function useMilestoneToast(pct: number, label: string) {
  const prev = useRef(pct);
  const [msg, setMsg] = useState<Milestone | null>(null);

  useEffect(() => {
    const p = prev.current;
    prev.current = pct;
    for (const m of [25, 50, 75, 100]) {
      if (p < m && pct >= m) {
        setMsg({ label: `${label}: ${MILESTONES[m]}`, color: "text-accent" });
        const t = setTimeout(() => setMsg(null), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [pct, label]);

  return msg;
}

export default function FoodTracker({
  counts,
  onChange,
  calorieGoal,
  proteinGoal,
  fiberGoal,
  adhocEntries = [],
}: FoodTrackerProps) {
  const { sources: allSources } = useFoodSources();
  const sources = allSources.filter((s) => s.active);

  const entries = [
    ...Object.entries(counts)
      .filter(([, q]) => q > 0)
      .map(([sourceKey, quantity]) => ({ sourceKey, quantity } as CalorieEntry & { id: number; logId: number })),
    ...adhocEntries.map(
      (a) =>
        ({
          id: 0,
          logId: 0,
          sourceKey: null,
          quantity: 1,
          label: a.label,
          calories: a.calories,
          protein: a.protein,
          fiber: a.fiber,
        } as CalorieEntry)
    ),
  ];

  const totalCal = calcCaloriesTotal(entries, sources);
  const totalPro = calcProteinTotal(entries, sources);
  const totalFib = calcFiberTotal(entries, sources);

  const calPct = Math.min(100, Math.round((totalCal / calorieGoal) * 100));
  const proPct = Math.min(100, Math.round((totalPro / proteinGoal) * 100));
  const fibPct = Math.min(100, Math.round((totalFib / fiberGoal) * 100));

  const calLeft = calorieGoal - Math.round(totalCal);
  const proLeft = proteinGoal - Math.round(totalPro);
  const fibLeft = fiberGoal - Math.round(totalFib);

  const calMilestone = useMilestoneToast(calPct, "🔥 Calories");
  const proMilestone = useMilestoneToast(proPct, "🥩 Protein");
  const fibMilestone = useMilestoneToast(fibPct, "🌿 Fiber");
  const activeMilestone = calMilestone ?? proMilestone ?? fibMilestone;

  function adjust(key: string, delta: number) {
    onChange((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] ?? 0) + delta) }));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Summary card */}
      <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          Today&apos;s Progress
        </span>

        {/* 3 mini countdowns */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: "🔥", label: "Calories", left: calLeft, unit: "cal", pct: calPct, isOver: totalCal > calorieGoal },
            { emoji: "🥩", label: "Protein", left: proLeft, unit: "g", pct: proPct, isOver: totalPro > proteinGoal },
            { emoji: "🌿", label: "Fiber", left: fibLeft, unit: "g", pct: fibPct, isOver: totalFib > fiberGoal },
          ].map(({ emoji, label, left, unit, pct, isOver }) => (
            <div key={label} className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-secondary">
                {emoji} {label}
              </p>
              <p className={`text-lg font-extrabold leading-none ${isOver ? "text-danger" : left === 0 ? "text-success" : "text-accent"}`}>
                {isOver ? `+${Math.abs(left)}` : left}
                <span className="text-xs font-semibold text-secondary ml-0.5">{unit}</span>
              </p>
              <div className="h-1 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isOver ? "bg-danger" : pct >= 100 ? "bg-success" : "bg-accent"}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {activeMilestone && (
          <div className="rounded-lg bg-accent/15 border border-accent/30 px-3 py-1.5 text-sm font-bold text-accent text-center animate-pop-in">
            {activeMilestone.label}
          </div>
        )}
      </div>

      {/* Food list */}
      {sources.map((source) => {
        const qty = counts[source.key] ?? 0;
        return (
          <div
            key={source.key}
            className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-border"
          >
            <span className="text-2xl w-8 text-center">{source.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-app-text truncate">{source.label}</p>
              <p className="text-xs text-secondary">
                {source.calories} cal
                {source.protein > 0 && ` · ${source.protein}g protein`}
                {source.fiber > 0 && ` · ${source.fiber}g fiber`}
                {source.waterGlasses > 0 && ` · 💧${source.waterGlasses} gl`}
                {" / "}{source.unit}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => adjust(source.key, -1)}
                disabled={qty === 0}
                className="w-9 h-9 rounded-lg bg-border text-app-text font-bold disabled:opacity-30 hover:bg-accent/20 transition-colors text-lg leading-none flex items-center justify-center"
                aria-label={`Decrease ${source.label}`}
              >
                −
              </button>
              <span className="w-8 text-center text-base font-bold text-app-text">{qty}</span>
              <button
                type="button"
                onClick={() => adjust(source.key, 1)}
                className="w-9 h-9 rounded-lg bg-accent text-bg font-bold hover:bg-accent/80 transition-colors text-lg leading-none flex items-center justify-center"
                aria-label={`Increase ${source.label}`}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
