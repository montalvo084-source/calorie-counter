"use client";

import { useEffect, useRef, useState } from "react";
import { useFoodSources } from "@/lib/food-sources-context";
import ProgressBar from "@/components/ProgressBar";
import type { CalorieCounts } from "@/lib/types";

interface CalorieTrackerProps {
  counts: CalorieCounts;
  onChange: (counts: CalorieCounts) => void;
  goal: number;
}

const MILESTONE_MESSAGES: Record<number, string> = {
  25: "25% of goal used!",
  50: "Halfway there!",
  75: "75% used!",
  100: "At your goal! 🎉",
};

export default function CalorieTracker({ counts, onChange, goal }: CalorieTrackerProps) {
  const { sources: allSources } = useFoodSources();
  const sources = allSources.filter((s) => s.active);

  const total = sources.reduce((sum, s) => sum + (counts[s.key] ?? 0) * s.calories, 0);
  const remaining = goal - Math.round(total);
  const pct = Math.min(100, Math.round((total / goal) * 100));
  const isOver = total > goal;

  const [milestone, setMilestone] = useState<string | null>(null);
  const prevPct = useRef(pct);

  useEffect(() => {
    const prev = prevPct.current;
    prevPct.current = pct;
    for (const m of [25, 50, 75, 100]) {
      if (prev < m && pct >= m) {
        setMilestone(MILESTONE_MESSAGES[m]);
        const t = setTimeout(() => setMilestone(null), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [pct]);

  function adjust(key: string, delta: number) {
    const current = counts[key] ?? 0;
    onChange({ ...counts, [key]: Math.max(0, current + delta) });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          🔥 Daily Calories
        </span>
        {isOver ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-danger">{Math.abs(remaining)}</span>
            <span className="text-danger text-base font-semibold">cal OVER</span>
          </div>
        ) : remaining === 0 ? (
          <p className="text-4xl font-extrabold text-success">At Goal! 🎉</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-accent">{remaining}</span>
            <span className="text-secondary text-base font-semibold">cal LEFT</span>
          </div>
        )}
        <ProgressBar value={total} max={goal} />
        <p className="text-xs text-secondary text-right">
          {Math.round(total)} / {goal} cal
          <span className="ml-2 text-app-text font-semibold">
            {isOver ? `${Math.abs(remaining)} over` : `${pct}% used`}
          </span>
        </p>
        {milestone && (
          <div className="mt-1 rounded-lg bg-accent/15 border border-accent/30 px-3 py-1.5 text-sm font-bold text-accent text-center animate-pop-in">
            {milestone}
          </div>
        )}
      </div>

      {sources.map((source) => {
        const qty = counts[source.key] ?? 0;
        const cal = qty * source.calories;
        return (
          <div
            key={source.key}
            className="flex items-center gap-3 bg-surface rounded-xl p-3 border border-border"
          >
            <span className="text-2xl w-8 text-center">{source.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-app-text truncate">{source.label}</p>
              <p className="text-xs text-secondary">
                {cal > 0 ? `${cal} cal logged` : `${source.calories} cal / ${source.unit}`}
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
