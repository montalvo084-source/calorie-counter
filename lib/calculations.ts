import type { CalorieEntry, DailyLog, FoodSource } from "./types";

export function calcCaloriesTotal(entries: CalorieEntry[], sources: FoodSource[]): number {
  return entries.reduce((sum, entry) => {
    const source = sources.find((s) => s.key === entry.sourceKey);
    return sum + (source ? source.calories * entry.quantity : 0);
  }, 0);
}

export function calcProteinTotal(entries: CalorieEntry[], sources: FoodSource[]): number {
  return entries.reduce((sum, entry) => {
    const source = sources.find((s) => s.key === entry.sourceKey);
    return sum + (source ? source.protein * entry.quantity : 0);
  }, 0);
}

export function calcFiberTotal(entries: CalorieEntry[], sources: FoodSource[]): number {
  return entries.reduce((sum, entry) => {
    const source = sources.find((s) => s.key === entry.sourceKey);
    return sum + (source ? source.fiber * entry.quantity : 0);
  }, 0);
}

export function calcRemaining(total: number, goal: number): number {
  return goal - Math.round(total);
}

export function calcAvgCalories(logs: DailyLog[], sources: FoodSource[], days = 14): number {
  const recent = getRecent(logs, days);
  if (recent.length === 0) return 0;
  return Math.round(recent.reduce((s, l) => s + calcCaloriesTotal(l.entries, sources), 0) / recent.length);
}

export function calcAvgProtein(logs: DailyLog[], sources: FoodSource[], days = 14): number {
  const recent = getRecent(logs, days);
  if (recent.length === 0) return 0;
  return Math.round(recent.reduce((s, l) => s + calcProteinTotal(l.entries, sources), 0) / recent.length);
}

export function calcAvgFiber(logs: DailyLog[], sources: FoodSource[], days = 14): number {
  const recent = getRecent(logs, days);
  if (recent.length === 0) return 0;
  return Math.round(recent.reduce((s, l) => s + calcFiberTotal(l.entries, sources), 0) / recent.length);
}

export function calcAvgWater(logs: DailyLog[], days = 14): number {
  const recent = getRecent(logs, days);
  if (recent.length === 0) return 0;
  return Math.round(recent.reduce((s, l) => s + (l.waterGlasses ?? 0), 0) / recent.length);
}

function getRecent(logs: DailyLog[], days: number): DailyLog[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return logs.filter((l) => new Date(l.date) >= cutoff);
}

export function calcStreak(logs: DailyLog[]): number {
  if (logs.length === 0) return 0;
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const today = todayStr();
  let streak = 0;
  let cursor = today;
  for (const log of sorted) {
    if (log.date === cursor) {
      streak++;
      const d = new Date(cursor);
      d.setDate(d.getDate() - 1);
      cursor = formatDate(d);
    } else {
      break;
    }
  }
  return streak;
}

export function todayStr(): string {
  return formatDate(new Date());
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
