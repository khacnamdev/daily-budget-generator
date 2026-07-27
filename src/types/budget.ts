export type CurrencyCode = "USD" | "VND" | "JPY";

export interface BudgetConfig {
  year: number;
  month: number; // 1 - 12
  currency: CurrencyCode;
  minAmount: number;
  maxAmount: number;
  maxTotal: number;
}

export interface BudgetItem {
  no: number;
  day: number;
  dateStr: string; // e.g. "2026-07-01"
  dayLabel: string; // e.g. "2026-07-01"
  amount: number;
}

export interface BudgetHistoryRecord {
  id: string;
  timestamp: string;
  config: BudgetConfig;
  totalAmount: number;
  items: BudgetItem[];
}

export interface BudgetValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface BudgetStats {
  year: number;
  month: number;
  monthName: string;
  days: number;
  currency: CurrencyCode;
  totalAmount: number;
  remainingAmount: number;
  averageAmount: number;
  minGenerated: number;
  maxGenerated: number;
  budgetUtilizationPct: number;
}
