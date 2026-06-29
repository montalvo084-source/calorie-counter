"use client";

import ProgressBar from "@/components/ProgressBar";

interface WaterTrackerProps {
  glasses: number;
  goal: number;
  onChange: (glasses: number) => void;
}

export default function WaterTracker({ glasses, goal, onChange }: WaterTrackerProps) {
  const pct = Math.min(100, Math.round((glasses / goal) * 100));
  const isOver = glasses > goal;
  const remaining = goal - glasses;

  return (
    <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          💧 Water
        </span>
        <span className="text-xs text-secondary">{glasses} / {goal} glasses</span>
      </div>

      {/* Glass emoji row */}
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: goal }).map((_, i) => (
          <span
            key={i}
            className={`text-lg transition-all duration-200 ${i < glasses ? "opacity-100" : "opacity-20"}`}
          >
            💧
          </span>
        ))}
        {glasses > goal && (
          <span className="text-xs text-danger font-semibold self-center ml-1">
            +{glasses - goal} extra
          </span>
        )}
      </div>

      <ProgressBar value={glasses} max={goal} />

      <p className={`text-xs text-right font-semibold ${isOver ? "text-success" : "text-secondary"}`}>
        {isOver ? "Goal reached! 🎉" : `${remaining} glass${remaining !== 1 ? "es" : ""} to go`}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, glasses - 1))}
          disabled={glasses === 0}
          className="w-12 h-12 rounded-xl bg-border text-app-text font-bold disabled:opacity-30 hover:bg-accent/20 transition-colors text-xl flex items-center justify-center"
          aria-label="Remove glass"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onChange(glasses + 1)}
          className="flex-1 h-12 rounded-xl bg-accent text-bg font-bold hover:bg-accent/80 transition-colors text-base flex items-center justify-center gap-2"
          aria-label="Add glass of water"
        >
          💧 + Glass
        </button>
      </div>
    </div>
  );
}
