import { describe, it, expect } from "vitest";
import { generateRandomBudgetData } from "./algorithm";
import { BudgetConfig } from "@/types/budget";
import { getDaysInMonth, formatCurrency } from "./formatting";

describe("Month & Year Days Helper", () => {
  it("should calculate correct days for regular months", () => {
    expect(getDaysInMonth(2026, 1)).toBe(31); // Jan
    expect(getDaysInMonth(2026, 4)).toBe(30); // Apr
    expect(getDaysInMonth(2026, 7)).toBe(31); // Jul
    expect(getDaysInMonth(2026, 11)).toBe(30); // Nov
  });

  it("should calculate correct days for February in regular vs leap years", () => {
    expect(getDaysInMonth(2026, 2)).toBe(28); // Feb 2026 (Regular)
    expect(getDaysInMonth(2028, 2)).toBe(29); // Feb 2028 (Leap Year)
  });
});

describe("Multi-Currency Formatting Helper", () => {
  it("should format USD with 2 decimals", () => {
    expect(formatCurrency(2500, "USD")).toBe("$2,500.00");
  });

  it("should format VND with 0 decimals and ₫ symbol", () => {
    expect(formatCurrency(2500000, "VND")).toBe("₫2,500,000");
  });

  it("should format JPY with 0 decimals and ¥ symbol", () => {
    expect(formatCurrency(250000, "JPY")).toBe("¥250,000");
  });
});

describe("generateRandomBudgetData with Month & Year", () => {
  it("should generate exact requested number of rows for July (31 days) with ISO date strings", () => {
    const config: BudgetConfig = {
      year: 2026,
      month: 7, // July
      currency: "VND",
      minAmount: 100000,
      maxAmount: 500000,
      maxTotal: 10000000,
    };

    const items = generateRandomBudgetData(config);
    expect(items).toHaveLength(31);
    expect(items[0].dateStr).toBe("2026-07-01");
    expect(items[30].dateStr).toBe("2026-07-31");
  });

  it("should generate exact 29 rows for February 2028 (Leap Year)", () => {
    const config: BudgetConfig = {
      year: 2028,
      month: 2, // Feb 2028
      currency: "USD",
      minAmount: 10,
      maxAmount: 100,
      maxTotal: 1500,
    };

    const items = generateRandomBudgetData(config);
    expect(items).toHaveLength(29);
    expect(items[28].dateStr).toBe("2028-02-29");
  });

  it("should NEVER exceed maxTotal sum", () => {
    const config: BudgetConfig = {
      year: 2026,
      month: 2,
      currency: "JPY",
      minAmount: 1000,
      maxAmount: 10000,
      maxTotal: 150000,
    };

    const items = generateRandomBudgetData(config);
    const sum = items.reduce((acc, curr) => acc + curr.amount, 0);
    expect(Math.round(sum * 100) / 100).toBeLessThanOrEqual(150000);
  });

  it("should throw error if configuration is mathematically impossible", () => {
    const config: BudgetConfig = {
      year: 2026,
      month: 7, // 31 days
      currency: "USD",
      minAmount: 50,
      maxAmount: 100,
      maxTotal: 1000, // 31 * 50 = 1550 required minimum!
    };

    expect(() => generateRandomBudgetData(config)).toThrowError(
      /Maximum Total \(1000\) cannot be less than Days × Minimum \(31 × 50 = 1550\)/
    );
  });
});
