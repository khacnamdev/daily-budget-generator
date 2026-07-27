import { describe, it, expect } from "vitest";
import { generateRandomBudgetData } from "./algorithm";
import { BudgetConfig } from "@/types/budget";

describe("generateRandomBudgetData", () => {
  it("should generate exact requested number of days", () => {
    const config: BudgetConfig = {
      days: 15,
      minAmount: 10,
      maxAmount: 100,
      maxTotal: 1000,
    };

    const items = generateRandomBudgetData(config);
    expect(items).toHaveLength(15);
    expect(items[0].no).toBe(1);
    expect(items[14].no).toBe(15);
  });

  it("should enforce values stay between minAmount and maxAmount", () => {
    const config: BudgetConfig = {
      days: 30,
      minAmount: 5,
      maxAmount: 50,
      maxTotal: 1000,
    };

    const items = generateRandomBudgetData(config);
    items.forEach((item) => {
      expect(item.amount).toBeGreaterThanOrEqual(5);
      expect(item.amount).toBeLessThanOrEqual(50);
    });
  });

  it("should NEVER exceed maxTotal sum", () => {
    const config: BudgetConfig = {
      days: 31,
      minAmount: 10,
      maxAmount: 100,
      maxTotal: 1200,
    };

    const items = generateRandomBudgetData(config);
    const sum = items.reduce((acc, curr) => acc + curr.amount, 0);
    expect(Math.round(sum * 100) / 100).toBeLessThanOrEqual(1200);
  });

  it("should throw error if configuration is mathematically impossible", () => {
    const config: BudgetConfig = {
      days: 30,
      minAmount: 50,
      maxAmount: 100,
      maxTotal: 1000, // 30 * 50 = 1500 required minimum!
    };

    expect(() => generateRandomBudgetData(config)).toThrowError(
      /Maximum Total \(1000\) cannot be less than Days × Minimum \(30 × 50 = 1500\)/
    );
  });

  it("should produce different values on consecutive runs", () => {
    const config: BudgetConfig = {
      days: 20,
      minAmount: 10,
      maxAmount: 100,
      maxTotal: 1200,
    };

    const run1 = generateRandomBudgetData(config);
    const run2 = generateRandomBudgetData(config);

    const run1Amounts = run1.map((i) => i.amount);
    const run2Amounts = run2.map((i) => i.amount);

    expect(run1Amounts).not.toEqual(run2Amounts);
  });
});
