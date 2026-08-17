import {
  calculateScenario,
  calculateScore,
  getStatusLevel,
  normalizeInput,
  retirementSavingsMultipleTarget,
} from '../src/lib/scoring';
import { getRoast } from '../src/lib/roasts';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const strong = calculateScore({
  age: 40,
  annualIncome: 120_000,
  monthlyEssentialExpenses: 4_000,
  liquidSavings: 24_000,
  monthlyDebtPayments: 1_000,
  retirementInvestments: 360_000,
  monthlySavings: 2_000,
});

assert(strong.score === 98, `expected weighted score 98, received ${strong.score}`);
assert(strong.status.key === 'cooking-confidently', 'expected strongest status band');
assert(strong.pillarScores.cashBuffer === 100, 'six cash-buffer months should score 100');
assert(strong.pillarScores.debtBurden === 90, '10% DTI should score 90');
assert(strong.pillarScores.savingsHabit === 100, '20% savings rate should score 100');
assert(strong.pillarScores.longTermProgress === 100, 'on-guidepost retirement balance should score 100');
assert(strong.factors.length === 4, 'expected four transparent factors');
assert(strong.nextMoves.length === 3, 'expected three prioritized next moves');
assert(!('percentile' in strong), 'a score result must not expose a percentile');
assert(!('financialAge' in strong), 'a score result must not expose a financial age');

const dtiCheck = calculateScore({
  ...strong.input,
  monthlyDebtPayments: 3_600,
});
assert(dtiCheck.metrics.debtToIncomeRatio === 0.36, 'DTI must use monthly payments / gross monthly income');
assert(dtiCheck.pillarScores.debtBurden === 50, '36% DTI curve anchor should score 50');

const empty = calculateScore({});
assert(empty.score === 0, 'unassessable empty input should not receive points');
assert(empty.status.key === 'needs-attention', 'zero belongs to needs-attention');
assert(empty.warnings.length >= 2, 'zero denominators should produce clear warnings');

const normalized = normalizeInput({
  age: Number.NaN,
  annualIncome: Number.POSITIVE_INFINITY,
  monthlyEssentialExpenses: -1,
});
assert(normalized.age === 18, 'invalid age should normalize to 18');
assert(normalized.annualIncome === 0, 'non-finite money should normalize to zero');
assert(normalized.monthlyEssentialExpenses === 0, 'negative money should normalize to zero');

const expectedGuideposts: Array<[number, number]> = [
  [25, 0.1],
  [27, 0.46],
  [30, 1],
  [35, 2],
  [40, 3],
  [45, 4.5],
  [50, 6],
  [60, 8],
  [67, 10],
  [75, 10],
];
for (const [age, expected] of expectedGuideposts) {
  assert(
    retirementSavingsMultipleTarget(age) === expected,
    `expected age ${age} target ${expected}`,
  );
}

const noMonthlySaving = calculateScenario(strong.input, { monthlySavings: 0 });
const restoredSaving = calculateScenario(noMonthlySaving.input, { monthlySavings: 2_000 });
assert(restoredSaving.score > noMonthlySaving.score, 'scenario savings increase should raise the score');
assert(
  JSON.stringify(calculateScore(strong.input)) === JSON.stringify(calculateScore(strong.input)),
  'the calculation must be deterministic',
);
assert(getRoast(strong) === getRoast(strong), 'optional humor must be deterministic');

const bandChecks: Array<[number, string]> = [
  [24, 'needs-attention'],
  [25, 'running-hot'],
  [44, 'running-hot'],
  [45, 'finding-balance'],
  [64, 'finding-balance'],
  [65, 'steady-heat'],
  [84, 'steady-heat'],
  [85, 'cooking-confidently'],
  [100, 'cooking-confidently'],
];
for (const [score, expected] of bandChecks) {
  assert(getStatusLevel(score).key === expected, `score ${score} should map to ${expected}`);
}

console.log('Cooked Finance score verification passed.');
