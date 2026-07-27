import { BudgetConfig } from "@/types/budget";

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  days: 30,
  minAmount: 20000,
  maxAmount: 100000,
  maxTotal: 1500000,
};

export const MIN_DAYS = 1;
export const MAX_DAYS = 31;
export const STORAGE_KEYS = {
  CONFIG: "daily_budget_config",
  DATA: "daily_budget_data",
  HISTORY: "daily_budget_history",
  THEME: "daily_budget_theme",
} as const;
