import { BudgetConfig, CurrencyCode } from "@/types/budget";

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  year: 2026,
  month: 7, // July
  currency: "USD",
  minAmount: 10,
  maxAmount: 100,
  maxTotal: 1500,
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const SUPPORTED_CURRENCIES: {
  code: CurrencyCode;
  name: string;
  symbol: string;
}[] = [
  { code: "USD", name: "United States Dollar ($)", symbol: "$" },
  { code: "VND", name: "Vietnamese Dong (₫)", symbol: "₫" },
  { code: "JPY", name: "Japanese Yen (¥)", symbol: "¥" },
];

export const STORAGE_KEYS = {
  CONFIG: "daily_budget_config",
  DATA: "daily_budget_data",
  HISTORY: "daily_budget_history",
  THEME: "daily_budget_theme",
} as const;
