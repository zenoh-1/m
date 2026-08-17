/**
 * Optional, rule-based humor for the Cooked Finance result.
 *
 * No API is called and no financial values leave the browser. The lines are
 * intentionally gentle: they joke about the dashboard, never a person's
 * worth, intelligence, or circumstances.
 */

import type { ScoreResult } from './scoring';

interface RoastTemplate {
  text: string;
  when?: (result: ScoreResult) => boolean;
}

const hasMetric = (value: number | null): value is number => value !== null;

const ROASTS: RoastTemplate[] = [
  // Cash-buffer nudges
  {
    text: 'Your cash cushion is still in travel-pillow mode.',
    when: (result) =>
      hasMetric(result.metrics.cashBufferMonths) &&
      result.metrics.cashBufferMonths < 1,
  },
  {
    text: 'The rainy-day fund has an umbrella. It is still shopping for the raincoat.',
    when: (result) =>
      hasMetric(result.metrics.cashBufferMonths) &&
      result.metrics.cashBufferMonths >= 1 &&
      result.metrics.cashBufferMonths < 3,
  },
  {
    text: 'Your emergency fund has started preheating—give it a little more time.',
    when: (result) =>
      hasMetric(result.metrics.cashBufferMonths) &&
      result.metrics.cashBufferMonths < 3,
  },
  {
    text: 'That cash buffer could handle a plot twist or two.',
    when: (result) =>
      hasMetric(result.metrics.cashBufferMonths) &&
      result.metrics.cashBufferMonths >= 3,
  },

  // Monthly debt-payment pressure
  {
    text: 'Your debt payments are using a few too many burners.',
    when: (result) =>
      hasMetric(result.metrics.debtToIncomeRatio) &&
      result.metrics.debtToIncomeRatio > 0.43,
  },
  {
    text: 'Debt has a recurring reservation in the monthly budget.',
    when: (result) =>
      hasMetric(result.metrics.debtToIncomeRatio) &&
      result.metrics.debtToIncomeRatio > 0.3,
  },
  {
    text: 'Your debt payments are present, but at least they are not running the kitchen.',
    when: (result) =>
      hasMetric(result.metrics.debtToIncomeRatio) &&
      result.metrics.debtToIncomeRatio > 0.1 &&
      result.metrics.debtToIncomeRatio <= 0.3,
  },
  {
    text: 'Debt is barely getting a speaking role in this budget.',
    when: (result) =>
      hasMetric(result.metrics.debtToIncomeRatio) &&
      result.metrics.debtToIncomeRatio <= 0.1,
  },

  // Savings habit
  {
    text: 'Your savings habit has entered the chat. Now it needs a recurring calendar invite.',
    when: (result) =>
      hasMetric(result.metrics.savingsRate) && result.metrics.savingsRate < 0.05,
  },
  {
    text: 'The savings habit is simmering; one small automatic increase would add seasoning.',
    when: (result) =>
      hasMetric(result.metrics.savingsRate) &&
      result.metrics.savingsRate >= 0.05 &&
      result.metrics.savingsRate < 0.15,
  },
  {
    text: 'Future you noticed the monthly savings habit and approves.',
    when: (result) =>
      hasMetric(result.metrics.savingsRate) && result.metrics.savingsRate >= 0.15,
  },

  // Long-term progress
  {
    text: 'Future you left a polite note about retirement contributions.',
    when: (result) =>
      hasMetric(result.metrics.retirementProgressRatio) &&
      result.metrics.retirementProgressRatio < 0.5,
  },
  {
    text: 'The retirement pot is cooking; this recipe just takes a while.',
    when: (result) =>
      hasMetric(result.metrics.retirementProgressRatio) &&
      result.metrics.retirementProgressRatio >= 0.5 &&
      result.metrics.retirementProgressRatio < 1,
  },
  {
    text: 'The broad retirement guidepost saw your balance and gave a respectful nod.',
    when: (result) =>
      hasMetric(result.metrics.retirementProgressRatio) &&
      result.metrics.retirementProgressRatio >= 1,
  },

  // Overall bands
  {
    text: 'The dashboard found the starting point. No dramatic montage required.',
    when: (result) => result.status.key === 'needs-attention',
  },
  {
    text: 'A few numbers are running hot, but the fire extinguisher can stay on the wall.',
    when: (result) => result.status.key === 'running-hot',
  },
  {
    text: 'Halfway between “I have a system” and “where did that subscription come from?”',
    when: (result) => result.status.key === 'finding-balance',
  },
  {
    text: 'Steady heat: not flashy, just annoyingly effective.',
    when: (result) => result.status.key === 'steady-heat',
  },
  {
    text: 'Your finances brought mise en place to a potluck.',
    when: (result) => result.status.key === 'cooking-confidently',
  },
  {
    text: 'Your spreadsheet probably has its own mise en place.',
    when: (result) => result.score >= 85,
  },
  {
    text: 'Future you may actually answer your messages.',
    when: (result) => result.score >= 70,
  },

  // Safe fallbacks
  { text: 'Numbers checked. Apron optional.' },
  { text: 'The calculator has spoken, very politely.' },
  { text: 'Financial temperature taken. No thermometer was harmed.' },
];

/** Return the same eligible line for the same normalized input and score. */
export function getRoast(result: ScoreResult): string {
  const eligible = ROASTS.filter(
    (template) => !template.when || template.when(result),
  );
  const pool = eligible.length > 0 ? eligible : ROASTS;
  return pool[hashInput(result) % pool.length].text;
}

function hashInput(result: ScoreResult): number {
  const input = result.input;
  const seed = [
    input.age,
    input.annualIncome,
    input.monthlyEssentialExpenses,
    input.liquidSavings,
    input.monthlyDebtPayments,
    input.retirementInvestments,
    input.monthlySavings,
    result.score,
  ].join('|');

  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Compatibility helper for dashboards that prefer two string lists. */
export interface InsightLists {
  strengths: string[];
  improvements: string[];
}

export function getInsights(result: ScoreResult): InsightLists {
  return {
    strengths: result.strengths.map((strength) => strength.title),
    improvements: result.nextMoves.map((move) => move.title),
  };
}
