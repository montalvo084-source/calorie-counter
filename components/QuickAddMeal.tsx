"use client";

import { useState } from "react";
import { useFoodSources } from "@/lib/food-sources-context";
import { useToast } from "@/lib/toast-context";
import type { AdhocDraftEntry } from "@/lib/types";

interface QuickAddMealProps {
  entries: AdhocDraftEntry[];
  onAdd: (draft: AdhocDraftEntry) => void;
  onRemove: (clientId: string) => void;
}

let nextTempId = 0;

const inputClass =
  "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-muted focus:border-accent focus:outline-none transition-colors";

export default function QuickAddMeal({ entries, onAdd, onRemove }: QuickAddMealProps) {
  const { reload } = useFoodSources();
  const { showToast } = useToast();
  const [label, setLabel] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [fiber, setFiber] = useState("");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<string | null>(null);

  const canAdd = Number(calories) > 0;

  function handleAdd() {
    if (!canAdd) return;
    onAdd({
      clientId: `tmp-${++nextTempId}`,
      label: label.trim(),
      calories: Number(calories),
      protein: Number(protein) || 0,
      fiber: Number(fiber) || 0,
    });
    setLabel("");
    setCalories("");
    setProtein("");
    setFiber("");
  }

  async function handleSaveToLibrary(entry: AdhocDraftEntry) {
    setSaving(entry.clientId);
    const res = await fetch("/api/food-sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: entry.label || "Quick Meal",
        calories: entry.calories,
        protein: entry.protein,
        fiber: entry.fiber,
        unit: "meal",
        emoji: "📝",
      }),
    });
    setSaving(null);
    if (res.ok) {
      setSaved((prev) => new Set(prev).add(entry.clientId));
      reload();
      showToast("Saved to Food Library!", "success");
    } else {
      showToast("Something went wrong.", "error");
    }
  }

  return (
    <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
        📝 Quick Estimates
      </span>

      <div className="flex flex-col gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="What was it? (optional)"
          className={inputClass}
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Calories*"
            className={inputClass}
          />
          <input
            type="number"
            inputMode="numeric"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="Protein g"
            className={inputClass}
          />
          <input
            type="number"
            inputMode="numeric"
            value={fiber}
            onChange={(e) => setFiber(e.target.value)}
            placeholder="Fiber g"
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full bg-accent text-bg font-bold py-2.5 rounded-lg text-sm hover:bg-accent/80 transition-colors disabled:opacity-40"
        >
          + Add
        </button>
      </div>

      {entries.length > 0 && (
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <div
              key={entry.clientId}
              className="flex items-center gap-3 bg-bg rounded-xl p-3 border border-border"
            >
              <span className="text-2xl w-8 text-center">📝</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-app-text truncate">
                  {entry.label || "Quick add"}
                </p>
                <p className="text-xs text-secondary">
                  {entry.calories} cal
                  {entry.protein > 0 && ` · ${entry.protein}g protein`}
                  {entry.fiber > 0 && ` · ${entry.fiber}g fiber`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {saved.has(entry.clientId) ? (
                  <span className="text-xs font-semibold text-success">✓ Saved</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveToLibrary(entry)}
                    disabled={saving === entry.clientId}
                    className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors disabled:opacity-40"
                  >
                    Save to library
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(entry.clientId)}
                  className="w-7 h-7 rounded-lg bg-border text-app-text font-bold hover:bg-danger/20 transition-colors text-sm leading-none flex items-center justify-center"
                  aria-label={`Remove ${entry.label || "quick add"}`}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
