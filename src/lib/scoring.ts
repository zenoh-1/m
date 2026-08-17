/**
 * Cooked Finance educational score engine.
 *
 * The calculation is fully client-side, deterministic, and intentionally
 * narrow. It summarizes four entered ratios; it does not estimate a
 * percentile, creditworthiness, net worth, or a personalized financial plan.
 */

import benchmarks from '../data/benchmarks.json';

export interface AssessmentInput {
  /** Age in whole years. */
  age: number;
  /** Gross annual income, before taxes and deductions. */
  annualIncome: number;
  /** Monthly must-pay living costs, excluding savings. */
  monthlyEssentialExpenses: number;
  /** Cash that is readily available for an emergency. */
  liquidSavings: number;
  /** Required monthly payments across all debts. */
  monthlyDebtPayments: number;
  /** Current balance in retirement-focused accounts. */
  retirementInvestments: number;
  /** Amount currently added to savings and investments each month. */
  monthlySavings: number;
}

export type PillarKey =
  | 'cashBuffer'
  | 'debtBurden'
  | 'savingsHabit'
  | 'longTermProgress';

export type StatusKey =
  | 'needs-attention'
  | 'running-hot'
  | 'finding-balance'
  | 'steady-heat'
  | 'cooking-confidently';

export interface StatusLevel {
  key: StatusKey;
  label: string;
  emoji: string;
  summary: string;
  /** Inclusive lower bound. */
  min: number;
  /** Inclusive upper bound. */
  max: number;
}

export interface PillarScores {
  cashBuffer: number;
  debtBurden: number;
  savingsHabit: number;
  longTermProgress: number;
}

export interface ScoreMetrics {
  grossMonthlyIncome: number;
  /** liquidSavings / monthlyEssentialExpenses; null when expenses are zero. */
  cashBufferMonths: number | null;
  /** monthlyDebtPayments / grossMonthlyIncome; null when income is zero. */
  debtToIncomeRatio: number | null;
  /** The same DTI value expressed from 0 to 100+ for display. */
  debtToIncomePercent: number | null;
  /** monthlySavings / grossMonthlyIncome; null when income is zero. */
  savingsRate: number | null;
  /** The same savings-rate value expressed as a percentage. */
  savingsRatePercent: number | null;
  /** retirementInvestments / annualIncome; null when income is zero. */
  retirementSavingsMultiple: number | null;
  retirementTargetMultiple: number;
  retirementTargetAmount: number;
  /** Current multiple / modeled target; null when income is zero. */
  retirementProgressRatio: number | null;
}

export interface ScoreFactor {
  key: PillarKey;
  label: string;
  /** Decimal weight; e.g. 0.30 means 30% of the total score. */
  weight: number;
  /** Pillar score, 0–100. */
  score: number;
  /** Contribution to the final 0–100 score. */
  weightedPoints: number;
  metricLabel: string;
  benchmarkLabel: string;
  explanation: string;
  sourceIds: string[];
  sourceUrls: string[];
}

export interface ScoreStrength {
  pillar: PillarKey | 'overall';
  title: string;
  description: string;
}

export interface PrioritizedNextMove {
  priority: 1 | 2 | 3;
  pillar: PillarKey;
  title: string;
  description: string;
  /** Optional dollar target used by the UI; not a recommendation or forecast. */
  suggestedTargetAmount?: number;
}

export interface ScoreResult {
  input: AssessmentInput;
  /** Final Cooked Score, rounded to an integer from 0 to 100. */
  score: number;
  status: StatusLevel;
  metrics: ScoreMetrics;
  pillarScores: PillarScores;
  factors: ScoreFactor[];
  strengths: ScoreStrength[];
  nextMoves: PrioritizedNextMove[];
  warnings: string[];
  methodologyVersion: string;
  educationalEstimate: true;
  disclosure: string;
}

export const STATUS_LEVELS: StatusLevel[] = [
  {
    key: 'needs-attention',
    label: 'Needs Attention',
    emoji: '🧭',
    summary: 'A few foundations need attention. Start with one manageable move.',
    min: 0,
    max: 24,
  },
  {
    key: 'running-hot',
    label: 'Running Hot',
    emoji: '🔥',
    summary: 'Some pressure is showing, but the clearest improvements are within reach.',
    min: 25,
    max: 44,
  },
  {
    key: 'finding-balance',
    label: 'Finding Balance',
    emoji: '⚖️',
    summary: 'The foundation is taking shape, with room to strengthen a few pillars.',
    min: 45,
    max: 64,
  },
  {
    key: 'steady-heat',
    label: 'Steady Heat',
    emoji: '🌤️',
    summary: 'Several healthy foundations are working together. Keep the rhythm going.',
    min: 65,
    max: 84,
  },
  {
    key: 'cooking-confidently',
    label: 'Cooking Confidently',
    emoji: '✨',
    summary: 'The entered figures show strong foundations across most or all pillars.',
    min: 85,
    max: 100,
  },
];

export const SCORE_DISCLOSURE = benchmarks._meta.disclaimer;
export const METHODOLOGY_VERSION = benchmarks._meta.version;

export const PILLAR_WEIGHTS: Record<PillarKey, number> = {
  cashBuffer: benchmarks.scoring.weights.cashBuffer,
  debtBurden: benchmarks.scoring.weights.debtBurden,
  savingsHabit: benchmarks.scoring.weights.savingsHabit,
  longTermProgress: benchmarks.scoring.weights.longTermProgress,
};

const CURVES = benchmarks.scoring.curves;
const MONEY_CAP = Number.MAX_SAFE_INTEGER;

/** Clamp a number into [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Piecewise-linear interpolation across ordered [x, y] anchors.
 * Values outside the range clamp to the nearest endpoint.
 */
function interpolate(anchors: number[][], x: number): number {
  if (anchors.length === 0) return 0;
  if (x <= anchors[0][0]) return anchors[0][1];

  const last = anchors[anchors.length - 1];
  if (x >= last[0]) return last[1];

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const [x0, y0] = anchors[index];
    const [x1, y1] = anchors[index + 1];
    if (x >= x0 && x <= x1) {
      const progress = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      return y0 + progress * (y1 - y0);
    }
  }

  return last[1];
}

/** Sanitize raw form values into finite, non-negative dollar amounts. */
export function normalizeInput(raw: Partial<AssessmentInput>): AssessmentInput {
  const ageValue = Number(raw.age);
  const age = clamp(Number.isFinite(ageValue) ? Math.round(ageValue) : 18, 18, 100);

  return {
    age,
    annualIncome: normalizeMoney(raw.annualIncome),
    monthlyEssentialExpenses: normalizeMoney(raw.monthlyEssentialExpenses),
    liquidSavings: normalizeMoney(raw.liquidSavings),
    monthlyDebtPayments: normalizeMoney(raw.monthlyDebtPayments),
    retirementInvestments: normalizeMoney(raw.retirementInvestments),
    monthlySavings: normalizeMoney(raw.monthlySavings),
  };
}

/**
 * Retirement-savings multiple used by the long-term pillar.
 * Published Fidelity ages are linearly interpolated; the explicit early-career
 * floor and interpolation are documented in benchmarks.json.
 */
export function retirementSavingsMultipleTarget(age: number): number {
  const normalizedAge = clamp(Number.isFinite(age) ? age : 18, 18, 100);
  const guideposts = benchmarks.retirementGuideposts.published;
  const early = benchmarks.retirementGuideposts.earlyCareerModel;
  const first = guideposts[0];

  if (normalizedAge <= early.throughAge) return early.minimumTarget;

  if (normalizedAge < early.firstPublishedAge) {
    const progress =
      (normalizedAge - early.throughAge) /
      (early.firstPublishedAge - early.throughAge);
    return round(
      early.minimumTarget + progress * (first.target - early.minimumTarget),
      2,
    );
  }

  return round(
    interpolate(
      guideposts.map((guidepost) => [guidepost.age, guidepost.target]),
      normalizedAge,
    ),
    2,
  );
}

/** Backwards-friendly name for callers that only need the guidepost. */
export const savingsMultipleTarget = retirementSavingsMultipleTarget;

/** Map a 0–100 score to its supportive status band. */
export function getStatusLevel(score: number): StatusLevel {
  const normalizedScore = clamp(Math.round(score), 0, 100);
  return (
    STATUS_LEVELS.find(
      (level) => normalizedScore >= level.min && normalizedScore <= level.max,
    ) ?? STATUS_LEVELS[0]
  );
}

/** Calculate a result from a base assessment with one or more changed values. */
export function calculateScenario(
  base: AssessmentInput,
  changes: Partial<AssessmentInput>,
): ScoreResult {
  return calculateScore({ ...base, ...changes });
}

/** Main deterministic scoring entry point. */
export function calculateScore(raw: Partial<AssessmentInput>): ScoreResult {
  const input = normalizeInput(raw);
  const grossMonthlyIncome = input.annualIncome / 12;

  const cashBufferMonths = safeRatio(
    input.liquidSavings,
    input.monthlyEssentialExpenses,
  );
  const debtToIncomeRatio = safeRatio(
    input.monthlyDebtPayments,
    grossMonthlyIncome,
  );
  const savingsRate = safeRatio(input.monthlySavings, grossMonthlyIncome);
  const retirementSavingsMultiple = safeRatio(
    input.retirementInvestments,
    input.annualIncome,
  );
  const retirementTargetMultiple = retirementSavingsMultipleTarget(input.age);
  const retirementProgressRatio =
    retirementSavingsMultiple === null
      ? null
      : retirementSavingsMultiple / retirementTargetMultiple;

  const pillarScores: PillarScores = {
    cashBuffer: scoreMetric(CURVES.cashBufferMonths, cashBufferMonths),
    debtBurden: scoreMetric(CURVES.debtToIncomeRatio, debtToIncomeRatio),
    savingsHabit: scoreMetric(CURVES.monthlySavingsRate, savingsRate),
    longTermProgress: scoreMetric(
      CURVES.retirementTargetProgress,
      retirementProgressRatio,
    ),
  };

  const metrics: ScoreMetrics = {
    grossMonthlyIncome: round(grossMonthlyIncome, 2),
    cashBufferMonths: nullableRound(cashBufferMonths, 2),
    debtToIncomeRatio: nullableRound(debtToIncomeRatio, 4),
    debtToIncomePercent: nullableRound(
      debtToIncomeRatio === null ? null : debtToIncomeRatio * 100,
      1,
    ),
    savingsRate: nullableRound(savingsRate, 4),
    savingsRatePercent: nullableRound(
      savingsRate === null ? null : savingsRate * 100,
      1,
    ),
    retirementSavingsMultiple: nullableRound(retirementSavingsMultiple, 2),
    retirementTargetMultiple,
    retirementTargetAmount: round(
      retirementTargetMultiple * input.annualIncome,
      2,
    ),
    retirementProgressRatio: nullableRound(retirementProgressRatio, 3),
  };

  const factors = buildFactors(pillarScores, metrics);
  const score = clamp(
    Math.round(factors.reduce((total, factor) => total + factor.weightedPoints, 0)),
    0,
    100,
  );

  return {
    input,
    score,
    status: getStatusLevel(score),
    metrics,
    pillarScores,
    factors,
    strengths: buildStrengths(input, metrics, pillarScores),
    nextMoves: buildNextMoves(input, metrics, pillarScores),
    warnings: buildWarnings(input, metrics),
    methodologyVersion: METHODOLOGY_VERSION,
    educationalEstimate: true,
    disclosure: SCORE_DISCLOSURE,
  };
}

function buildFactors(scores: PillarScores, metrics: ScoreMetrics): ScoreFactor[] {
  const cashMonths = metrics.cashBufferMonths;
  const dtiPercent = metrics.debtToIncomePercent;
  const savingsPercent = metrics.savingsRatePercent;
  const retirementMultiple = metrics.retirementSavingsMultiple;

  return [
    makeFactor(
      'cashBuffer',
      'Cash buffer',
      scores.cashBuffer,
      cashMonths === null ? 'Not available' : `${formatNumber(cashMonths)} months`,
      'General guidepost: 3–6 months of essential expenses',
      cashMonths === null
        ? 'A cash-buffer ratio needs a non-zero essential-expense amount.'
        : `Liquid savings cover about ${formatNumber(cashMonths)} months of the entered essential expenses. Full pillar credit begins at 6 months.`,
      ['fidelity-emergency-savings'],
    ),
    makeFactor(
      'debtBurden',
      'Debt burden',
      scores.debtBurden,
      dtiPercent === null ? 'Not available' : `${formatNumber(dtiPercent)}% DTI`,
      'Monthly debt payments ÷ gross monthly income',
      dtiPercent === null
        ? 'DTI needs a non-zero gross income amount.'
        : `${formatNumber(dtiPercent)}% of gross monthly income goes to the entered monthly debt payments. Lower payment burden receives more pillar credit.`,
      ['cfpb-dti-definition'],
    ),
    makeFactor(
      'savingsHabit',
      'Savings habit',
      scores.savingsHabit,
      savingsPercent === null
        ? 'Not available'
        : `${formatNumber(savingsPercent)}% saved monthly`,
      'Cooked Finance scale: 15% is strong; 20% earns full credit',
      savingsPercent === null
        ? 'A savings-rate ratio needs a non-zero gross income amount.'
        : `The entered monthly savings equal about ${formatNumber(savingsPercent)}% of gross monthly income. Fidelity's 15% retirement guideline informs the scale, though this input may also include non-retirement saving.`,
      ['fidelity-retirement-guideposts'],
    ),
    makeFactor(
      'longTermProgress',
      'Long-term progress',
      scores.longTermProgress,
      retirementMultiple === null
        ? 'Not available'
        : `${formatNumber(retirementMultiple)}× annual income`,
      `${formatNumber(metrics.retirementTargetMultiple)}× modeled age guidepost`,
      retirementMultiple === null
        ? 'Long-term progress needs a non-zero gross annual income amount.'
        : `Retirement investments equal about ${formatNumber(retirementMultiple)}× annual income, compared with a ${formatNumber(metrics.retirementTargetMultiple)}× broad age guidepost. Published guidepost ages are linearly interpolated.`,
      ['fidelity-retirement-guideposts'],
    ),
  ];
}

function makeFactor(
  key: PillarKey,
  label: string,
  score: number,
  metricLabel: string,
  benchmarkLabel: string,
  explanation: string,
  sourceIds: string[],
): ScoreFactor {
  const weight = PILLAR_WEIGHTS[key];
  return {
    key,
    label,
    weight,
    score,
    weightedPoints: round(score * weight, 2),
    metricLabel,
    benchmarkLabel,
    explanation,
    sourceIds,
    sourceUrls: sourceIds.map(sourceUrl),
  };
}

function buildStrengths(
  input: AssessmentInput,
  metrics: ScoreMetrics,
  scores: PillarScores,
): ScoreStrength[] {
  const strengths: ScoreStrength[] = [];

  if (scores.cashBuffer >= 75 && metrics.cashBufferMonths !== null) {
    strengths.push({
      pillar: 'cashBuffer',
      title: 'A meaningful cash cushion',
      description: `Liquid savings cover about ${formatNumber(metrics.cashBufferMonths)} months of essential expenses.`,
    });
  } else if (scores.cashBuffer >= 20 && input.liquidSavings > 0) {
    strengths.push({
      pillar: 'cashBuffer',
      title: 'Your cash buffer is underway',
      description: 'You already have liquid savings to build on.',
    });
  }

  if (scores.debtBurden >= 75 && metrics.debtToIncomePercent !== null) {
    strengths.push({
      pillar: 'debtBurden',
      title: 'Relatively light monthly debt pressure',
      description: `Entered debt payments use about ${formatNumber(metrics.debtToIncomePercent)}% of gross monthly income.`,
    });
  }

  if (scores.savingsHabit >= 65 && metrics.savingsRatePercent !== null) {
    strengths.push({
      pillar: 'savingsHabit',
      title: 'A consistent savings habit',
      description: `You are directing about ${formatNumber(metrics.savingsRatePercent)}% of gross monthly income to savings and investments.`,
    });
  } else if (scores.savingsHabit >= 20 && input.monthlySavings > 0) {
    strengths.push({
      pillar: 'savingsHabit',
      title: 'Monthly saving is already in motion',
      description: 'A repeatable contribution is a useful foundation to grow.',
    });
  }

  if (scores.longTermProgress >= 78) {
    strengths.push({
      pillar: 'longTermProgress',
      title: 'Close to or above the broad age guidepost',
      description: 'The entered retirement balance shows substantial long-term progress.',
    });
  } else if (scores.longTermProgress >= 20 && input.retirementInvestments > 0) {
    strengths.push({
      pillar: 'longTermProgress',
      title: 'Long-term investing has started',
      description: 'You have retirement-focused investments already working toward the future.',
    });
  }

  if (strengths.length === 0) {
    strengths.push({
      pillar: 'overall',
      title: 'You have a clear starting point',
      description: 'Completing the check makes the next useful step easier to identify.',
    });
  }

  const scoreFor = (strength: ScoreStrength): number =>
    strength.pillar === 'overall' ? -1 : scores[strength.pillar];

  return dedupeByTitle(strengths)
    .sort((a, b) => scoreFor(b) - scoreFor(a))
    .slice(0, 3);
}

interface MoveCandidate {
  pillar: PillarKey;
  title: string;
  description: string;
  suggestedTargetAmount?: number;
  opportunity: number;
}

function buildNextMoves(
  input: AssessmentInput,
  metrics: ScoreMetrics,
  scores: PillarScores,
): PrioritizedNextMove[] {
  const candidates: MoveCandidate[] = [
    cashBufferMove(input, metrics, scores.cashBuffer),
    debtBurdenMove(metrics, scores.debtBurden),
    savingsHabitMove(input, metrics, scores.savingsHabit),
    longTermMove(input, metrics, scores.longTermProgress),
  ];

  return candidates
    .sort((a, b) => b.opportunity - a.opportunity)
    .slice(0, 3)
    .map(({ opportunity: _opportunity, ...move }, index) => ({
      ...move,
      priority: (index + 1) as 1 | 2 | 3,
    }));
}

function cashBufferMove(
  input: AssessmentInput,
  metrics: ScoreMetrics,
  score: number,
): MoveCandidate {
  const opportunity = (100 - score) * PILLAR_WEIGHTS.cashBuffer;
  const months = metrics.cashBufferMonths;

  if (months === null) {
    return {
      pillar: 'cashBuffer',
      title: 'Confirm essential monthly expenses',
      description: 'Enter a realistic must-pay monthly amount so the cash cushion can be assessed.',
      opportunity,
    };
  }

  const nextMonths = months < 1 ? 1 : months < 3 ? 3 : months < 6 ? 6 : 6;
  const target = round(input.monthlyEssentialExpenses * nextMonths, 2);

  if (months >= 6) {
    return {
      pillar: 'cashBuffer',
      title: 'Keep the cash buffer accessible',
      description: 'Review the amount after major expense changes and replenish it after use.',
      suggestedTargetAmount: target,
      opportunity,
    };
  }

  return {
    pillar: 'cashBuffer',
    title: `Build toward ${nextMonths} month${nextMonths === 1 ? '' : 's'} of essentials`,
    description: `A staged target keeps the broader 3–6 month guidepost manageable. The next modeled checkpoint is ${formatCurrency(target)}.`,
    suggestedTargetAmount: target,
    opportunity,
  };
}

function debtBurdenMove(
  metrics: ScoreMetrics,
  score: number,
): MoveCandidate {
  const opportunity = (100 - score) * PILLAR_WEIGHTS.debtBurden;
  const dti = metrics.debtToIncomeRatio;

  if (dti === null) {
    return {
      pillar: 'debtBurden',
      title: 'Confirm gross annual income',
      description: 'A non-zero income is needed to calculate the standard debt-to-income ratio.',
      opportunity,
    };
  }

  if (dti > 0.43) {
    return {
      pillar: 'debtBurden',
      title: 'Reduce monthly debt pressure first',
      description: 'Review required payments and borrowing costs, then choose a sustainable payoff step without draining essential cash.',
      opportunity,
    };
  }

  if (dti > 0.3) {
    return {
      pillar: 'debtBurden',
      title: 'Create more room around debt payments',
      description: 'Look for a realistic way to lower required monthly payments or avoid adding new high-cost debt.',
      opportunity,
    };
  }

  return {
    pillar: 'debtBurden',
    title: 'Protect the manageable debt load',
    description: 'Keep payments on time and reassess before taking on another recurring obligation.',
    opportunity,
  };
}

function savingsHabitMove(
  input: AssessmentInput,
  metrics: ScoreMetrics,
  score: number,
): MoveCandidate {
  const opportunity = (100 - score) * PILLAR_WEIGHTS.savingsHabit;
  const rate = metrics.savingsRate;

  if (rate === null) {
    return {
      pillar: 'savingsHabit',
      title: 'Confirm gross annual income',
      description: 'A non-zero income is needed to assess the monthly savings rate.',
      opportunity,
    };
  }

  const targetRate = rate < 0.05 ? 0.05 : rate < 0.1 ? 0.1 : rate < 0.15 ? 0.15 : 0.2;
  const targetAmount = round(metrics.grossMonthlyIncome * targetRate, 2);

  if (rate >= 0.2) {
    return {
      pillar: 'savingsHabit',
      title: 'Keep the savings habit automatic',
      description: 'Review the amount after income or goal changes rather than relying on memory each month.',
      suggestedTargetAmount: round(input.monthlySavings, 2),
      opportunity,
    };
  }

  return {
    pillar: 'savingsHabit',
    title: `Test a ${Math.round(targetRate * 100)}% savings checkpoint`,
    description: `If cash flow allows, work gradually toward about ${formatCurrency(targetAmount)} per month rather than changing everything at once.`,
    suggestedTargetAmount: targetAmount,
    opportunity,
  };
}

function longTermMove(
  input: AssessmentInput,
  metrics: ScoreMetrics,
  score: number,
): MoveCandidate {
  const opportunity = (100 - score) * PILLAR_WEIGHTS.longTermProgress;
  const progress = metrics.retirementProgressRatio;

  if (progress === null) {
    return {
      pillar: 'longTermProgress',
      title: 'Confirm gross annual income',
      description: 'A non-zero income is needed to compare retirement investments with an age guidepost.',
      opportunity,
    };
  }

  if (progress >= 1) {
    return {
      pillar: 'longTermProgress',
      title: 'Review the long-term plan annually',
      description: 'A broad guidepost cannot account for retirement age, pensions, lifestyle, or risk, so revisit the assumptions as life changes.',
      suggestedTargetAmount: metrics.retirementTargetAmount,
      opportunity,
    };
  }

  const gap = Math.max(0, metrics.retirementTargetAmount - input.retirementInvestments);
  return {
    pillar: 'longTermProgress',
    title: 'Narrow the long-term guidepost gap',
    description: `The broad modeled guidepost is ${formatCurrency(metrics.retirementTargetAmount)}; the current gap is about ${formatCurrency(gap)}. Treat this as planning context, not a personalized requirement.`,
    suggestedTargetAmount: metrics.retirementTargetAmount,
    opportunity,
  };
}

function buildWarnings(input: AssessmentInput, metrics: ScoreMetrics): string[] {
  const warnings: string[] = [];

  if (input.annualIncome === 0) {
    warnings.push('Gross annual income is zero, so three income-based pillars could not be assessed and received zero points.');
  }
  if (input.monthlyEssentialExpenses === 0) {
    warnings.push('Essential monthly expenses are zero, so the cash-buffer pillar could not be assessed and received zero points.');
  }
  if (
    metrics.grossMonthlyIncome > 0 &&
    input.monthlyDebtPayments > metrics.grossMonthlyIncome
  ) {
    warnings.push('Monthly debt payments exceed gross monthly income; double-check that every value uses the same monthly and annual units.');
  }
  if (
    metrics.grossMonthlyIncome > 0 &&
    input.monthlySavings > metrics.grossMonthlyIncome
  ) {
    warnings.push('Monthly savings exceed gross monthly income; double-check that every value belongs to the same person and time period.');
  }

  return warnings;
}

function scoreMetric(curve: number[][], metric: number | null): number {
  if (metric === null || !Number.isFinite(metric)) return 0;
  return clamp(Math.round(interpolate(curve, metric)), 0, 100);
}

function safeRatio(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(denominator) || denominator <= 0) return null;
  return numerator / denominator;
}

function sourceUrl(id: string): string {
  return benchmarks.sources.find((source) => source.id === id)?.url ?? '';
}

function normalizeMoney(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return round(Math.min(parsed, MONEY_CAP), 2);
}

function nullableRound(value: number | null, places: number): number | null {
  return value === null ? null : round(value, places);
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function dedupeByTitle(strengths: ScoreStrength[]): ScoreStrength[] {
  const seen = new Set<string>();
  return strengths.filter((strength) => {
    if (seen.has(strength.title)) return false;
    seen.add(strength.title);
    return true;
  });
}
