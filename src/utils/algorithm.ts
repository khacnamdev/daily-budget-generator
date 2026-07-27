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
  const maxPossibleSum = Math.min(maxTotal, days * maxAmount);
  const fillRatio = maxPossibleSum > absoluteMinRequired ? 0.3 + Math.random() * 0.6 : 1;
  const targetSum = roundToStep(absoluteMinRequired + (maxPossibleSum - absoluteMinRequired) * fillRatio, STEP);

  const results: number[] = [];
  let currentRemaining = targetSum;
  const usedFreqMap = new Map<number, number>();

  for (let i = 0; i < days; i++) {
    const remainingDays = days - i;

    const minForCurrent = Math.max(
      minAmount,
      currentRemaining - (remainingDays - 1) * maxAmount
    );
    const maxForCurrent = Math.min(
      maxAmount,
      currentRemaining - (remainingDays - 1) * minAmount
    );

    const boundedMin = Math.ceil(minForCurrent / STEP) * STEP;
    const boundedMax = Math.floor(maxForCurrent / STEP) * STEP;

    if (boundedMin >= boundedMax) {
      const val = boundedMin;
      results.push(val);
      usedFreqMap.set(val, (usedFreqMap.get(val) || 0) + 1);
      currentRemaining -= val;
      continue;
    }

    const stepsCount = Math.floor((boundedMax - boundedMin) / STEP);

    // Build candidate pool prioritising unused / least frequently used values
    const candidates: number[] = [];
    let minFreq = Infinity;

    for (let s = 0; s <= stepsCount; s++) {
      const candidateVal = boundedMin + s * STEP;
      const freq = usedFreqMap.get(candidateVal) || 0;
      if (freq < minFreq) {
        minFreq = freq;
        candidates.length = 0;
        candidates.push(candidateVal);
      } else if (freq === minFreq) {
        candidates.push(candidateVal);
      }
    }

    const sampledVal = candidates[Math.floor(Math.random() * candidates.length)];
    results.push(sampledVal);
    usedFreqMap.set(sampledVal, (usedFreqMap.get(sampledVal) || 0) + 1);
    currentRemaining -= sampledVal;
  }

  // 3. Post-process residual difference if any
  const sumGenerated = results.reduce((acc, val) => acc + val, 0);
  let diff = roundToStep(targetSum - sumGenerated, STEP);

  let attempt = 0;
  while (Math.abs(diff) >= STEP && attempt < 300) {
    attempt++;
    const randomIndex = Math.floor(Math.random() * days);
    const stepDelta = diff > 0 ? STEP : -STEP;
    const newVal = results[randomIndex] + stepDelta;

    if (newVal >= minAmount && newVal <= maxAmount) {
      results[randomIndex] = newVal;
      diff -= stepDelta;
    }
  }

  // 4. Deduplication Pass: reduce duplicates to 0 or 1-2 max if range permits
  let dupPassAttempts = 0;
  while (dupPassAttempts < 300) {
    dupPassAttempts++;
    const freq = new Map<number, number>();
    for (const val of results) {
      freq.set(val, (freq.get(val) || 0) + 1);
    }

    let targetDupVal: number | null = null;
    for (const [val, count] of freq.entries()) {
      if (count > 1) {
        targetDupVal = val;
        break;
      }
    }

    if (targetDupVal === null) break;

    const i = results.findIndex((v) => v === targetDupVal);
    if (i === -1) break;

    let fixed = false;
    for (let s = 1; s <= 50 && !fixed; s++) {
      for (const sign of [1, -1]) {
        const delta = sign * s * STEP;
        const newIVal = results[i] + delta;
        if (newIVal < minAmount || newIVal > maxAmount) continue;

        const newIFreq = freq.get(newIVal) || 0;
        if (newIFreq >= (freq.get(targetDupVal) || 0) - 1) continue;

        for (let j = 0; j < results.length; j++) {
          if (i === j) continue;
          const newJVal = results[j] - delta;
          if (newJVal < minAmount || newJVal > maxAmount) continue;

          const oldJVal = results[j];
          const oldJFreq = freq.get(oldJVal) || 0;
          const newJFreq = (freq.get(newJVal) || 0) + (newJVal === newIVal ? 1 : 0);

          if (newJFreq < oldJFreq) {
            results[i] = newIVal;
            results[j] = newJVal;
            fixed = true;
            break;
          }
        }
      }
    }

    if (!fixed) break;
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

  // 5. Fisher-Yates Shuffle
  for (let i = results.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [results[i], results[j]] = [results[j], results[i]];
  }

  // Return formatted BudgetItem list with rounded amounts
  return results.map((val, idx) => ({
    no: idx + 1,
    day: idx + 1,
    dayLabel: `Day ${idx + 1}`,
    amount: roundToStep(val, STEP),
  }));
}
