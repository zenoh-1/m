/**
 * scoring.ts — Financial Cooked Score engine.
 *
 * Fully client-side, deterministic, no network. Inspired by Federal Reserve
 * Survey of Consumer Finances style benchmarks (see src/data/benchmarks.json).
 *
 * Scoring priority (highest impact first):
 *   1. Savings-to-income ratio
 *   2. Debt-to-income ratio
 *   3. Net savings (savings - debt)
 *   4. Age-adjusted financial progress
 *
 * Income alone never guarantees a high score — savings & debt dominate.
 *
 * For entertainment and educational purposes only. Not financial advice.
 */

import benchmarks from '../data/benchmarks.json';

export interface AssessmentInput {
  /** Age in years, 18–70 */
  age: number;
  /** Gross annual income in USD */
  income: number;
  /** Total savings + investments in USD */
  savings: number;
  /** Total debt in USD */
  debt: number;
}

export type StatusKey =
  | 'apocalypse'
  | 'deep-fried'
  | 'medium-rare'
  | 'stable'
  | 'cooking';

export interface StatusLevel {
  key: StatusKey;
  label: string;
  emoji: string;
  /** inclusive lower bound */
  min: number;
  /** inclusive upper bound */
  max: number;
}

export interface ScoreBreakdown {
  /** 0..1 sub-scores for transparency / debugging */
  savingsToIncome: number;
  debtToIncome: number;
  netSavings: number;
  ageAdjustedProgress: number;
}

export interface ScoreResult {
  input: AssessmentInput;
  /** Final Cooked Score, 0–100 */
  score: number;
  status: StatusLevel;
  /** "Ahead of X% of Americans your age", 1–99 */
  percentile: number;
  /** Estimated financial age in years */
  financialAge: number;
  /** Key ratios, rounded for display */
  metrics: {
    savingsToIncomeRatio: number;
    debtToIncomeRatio: number;
    netWorth: number;
    savingsMultipleTarget: number;
  };
  breakdown: ScoreBreakdown;
}

export const STATUS_LEVELS: StatusLevel[] = [
  { key: 'apocalypse', label: 'Financial Apocalypse', emoji: '☠️', min: 0, max: 20 },
  { key: 'deep-fried', label: 'Deep Fried', emoji: '🍗', min: 21, max: 40 },
  { key: 'medium-rare', label: 'Medium Rare', emoji: '🥩', min: 41, max: 60 },
  { key: 'stable', label: 'Financially Stable', emoji: '📈', min: 61, max: 80 },
  { key: 'cooking', label: 'Cooking Successfully', emoji: '🚀', min: 81, max: 100 },
];

const W = benchmarks.scoring.weights;
const CURVES = benchmarks.scoring.curves;
/**
 * Income floor used for all income-relative ratios. Without it, a tiny income
 * (e.g. $90) makes any savings look enormous and any debt ratio explode in a
 * way that can paradoxically out-score a larger, realistic income with the
 * same savings/debt. Flooring keeps the score monotonic and believable.
 */
const INCOME_FLOOR = benchmarks.scoring.incomeFloor ?? 15000;

/** Income used for ratio math: never below the floor. */
function effectiveIncome(income: number): number {
  return Math.max(income, INCOME_FLOOR);
}

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Piecewise-linear interpolation across an ordered list of [x, y] anchors.
 * Values outside the anchor range clamp to the nearest endpoint.
 */
function interpolate(anchors: number[][], x: number): number {
  if (anchors.length === 0) return 0;
  if (x <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (x >= last[0]) return last[1];

  for (let i = 0; i < anchors.length - 1; i++) {
    const [x0, y0] = anchors[i];
    const [x1, y1] = anchors[i + 1];
    if (x >= x0 && x <= x1) {
      const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

/** Sanitize raw form input into a safe, bounded AssessmentInput. */
export function normalizeInput(raw: Partial<AssessmentInput>): AssessmentInput {
  const age = clamp(Math.round(Number(raw.age) || 0), 18, 70);
  const income = Math.max(0, Number(raw.income) || 0);
  const savings = Math.max(0, Number(raw.savings) || 0);
  const debt = Math.max(0, Number(raw.debt) || 0);
  return { age, income, savings, debt };
}

/** Target savings multiple (× income) for a given age, per Fidelity-style guideposts. */
export function savingsMultipleTarget(age: number): number {
  const anchors = benchmarks.savingsMultipleTargets.map((t) => [t.age, t.target]);
  return interpolate(anchors, age);
}

/**
 * Estimate net-worth percentile for a person of a given age.
 * Uses per-age anchors (p10..p95) interpolated by age, then maps the user's
 * net worth onto a percentile via piecewise interpolation between breakpoints.
 * Returns 1..99.
 */
export function netWorthPercentile(age: number, netWorth: number): number {
  const rows = benchmarks.netWorthPercentilesByAge;

  // Find / interpolate the percentile breakpoints for this exact age.
  let lower = rows[0];
  let upper = rows[rows.length - 1];
  for (let i = 0; i < rows.length - 1; i++) {
    if (age >= rows[i].age && age <= rows[i + 1].age) {
      lower = rows[i];
      upper = rows[i + 1];
      break;
    }
  }
  const span = upper.age - lower.age;
  const t = span === 0 ? 0 : clamp((age - lower.age) / span, 0, 1);
  const lerp = (a: number, b: number) => a + t * (b - a);

  // Percentile breakpoints interpolated to the user's age.
  const points: Array<[number, number]> = [
    [lerp(lower.p10, upper.p10), 10],
    [lerp(lower.p25, upper.p25), 25],
    [lerp(lower.p50, upper.p50), 50],
    [lerp(lower.p75, upper.p75), 75],
    [lerp(lower.p90, upper.p90), 90],
    [lerp(lower.p95, upper.p95), 95],
  ];

  if (netWorth <= points[0][0]) {
    // Below p10: scale down toward 1.
    const floor = points[0][0] - Math.abs(points[0][0]) - 20000;
    const frac = clamp((netWorth - floor) / (points[0][0] - floor || 1), 0, 1);
    return clamp(Math.round(1 + frac * 9), 1, 99);
  }
  const top = points[points.length - 1];
  if (netWorth >= top[0]) {
    // Above p95: approach 99 asymptotically.
    const extra = clamp((netWorth - top[0]) / (top[0] || 1), 0, 1);
    return clamp(Math.round(95 + extra * 4), 1, 99);
  }

  for (let i = 0; i < points.length - 1; i++) {
    const [v0, pct0] = points[i];
    const [v1, pct1] = points[i + 1];
    if (netWorth >= v0 && netWorth <= v1) {
      const frac = v1 === v0 ? 0 : (netWorth - v0) / (v1 - v0);
      return clamp(Math.round(pct0 + frac * (pct1 - pct0)), 1, 99);
    }
  }
  return 50;
}

/**
 * Estimate a "financial age" — the age at which the user's savings multiple
 * would be on-track per the benchmark guideposts. Higher savings → younger
 * financial age; thin savings / heavy debt → older.
 */
export function estimateFinancialAge(input: AssessmentInput): number {
  const { age, savings, debt } = input;
  const netWorth = savings - debt;
  // Floor income to keep the effective-multiple math consistent with scoring.
  const income = effectiveIncome(input.income);

  // Effective multiple of income the user has banked (net of debt).
  const effectiveMultiple = netWorth / income;

  const targets = benchmarks.savingsMultipleTargets;

  // Find the age whose target multiple matches the user's effective multiple.
  let matchedAge = targets[0].age;
  if (effectiveMultiple <= targets[0].target) {
    // Below the youngest target — extrapolate older (behind schedule).
    matchedAge = targets[0].age;
  } else if (effectiveMultiple >= targets[targets.length - 1].target) {
    matchedAge = targets[targets.length - 1].age;
  } else {
    for (let i = 0; i < targets.length - 1; i++) {
      if (
        effectiveMultiple >= targets[i].target &&
        effectiveMultiple <= targets[i + 1].target
      ) {
        const frac =
          (effectiveMultiple - targets[i].target) /
          (targets[i + 1].target - targets[i].target);
        matchedAge = targets[i].age + frac * (targets[i + 1].age - targets[i].age);
        break;
      }
    }
  }

  // Financial age = real age shifted by how far ahead/behind the curve they are.
  // If their effective multiple matches an older target age, they're "ahead"
  // (younger financial age); if it matches a younger target, they're "behind".
  const onTrackMultiple = savingsMultipleTarget(age);
  let financialAge: number;
  if (effectiveMultiple >= onTrackMultiple) {
    // Ahead of schedule → financial age is younger than real age.
    const ahead = matchedAge - age; // positive
    financialAge = age - clamp(ahead, 0, 25);
  } else {
    // Behind schedule → financial age is older than real age.
    const behind = age - matchedAge; // positive
    financialAge = age + clamp(behind, 0, 30);
  }

  // Debt with no savings ages you further.
  if (netWorth < 0) {
    financialAge += clamp(Math.abs(netWorth) / income, 0, 1) * 6;
  }

  return clamp(Math.round(financialAge), 18, 99);
}

/** Compute the four normalized (0..1) sub-scores. */
function computeBreakdown(input: AssessmentInput): ScoreBreakdown {
  const { savings, debt } = input;
  const netWorth = savings - debt;
  // Floor income so sub-poverty incomes can't inflate income-relative ratios.
  const income = effectiveIncome(input.income);

  const savingsRatio = savings / income;
  const debtRatio = debt / income;
  const netSavingsRatio = netWorth / income;

  const savingsToIncome = interpolate(CURVES.savingsToIncome, savingsRatio);
  const debtToIncome = interpolate(CURVES.debtToIncome, debtRatio);
  const netSavings = interpolate(CURVES.netSavingsRatio, netSavingsRatio);

  // Age-adjusted progress: how close are they to their on-track savings multiple?
  const target = savingsMultipleTarget(input.age);
  const effectiveMultiple = netWorth / income;
  const ageAdjustedProgress = clamp(
    target > 0 ? effectiveMultiple / target : effectiveMultiple > 0 ? 1 : 0,
    0,
    1.1,
  );

  return {
    savingsToIncome,
    debtToIncome,
    netSavings,
    ageAdjustedProgress: clamp(ageAdjustedProgress, 0, 1),
  };
}

/** Map a 0–100 score to its status level. */
export function getStatusLevel(score: number): StatusLevel {
  const s = clamp(Math.round(score), 0, 100);
  return STATUS_LEVELS.find((l) => s >= l.min && s <= l.max) ?? STATUS_LEVELS[0];
}

/**
 * Main entry point: compute the full Cooked Score result from raw input.
 */
export function calculateScore(raw: Partial<AssessmentInput>): ScoreResult {
  const input = normalizeInput(raw);
  const { income, savings, debt } = input;
  const netWorth = savings - debt;

  const breakdown = computeBreakdown(input);

  const weighted =
    breakdown.savingsToIncome * W.savingsToIncome +
    breakdown.debtToIncome * W.debtToIncome +
    breakdown.netSavings * W.netSavings +
    breakdown.ageAdjustedProgress * W.ageAdjustedProgress;

  const score = clamp(Math.round(weighted * 100), 0, 100);
  const status = getStatusLevel(score);
  const percentile = netWorthPercentile(input.age, netWorth);
  const financialAge = estimateFinancialAge(input);

  return {
    input,
    score,
    status,
    percentile,
    financialAge,
    metrics: {
      savingsToIncomeRatio: round(savings / effectiveIncome(income), 2),
      debtToIncomeRatio: round(debt / effectiveIncome(income), 2),
      netWorth,
      savingsMultipleTarget: round(savingsMultipleTarget(input.age), 1),
    },
    breakdown,
  };
}

function round(n: number, places: number): number {
  const f = Math.pow(10, places);
  return Math.round(n * f) / f;
}
