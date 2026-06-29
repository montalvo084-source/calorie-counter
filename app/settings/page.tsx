"use client";

import { useEffect, useState } from "react";
import { useFoodSources } from "@/lib/food-sources-context";
import { useToast } from "@/lib/toast-context";
import type { FoodSource, Profile } from "@/lib/types";

interface EditingFood {
  id: number | null;
  label: string;
  calories: string;
  protein: string;
  fiber: string;
  unit: string;
  emoji: string;
}

const BLANK_FOOD: EditingFood = { id: null, label: "", calories: "", protein: "0", fiber: "0", unit: "serving", emoji: "🍽️" };

export default function SettingsPage() {
  const { sources, reload } = useFoodSources();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [calorieGoal, setCalorieGoal] = useState("");
  const [proteinGoal, setProteinGoal] = useState("");
  const [fiberGoal, setFiberGoal] = useState("");
  const [waterGoal, setWaterGoal] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [editing, setEditing] = useState<EditingFood | null>(null);
  const [savingFood, setSavingFood] = useState(false);

  const [resetStep, setResetStep] = useState(0);
  const [resetText, setResetText] = useState("");

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((p: Profile) => {
      setProfile(p);
      setName(p.name);
      setCalorieGoal(String(p.calorieGoal));
      setProteinGoal(String(p.proteinGoal));
      setFiberGoal(String(p.fiberGoal));
      setWaterGoal(String(p.waterGoal));
    });
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        calorieGoal: Number(calorieGoal),
        proteinGoal: Number(proteinGoal),
        fiberGoal: Number(fiberGoal),
        waterGoal: Number(waterGoal),
      }),
    });
    if (res.ok) {
      setProfile(await res.json());
      showToast("Profile saved!", "success");
    } else {
      showToast("Failed to save profile.", "error");
    }
    setSavingProfile(false);
  }

  async function saveFood() {
    if (!editing) return;
    setSavingFood(true);
    const body = {
      label: editing.label,
      calories: Number(editing.calories),
      protein: Number(editing.protein),
      fiber: Number(editing.fiber),
      unit: editing.unit,
      emoji: editing.emoji,
    };
    const res =
      editing.id == null
        ? await fetch("/api/food-sources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch(`/api/food-sources/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

    if (res.ok) {
      showToast(editing.id == null ? "Food added!" : "Food updated!", "success");
      reload();
      setEditing(null);
    } else {
      showToast("Failed to save food.", "error");
    }
    setSavingFood(false);
  }

  async function toggleFood(source: FoodSource) {
    await fetch(`/api/food-sources/${source.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !source.active }),
    });
    reload();
  }

  async function deleteFood(id: number) {
    await fetch(`/api/food-sources/${id}`, { method: "DELETE" });
    reload();
    showToast("Food deleted.", "info");
  }

  function startReset() {
    setResetStep((s) => s + 1);
    setResetText("");
  }

  async function confirmReset() {
    if (resetText !== "RESET") return;
    const logs = await fetch("/api/logs").then((r) => r.json());
    for (const log of logs) {
      await fetch(`/api/logs/${log.date}`, { method: "DELETE" });
    }
    showToast("All logs cleared.", "info");
    setResetStep(0);
    setResetText("");
  }

  return (
    <div className="pt-8 flex flex-col gap-6 pb-8">
      <h1 className="text-2xl font-extrabold text-app-text">Settings</h1>

      {/* Profile */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-secondary">Profile & Goals</h2>
        <div className="bg-surface rounded-xl p-4 border border-border flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-secondary font-semibold">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary font-semibold">🔥 Calorie Goal</label>
              <input
                type="number"
                value={calorieGoal}
                onChange={(e) => setCalorieGoal(e.target.value)}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary font-semibold">🥩 Protein Goal (g)</label>
              <input
                type="number"
                value={proteinGoal}
                onChange={(e) => setProteinGoal(e.target.value)}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary font-semibold">🌿 Fiber Goal (g)</label>
              <input
                type="number"
                value={fiberGoal}
                onChange={(e) => setFiberGoal(e.target.value)}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text focus:border-accent focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary font-semibold">💧 Water Goal (glasses)</label>
              <input
                type="number"
                value={waterGoal}
                onChange={(e) => setWaterGoal(e.target.value)}
                className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={savingProfile}
            className="bg-accent text-bg font-bold py-2.5 rounded-lg text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {savingProfile ? "Saving…" : "Save Goals"}
          </button>
        </div>
      </section>

      {/* Food Library */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wide text-secondary">Food Library</h2>
          <button
            onClick={() => setEditing({ ...BLANK_FOOD })}
            className="text-xs font-bold text-accent hover:text-accent/70 transition-colors"
          >
            + Add Food
          </button>
        </div>

        {editing && (
          <div className="bg-surface rounded-xl p-4 border border-accent/40 flex flex-col gap-3">
            <p className="text-sm font-bold text-app-text">{editing.id == null ? "New Food" : "Edit Food"}</p>
            <div className="flex gap-2">
              <input
                value={editing.emoji}
                onChange={(e) => setEditing({ ...editing, emoji: e.target.value })}
                placeholder="🍽️"
                className="w-14 bg-bg border border-border rounded-lg px-2 py-2 text-base text-center focus:border-accent focus:outline-none"
              />
              <input
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                placeholder="Food name"
                className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted uppercase tracking-wide">🔥 Calories</label>
                <input
                  type="number"
                  value={editing.calories}
                  onChange={(e) => setEditing({ ...editing, calories: e.target.value })}
                  placeholder="0"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted uppercase tracking-wide">Unit</label>
                <input
                  value={editing.unit}
                  onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                  placeholder="serving"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted uppercase tracking-wide">🥩 Protein (g)</label>
                <input
                  type="number"
                  value={editing.protein}
                  onChange={(e) => setEditing({ ...editing, protein: e.target.value })}
                  placeholder="0"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-muted uppercase tracking-wide">🌿 Fiber (g)</label>
                <input
                  type="number"
                  value={editing.fiber}
                  onChange={(e) => setEditing({ ...editing, fiber: e.target.value })}
                  placeholder="0"
                  className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-muted focus:border-accent focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveFood}
                disabled={savingFood || !editing.label || !editing.calories}
                className="flex-1 bg-accent text-bg font-bold py-2 rounded-lg text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
              >
                {savingFood ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 border border-border rounded-lg text-sm text-secondary hover:text-app-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className={`bg-surface rounded-xl p-3 border transition-colors ${
                source.active ? "border-border" : "border-border opacity-50"
              } flex items-center gap-3`}
            >
              <span className="text-2xl w-8 text-center">{source.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-app-text truncate">{source.label}</p>
                <p className="text-xs text-secondary">
                  {source.calories} cal
                  {source.protein > 0 && ` · ${source.protein}g pro`}
                  {source.fiber > 0 && ` · ${source.fiber}g fib`}
                  {" / "}{source.unit}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleFood(source)}
                  className={`text-[10px] font-bold px-2 py-1 rounded ${
                    source.active ? "bg-success/15 text-success" : "bg-border text-muted"
                  }`}
                >
                  {source.active ? "On" : "Off"}
                </button>
                <button
                  onClick={() =>
                    setEditing({
                      id: source.id,
                      label: source.label,
                      calories: String(source.calories),
                      protein: String(source.protein),
                      fiber: String(source.fiber),
                      unit: source.unit,
                      emoji: source.emoji,
                    })
                  }
                  className="text-xs text-secondary hover:text-app-text transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteFood(source.id)}
                  className="text-xs text-danger hover:text-danger/70 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger zone */}
      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-wide text-secondary">Danger Zone</h2>
        <div className="bg-surface rounded-xl p-4 border border-danger/30 flex flex-col gap-3">
          {resetStep === 0 && (
            <button onClick={startReset} className="text-danger font-semibold text-sm hover:text-danger/70 transition-colors text-left">
              Clear All Logs
            </button>
          )}
          {resetStep === 1 && (
            <>
              <p className="text-sm text-danger font-semibold">Are you sure? This will delete all your logs.</p>
              <div className="flex gap-2">
                <button onClick={startReset} className="flex-1 bg-danger/10 text-danger font-bold py-2 rounded-lg text-sm">Yes, continue</button>
                <button onClick={() => setResetStep(0)} className="flex-1 border border-border text-secondary py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </>
          )}
          {resetStep === 2 && (
            <>
              <p className="text-sm text-danger font-semibold">Type RESET to confirm:</p>
              <input
                value={resetText}
                onChange={(e) => setResetText(e.target.value)}
                placeholder="RESET"
                className="bg-bg border border-danger/40 rounded-lg px-3 py-2 text-sm text-app-text focus:outline-none"
              />
              <button onClick={confirmReset} disabled={resetText !== "RESET"} className="bg-danger text-white font-bold py-2 rounded-lg text-sm disabled:opacity-40">
                Delete All Logs
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
