export interface FoodSource {
  id: number;
  key: string;
  label: string;
  calories: number;
  protein: number;
  fiber: number;
  waterGlasses: number;
  unit: string;
  emoji: string;
  active: boolean;
  sortOrder: number;
}

export interface CalorieEntry {
  id: number;
  logId: number;
  sourceKey: string | null;
  quantity: number;
  label: string | null;
  calories: number | null;
  protein: number | null;
  fiber: number | null;
}

export interface AdhocDraftEntry {
  clientId: string;
  id?: number;
  label: string;
  calories: number;
  protein: number;
  fiber: number;
}

export interface DailyLog {
  id: number;
  date: string;
  note: string | null;
  isActiveDay: boolean | null;
  waterGlasses: number;
  entries: CalorieEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  name: string;
  activeCalorieGoal: number;
  inactiveCalorieGoal: number;
  proteinGoal: number;
  fiberGoal: number;
  waterGoal: number;
}

export interface Note {
  id: number;
  body: string;
  createdAt: string;
}

export type CalorieCounts = { [key: string]: number };
