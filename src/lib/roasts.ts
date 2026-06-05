/**
 * roasts.ts — Rule-based Financial Roast engine. No AI APIs.
 *
 * Picks a roast from 30–40 family-friendly, lighthearted templates based on
 * the user's score, ratios, and status. Also derives short Strengths and
 * Areas-To-Improve lists for the results dashboard.
 *
 * For entertainment and educational purposes only. Not financial advice.
 */

import type { ScoreResult } from './scoring';

interface RoastTemplate {
  /** The roast line itself. */
  text: string;
  /**
   * Predicate deciding whether this roast is eligible for a given result.
   * If omitted, the roast is always eligible (general pool).
   */
  when?: (r: ScoreResult) => boolean;
}

const r2 = (r: ScoreResult) => r.metrics; // shorthand

/**
 * 36 roast templates. Each is tagged with the situation it fits best.
 * Eligibility predicates keep them feeling personalized; a deterministic
 * picker (below) chooses one so the same input always yields the same roast.
 */
const ROASTS: RoastTemplate[] = [
  // ── Thin savings ──────────────────────────────────────────────
  { text: 'Your savings account appears to be practicing minimalism.', when: (r) => r2(r).savingsToIncomeRatio < 0.5 },
  { text: "Your emergency fund is the emergency.", when: (r) => r2(r).savingsToIncomeRatio < 0.25 },
  { text: 'Your savings are so lean they qualify as a fasting routine.', when: (r) => r2(r).savingsToIncomeRatio < 0.5 },
  { text: "Your nest egg is more of a nest crumb.", when: (r) => r2(r).savingsToIncomeRatio < 0.75 },
  { text: 'Compound interest called. It wants something to compound.', when: (r) => r2(r).savingsToIncomeRatio < 1 },
  { text: 'Your rainy-day fund covers roughly one light drizzle.', when: (r) => r2(r).savingsToIncomeRatio < 0.5 },

  // ── Heavy debt ────────────────────────────────────────────────
  { text: 'Your debt is putting in overtime.', when: (r) => r2(r).debtToIncomeRatio > 1.5 },
  { text: 'Your debt has better month-over-month growth than most startups.', when: (r) => r2(r).debtToIncomeRatio > 2 },
  { text: "Your debt-to-income ratio is doing cardio — uphill.", when: (r) => r2(r).debtToIncomeRatio > 1 },
  { text: 'You and your debt have a more committed relationship than most marriages.', when: (r) => r2(r).debtToIncomeRatio > 1.5 },
  { text: 'Your debt sends you a calendar invite every month and you always accept.', when: (r) => r2(r).debtToIncomeRatio > 1 },
  { text: 'Minimum payments are a lifestyle for you, not a fallback.', when: (r) => r2(r).debtToIncomeRatio > 2 },

  // ── Negative net worth ────────────────────────────────────────
  { text: 'Your net worth is currently a group project where you do all the owing.', when: (r) => r2(r).netWorth < 0 },
  { text: 'Technically, you own less than nothing. Impressively committed.', when: (r) => r2(r).netWorth < 0 },
  { text: 'Your balance sheet reads like a horror novel with a cliffhanger ending.', when: (r) => r2(r).netWorth < -10000 },

  // ── High income, weak habits ──────────────────────────────────
  { text: "Big paycheck, tiny savings. The money is clearly in witness protection.", when: (r) => r.input.income > 90000 && r2(r).savingsToIncomeRatio < 1 },
  { text: 'You earn like a CEO and save like an intern.', when: (r) => r.input.income > 100000 && r2(r).savingsToIncomeRatio < 1.5 },
  { text: 'Your income is impressive. Your savings are doing improv.', when: (r) => r.input.income > 80000 && r2(r).savingsToIncomeRatio < 1 },

  // ── Mid / mixed ───────────────────────────────────────────────
  { text: "You're not cooked, but the oven is preheating.", when: (r) => r.score >= 41 && r.score <= 60 },
  { text: 'Medium rare: a little pink in the middle, but edible.', when: (r) => r.score >= 41 && r.score <= 60 },
  { text: 'You are balancing on a financial seesaw with snacks in both hands.', when: (r) => r.score >= 41 && r.score <= 60 },
  { text: 'Solidly average. The beige wall of personal finance.', when: (r) => r.score >= 45 && r.score <= 58 },

  // ── Low scores, general ───────────────────────────────────────
  { text: "Good news: there's nowhere to go but up.", when: (r) => r.score <= 25 },
  { text: 'Your finances are speedrunning the tutorial level.', when: (r) => r.score <= 30 },
  { text: 'The smoke alarm is going off and it is your budget.', when: (r) => r.score <= 20 },
  { text: 'Your portfolio diversification strategy is "vibes."', when: (r) => r.score <= 35 },

  // ── Strong / responsible ──────────────────────────────────────
  { text: 'Unexpectedly responsible. Suspicious.', when: (r) => r.score >= 75 },
  { text: 'You have an emergency fund AND no drama. Show-off.', when: (r) => r.score >= 80 && r2(r).debtToIncomeRatio < 0.5 },
  { text: 'Your spreadsheet probably has a spreadsheet.', when: (r) => r.score >= 80 },
  { text: 'You are the friend who actually splits the bill correctly.', when: (r) => r.score >= 70 },
  { text: 'Future you just sent a thank-you note.', when: (r) => r.score >= 78 },
  { text: 'Calm, liquid, and debt-light. Are you even real?', when: (r) => r.score >= 85 && r2(r).debtToIncomeRatio < 0.4 },

  // ── Strong savings specifically ───────────────────────────────
  { text: 'Your savings are flexing and honestly they earned it.', when: (r) => r2(r).savingsToIncomeRatio >= 3 },
  { text: 'You have a runway most airports would envy.', when: (r) => r2(r).savingsToIncomeRatio >= 4 },

  // ── Near-universal fallbacks (kept off the very top tier so high
  //    scorers always get a celebratory line) ─────────────────────
  { text: 'Money comes, money goes, mostly it goes.', when: (r) => r.score < 78 },
  { text: 'Your wallet and your dreams are currently in different tax brackets.', when: (r) => r.score < 78 },
  { text: 'Numbers crunched. Verdict served.' },
];

/**
 * Deterministically pick a roast: filter to eligible templates, then choose
 * one using a stable hash of the input so results are reproducible and
 * shareable (same numbers → same roast).
 */
export function getRoast(result: ScoreResult): string {
  const eligible = ROASTS.filter((t) => !t.when || t.when(result));
  const pool = eligible.length > 0 ? eligible : ROASTS;

  const seed = hashInput(result);
  const idx = seed % pool.length;
  return pool[idx].text;
}

function hashInput(r: ScoreResult): number {
  const { age, income, savings, debt } = r.input;
  // Simple stable integer hash.
  let h = 2166136261;
  const parts = [age, income, savings, debt, r.score];
  for (const p of parts) {
    h ^= p | 0;
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface InsightLists {
  strengths: string[];
  improvements: string[];
}

/**
 * Derive short, scannable Strengths and Areas-To-Improve lists from the
 * computed ratios. Caps each list at 3 items for a clean dashboard.
 */
export function getInsights(result: ScoreResult): InsightLists {
  const { savingsToIncomeRatio, debtToIncomeRatio, netWorth } = result.metrics;
  const { savingsMultipleTarget } = result.metrics;
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Savings depth
  if (savingsToIncomeRatio >= savingsMultipleTarget && savingsMultipleTarget > 0) {
    strengths.push('Savings are on or ahead of schedule for your age');
  } else if (savingsToIncomeRatio >= 1) {
    strengths.push('You have a meaningful savings cushion built up');
  } else {
    improvements.push('Build savings toward 3–6 months of expenses');
  }

  // Debt load
  if (debtToIncomeRatio <= 0.35) {
    strengths.push('Low debt relative to income');
  } else if (debtToIncomeRatio <= 1) {
    strengths.push('Debt is manageable relative to income');
  } else {
    improvements.push('Pay down high debt — it is dragging your score');
  }

  // Net worth
  if (netWorth > 0) {
    strengths.push('Positive net worth (savings beat debt)');
  } else {
    improvements.push('Get to positive net worth: savings above total debt');
  }

  // Emergency fund nuance
  if (savingsToIncomeRatio < 0.25) {
    improvements.push('Start an emergency fund, even a small one');
  }

  // Percentile encouragement
  if (result.percentile >= 75) {
    strengths.push(`Ahead of ${result.percentile}% of Americans your age`);
  } else if (result.percentile <= 30) {
    improvements.push('Automate monthly contributions to catch up over time');
  }

  return {
    strengths: dedupe(strengths).slice(0, 3),
    improvements: dedupe(improvements).slice(0, 3),
  };
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}
