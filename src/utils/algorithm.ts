import { BudgetConfig, BudgetItem } from "@/types/budget";
import { getDaysInMonth, formatDateIso } from "./formatting";

/**
 * Random Generation Algorithm with Dynamic Bounded Sampling
 *
 * Automatically calculates total days for the selected Month & Year (handling leap years).
 * Maps every entry to its exact calendar ISO date (e.g. 2026-07-01).
 */
export function generateRandomBudgetData(config: BudgetConfig): BudgetItem[] {
  const { year, month, minAmount, maxAmount, maxTotal } = config;

  const days = getDaysInMonth(year, month);

  // 1. Feasibility checks
  if (minAmount >= maxAmount) {
    throw new Error("Minimum amount must be smaller than Maximum amount.");
  }

  const absoluteMinRequired = days * minAmount;
  if (maxTotal < absoluteMinRequired) {
    throw new Error(
      `Maximum Total (${maxTotal}) cannot be less than Days × Minimum (${days} × ${minAmount} = ${absoluteMinRequired}).`
    );
  }

  // 2. Determine target sum
  const maxPossibleSum = Math.min(maxTotal, days * maxAmount);
  const fillRatio = 0.75 + Math.random() * 0.23; // between 0.75 and 0.98
  let targetSum = absoluteMinRequired + (maxPossibleSum - absoluteMinRequired) * fillRatio;
  targetSum = Math.round(targetSum * 100) / 100;

  const results: number[] = [];
  let currentRemaining = targetSum;

  for (let i = 0; i < days; i++) {
    const remainingDays = days - i;

    // Strict mathematical bounds for the current slot
    const minForCurrent = Math.max(
      minAmount,
      currentRemaining - (remainingDays - 1) * maxAmount
    );
    const maxForCurrent = Math.min(
      maxAmount,
      currentRemaining - (remainingDays - 1) * minAmount
    );

    if (minForCurrent > maxForCurrent) {
      results.push(Math.round(minForCurrent * 100) / 100);
      currentRemaining -= minForCurrent;
      continue;
    }

    const mean = currentRemaining / remainingDays;

    const u1 = Math.random();
    const u2 = Math.random();
    const centeredRandom = (u1 + u2) / 2;

    const rangeSpan = maxForCurrent - minForCurrent;
    let sampledVal = minForCurrent + centeredRandom * rangeSpan;

    sampledVal = sampledVal * 0.4 + mean * 0.6;
    sampledVal = Math.max(minForCurrent, Math.min(maxForCurrent, sampledVal));
    sampledVal = Math.round(sampledVal * 100) / 100;

    results.push(sampledVal);
    currentRemaining -= sampledVal;
  }

  // 3. Post-process residual cents
  const sumGenerated = results.reduce((acc, val) => acc + val, 0);
  let diff = Math.round((targetSum - sumGenerated) * 100) / 100;

  let attempt = 0;
  while (Math.abs(diff) >= 0.01 && attempt < 100) {
    attempt++;
    const randomIndex = Math.floor(Math.random() * days);
    const step = diff > 0 ? 0.01 : -0.01;
    const newVal = Math.round((results[randomIndex] + step) * 100) / 100;

    if (newVal >= minAmount && newVal <= maxAmount) {
      results[randomIndex] = newVal;
      diff = Math.round((diff - step) * 100) / 100;
    }
  }

  // Final check: guarantee total never exceeds maxTotal
  const finalTotal = results.reduce((a, b) => a + b, 0);
  if (finalTotal > maxTotal) {
    let excess = Math.round((finalTotal - maxTotal) * 100) / 100;
    for (let i = 0; i < days && excess > 0; i++) {
      const reducible = Math.round((results[i] - minAmount) * 100) / 100;
      if (reducible > 0) {
        const sub = Math.min(reducible, excess);
        results[i] = Math.round((results[i] - sub) * 100) / 100;
        excess = Math.round((excess - sub) * 100) / 100;
      }
    }
  }

  // Return formatted BudgetItem list with actual ISO date strings
  return results.map((val, idx) => {
    const dayNumber = idx + 1;
    const dateStr = formatDateIso(year, month, dayNumber);
    return {
      no: dayNumber,
      day: dayNumber,
      dateStr,
      dayLabel: dateStr,
      amount: Math.round(val * 100) / 100,
    };
  });
}
