"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FoodTracker from "@/components/FoodTracker";
import WaterTracker from "@/components/WaterTracker";
import QuickAddMeal from "@/components/QuickAddMeal";
import { useFoodSources } from "@/lib/food-sources-context";
import { useToast } from "@/lib/toast-context";
import { todayStr, formatDisplayDate, calcWaterFromFood } from "@/lib/calculations";
import type { AdhocDraftEntry, CalorieCounts, DailyLog, Profile } from "@/lib/types";

function LogPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const date = params.get("date") ?? todayStr();
  const { sources } = useFoodSources();
  const { showToast } = useToast();

  const [counts, setCounts] = useState<CalorieCounts>({});
  const [adhocEntries, setAdhocEntries] = useState<AdhocDraftEntry[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [note, setNote] = useState("");
  const [existingLog, setExistingLog] = useState<DailyLog | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [logRes, profileRes] = await Promise.all([
        fetch(`/api/logs/${date}`),
        fetch("/api/profile"),
      ]);
      const log: DailyLog | null = await logRes.json();
      const prof: Profile = await profileRes.json();
      setProfile(prof);
      if (log) {
        setExistingLog(log);
        setNote(log.note ?? "");
        setWaterGlasses(log.waterGlasses ?? 0);
        const c: CalorieCounts = {};
        const adhoc: AdhocDraftEntry[] = [];
        for (const entry of log.entries) {
          if (entry.sourceKey == null) {
            adhoc.push({
              clientId: String(entry.id),
              id: entry.id,
              label: entry.label ?? "",
              calories: entry.calories ?? 0,
              protein: entry.protein ?? 0,
              fiber: entry.fiber ?? 0,
            });
          } else {
            c[entry.sourceKey] = (c[entry.sourceKey] ?? 0) + entry.quantity;
          }
        }
        setCounts(c);
        setAdhocEntries(adhoc);
      }
      setLoaded(true);
    }
    load();
  }, [date]);

  function handleQuickAdd(draft: AdhocDraftEntry) {
    setAdhocEntries((prev) => [...prev, draft]);
  }

  function handleQuickRemove(clientId: string) {
    setAdhocEntries((prev) => prev.filter((e) => e.clientId !== clientId));
  }

  async function handleSave() {
    setSaving(true);
    const entries = [
      ...Object.entries(counts)
        .filter(([, qty]) => qty > 0)
        .map(([sourceKey, quantity]) => ({ sourceKey, quantity })),
      ...adhocEntries.map((a) => ({
        sourceKey: null,
        quantity: 1,
        label: a.label,
        calories: a.calories,
        protein: a.protein,
        fiber: a.fiber,
      })),
    ];

    const res = await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, entries, note, waterGlasses }),
    });

    if (res.ok) {
      showToast(existingLog ? "Log updated!" : "Log saved!", "success");
      router.push("/history");
    } else {
      showToast("Something went wrong.", "error");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await fetch(`/api/logs/${date}`, { method: "DELETE" });
    showToast("Log deleted.", "info");
    router.push("/history");
  }

  if (!loaded) {
    return (
      <div className="pt-6 flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-32 bg-surface rounded" />
        <div className="h-48 bg-surface rounded-xl" />
        <div className="h-32 bg-surface rounded-xl" />
        <div className="h-24 bg-surface rounded-xl" />
      </div>
    );
  }

  return (
    <div className="pt-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-secondary hover:text-app-text transition-colors text-lg">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-app-text">Log Your Day</h1>
          <p className="text-xs text-secondary">{formatDisplayDate(date)}</p>
        </div>
      </div>

      <FoodTracker
        counts={counts}
        onChange={setCounts}
        calorieGoal={profile?.calorieGoal ?? 2000}
        proteinGoal={profile?.proteinGoal ?? 150}
        fiberGoal={profile?.fiberGoal ?? 25}
        adhocEntries={adhocEntries}
      />

      <QuickAddMeal entries={adhocEntries} onAdd={handleQuickAdd} onRemove={handleQuickRemove} />

      <WaterTracker
        glasses={waterGlasses}
        foodGlasses={calcWaterFromFood(
          Object.entries(counts)
            .filter(([, q]) => q > 0)
            .map(([sourceKey, quantity]) => ({
              sourceKey,
              quantity,
              id: 0,
              logId: 0,
              label: null,
              calories: null,
              protein: null,
              fiber: null,
            })),
          sources
        )}
        goal={profile?.waterGoal ?? 8}
        onChange={setWaterGlasses}
      />

      <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-secondary">
          📝 Notes
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any observations for today..."
          rows={3}
          className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-muted focus:border-accent focus:outline-none transition-colors resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-accent text-bg font-bold py-4 rounded-xl text-base hover:bg-accent/80 transition-colors disabled:opacity-50"
      >
        {saving ? "Saving…" : existingLog ? "Update Log" : "Save Log"}
      </button>

      {existingLog && (
        <button
          onClick={handleDelete}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
            confirmDelete ? "bg-danger text-white" : "bg-danger/10 text-danger"
          }`}
        >
          {confirmDelete ? "Tap again to confirm delete" : "Delete Log"}
        </button>
      )}
    </div>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={<div className="pt-6 text-secondary text-sm">Loading…</div>}>
      <LogPageInner />
    </Suspense>
  );
}
