import { BudgetConfig, BudgetItem } from "@/types/budget";

/**
 * Random Generation Algorithm with Dynamic Bounded Sampling
 *
 * Key Design & Mathematical Principles:
 * 1. Feasibility Pre-validation:
 *    Checks if N * Min > MaxTotal. If so, mathematically impossible and throws a clear Error.
 * 2. Dynamic Feasible Bounds per Step:
 *    For day i out of N, with remaining sum target R and remaining days K = (N - i + 1):
 *    - Lower bound = max(Min, R - (K - 1) * Max)
 *    - Upper bound = min(Max, R - (K - 1) * Min)
 * 3. Centered Jitter Sampling (Avoiding End Bias):
 *    Sampling centered around expected average mean = R / K ensures that day 1 and day N
 *    have similar statistical expectations, preventing the common bug where the final items are forced to zero/tiny amounts.
 */
export function generateRandomBudgetData(config: BudgetConfig): BudgetItem[] {
  const { days, minAmount, maxAmount, maxTotal } = config;

  // 1. Feasibility checks
  if (days < 1 || days > 31) {
    throw new Error("Number of days must be between 1 and 31.");
  }

  if (minAmount >= maxAmount) {
    throw new Error("Minimum amount must be smaller than Maximum amount.");
  }

  const absoluteMinRequired = days * minAmount;
  if (maxTotal < absoluteMinRequired) {
    throw new Error(
      `Maximum Total (${maxTotal}) cannot be less than Days × Minimum (${days} × ${minAmount} = ${absoluteMinRequired}).`
    );
  }

  const STEP = minAmount >= 1000 || maxAmount >= 1000 ? 1000 : 1;
  const roundToStep = (val: number, step: number) => Math.round(val / step) * step;

  // 2. Determine target sum
  // Target sum between absolute min required and the upper theoretical cap min(maxTotal, days * maxAmount)
  const maxPossibleSum = Math.min(maxTotal, days * maxAmount);
  // Pick a natural target total (e.g. 75% to 98% of max possible sum, but at least absolute min)
  const fillRatio = 0.75 + Math.random() * 0.23; // between 0.75 and 0.98
  const targetSum = roundToStep(absoluteMinRequired + (maxPossibleSum - absoluteMinRequired) * fillRatio, STEP);

  const results: number[] = [];
  let currentRemaining = targetSum;

  for (let i = 0; i < days; i++) {
    const remainingDays = days - i;

    // Strict mathematical bounds for the current slot to ensure all remaining slots can be satisfied
    const minForCurrent = Math.max(
      minAmount,
      currentRemaining - (remainingDays - 1) * maxAmount
    );
    const maxForCurrent = Math.min(
      maxAmount,
      currentRemaining - (remainingDays - 1) * minAmount
    );

    if (minForCurrent > maxForCurrent) {
      // Fallback safeguard in case of precision edge cases
      const roundedMin = roundToStep(minForCurrent, STEP);
      results.push(roundedMin);
      currentRemaining -= roundedMin;
      continue;
    }

    // Expected mean for remaining days
    const mean = currentRemaining / remainingDays;

    // Triangular / Centered random sample around mean within [minForCurrent, maxForCurrent]
    const u1 = Math.random();
    const u2 = Math.random();
    const centeredRandom = (u1 + u2) / 2; // Triangular distribution around 0.5

    // Map centered random to range around mean
    const rangeSpan = maxForCurrent - minForCurrent;
    let sampledVal = minForCurrent + centeredRandom * rangeSpan;

    // Blend sampledVal towards average to smooth out extremes while maintaining variance
    sampledVal = sampledVal * 0.4 + mean * 0.6;

    // Ensure strict bounding and step value
    const boundedMin = Math.ceil(minForCurrent / STEP) * STEP;
    const boundedMax = Math.floor(maxForCurrent / STEP) * STEP;
    sampledVal = roundToStep(sampledVal, STEP);
    if (boundedMin <= boundedMax) {
      sampledVal = Math.max(boundedMin, Math.min(boundedMax, sampledVal));
    }

    results.push(sampledVal);
    currentRemaining -= sampledVal;
  }

  // 3. Post-process residual difference if any
  const sumGenerated = results.reduce((acc, val) => acc + val, 0);
  let diff = roundToStep(targetSum - sumGenerated, STEP);

  // Scatter residual difference across random indices
  let attempt = 0;
  while (Math.abs(diff) >= STEP && attempt < 100) {
    attempt++;
    const randomIndex = Math.floor(Math.random() * days);
    const stepDelta = diff > 0 ? STEP : -STEP;
    const newVal = results[randomIndex] + stepDelta;

    if (newVal >= minAmount && newVal <= maxAmount) {
      results[randomIndex] = newVal;
      diff -= stepDelta;
    }
  }

  // Final check: guarantee total never exceeds maxTotal
  const finalTotal = results.reduce((a, b) => a + b, 0);
  if (finalTotal > maxTotal) {
    let excess = roundToStep(finalTotal - maxTotal, STEP);
    for (let i = 0; i < days && excess > 0; i++) {
      const reducible = results[i] - minAmount;
      if (reducible >= STEP) {
        const sub = Math.min(Math.floor(reducible / STEP) * STEP, excess);
        results[i] -= sub;
        excess -= sub;
      }
    }
  }

  // Return formatted BudgetItem list with rounded amounts
  return results.map((val, idx) => ({
    no: idx + 1,
    day: idx + 1,
    dayLabel: `Day ${idx + 1}`,
    amount: roundToStep(val, STEP),
  }));
}
