export interface FoodSource {
  id: number;
  key: string;
  label: string;
  calories: number;
  protein: number;
  fiber: number;
  unit: string;
  emoji: string;
  active: boolean;
  sortOrder: number;
}

export interface CalorieEntry {
  id: number;
  logId: number;
  sourceKey: string;
  quantity: number;
}

export interface DailyLog {
  id: number;
  date: string;
  note: string | null;
  waterGlasses: number;
  entries: CalorieEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  name: string;
  calorieGoal: number;
  proteinGoal: number;
  fiberGoal: number;
  waterGoal: number;
}

export type CalorieCounts = { [key: string]: number };
