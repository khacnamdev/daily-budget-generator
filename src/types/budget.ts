export interface BudgetConfig {
  days: number;
  minAmount: number;
  maxAmount: number;
  maxTotal: number;
}

export interface BudgetItem {
  no: number;
  day: number;
  dayLabel: string;
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
  days: number;
  totalAmount: number;
  remainingAmount: number;
  averageAmount: number;
  minGenerated: number;
  maxGenerated: number;
  budgetUtilizationPct: number;
}
