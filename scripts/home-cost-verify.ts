import {
  calculateAnnualElectricityCost,
  calculateAnnualGasCost,
  calculateHomeEnergyCost,
  compareRepairVsReplace,
  type HomeCostWarningCode,
} from '../src/lib/home-cost';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  assert(Object.is(actual, expected), `${message}: expected ${String(expected)}, received ${String(actual)}`);
}

function hasWarning(
  warnings: Array<{ code: HomeCostWarningCode }>,
  code: HomeCostWarningCode,
): boolean {
  return warnings.some((warning) => warning.code === code);
}

const electricity = calculateAnnualElectricityCost(12_000, 0.15);
assertEqual(electricity.annualCost, 1_800, 'electricity annual cost');
assertEqual(electricity.averageMonthlyCost, 150, 'electricity monthly average');
assertEqual(electricity.warnings.length, 0, 'valid electricity warning count');

const gas = calculateAnnualGasCost(600, 1.2);
assertEqual(gas.annualCost, 720, 'gas annual cost');
assertEqual(gas.averageMonthlyCost, 60, 'gas monthly average');

const electricOnly = calculateHomeEnergyCost({
  annualElectricityKwh: 12_000,
  electricityRatePerKwh: 0.15,
});
assertEqual(electricOnly.gas, null, 'gas is optional');
assertEqual(electricOnly.annualTotal, 1_800, 'electric-only annual total');
assertEqual(electricOnly.averageMonthlyTotal, 150, 'electric-only monthly total');

const combined = calculateHomeEnergyCost({
  annualElectricityKwh: 12_000,
  electricityRatePerKwh: 0.15,
  annualGasTherms: 600,
  gasRatePerTherm: 1.2,
});
assertEqual(combined.annualTotal, 2_520, 'combined annual total');
assertEqual(combined.averageMonthlyTotal, 210, 'combined monthly average');
assertEqual(combined.gas?.annualCost, 720, 'combined gas component');

const incompleteGas = calculateHomeEnergyCost({
  annualElectricityKwh: 12_000,
  electricityRatePerKwh: 0.15,
  annualGasTherms: 600,
});
assertEqual(incompleteGas.annualTotal, null, 'incomplete gas input prevents a partial total');
assert(
  hasWarning(incompleteGas.warnings, 'INCOMPLETE_GAS_INPUT'),
  'incomplete gas pair should be reported',
);

const invalidEnergy = calculateHomeEnergyCost({
  annualElectricityKwh: -1,
  electricityRatePerKwh: Number.NaN,
});
assertEqual(invalidEnergy.annualTotal, null, 'invalid electricity prevents a total');
assert(
  hasWarning(invalidEnergy.warnings, 'INVALID_ANNUAL_ELECTRICITY_KWH'),
  'negative electricity use should be reported',
);
assert(
  hasWarning(invalidEnergy.warnings, 'INVALID_ELECTRICITY_RATE'),
  'non-finite electricity rate should be reported',
);

const replaceWins = compareRepairVsReplace({
  repairQuote: 800,
  replacementPrice: 6_000,
  currentAnnualOperatingCost: 2_400,
  replacementAnnualOperatingCost: 1_200,
  planningHorizonYears: 10,
});
assertEqual(replaceWins.repairTotalCost, 24_800, 'repair ten-year total');
assertEqual(replaceWins.replacementTotalCost, 18_000, 'replacement ten-year total');
assertEqual(replaceWins.modeledReplacementSavings, 6_800, 'replacement modeled savings');
assertEqual(replaceWins.lowerModeledCostOption, 'replace', 'lower ten-year option');
assertEqual(replaceWins.annualOperatingSavings, 1_200, 'annual operating savings');
assertEqual(replaceWins.additionalUpfrontCostToReplace, 5_200, 'additional replacement price');
assertEqual(replaceWins.simplePaybackYears, 4.33, 'simple payback');
assert(
  hasWarning(replaceWins.warnings, 'NO_FAILURE_PREDICTION'),
  'comparison must disclose that it does not predict failures',
);

const repairWinsInsideShortHorizon = compareRepairVsReplace({
  repairQuote: 800,
  replacementPrice: 6_000,
  currentAnnualOperatingCost: 2_400,
  replacementAnnualOperatingCost: 1_200,
  planningHorizonYears: 3,
});
assertEqual(repairWinsInsideShortHorizon.repairTotalCost, 8_000, 'repair three-year total');
assertEqual(repairWinsInsideShortHorizon.replacementTotalCost, 9_600, 'replacement three-year total');
assertEqual(repairWinsInsideShortHorizon.lowerModeledCostOption, 'repair', 'lower three-year option');
assert(
  hasWarning(repairWinsInsideShortHorizon.warnings, 'PAYBACK_OUTSIDE_HORIZON'),
  'payback outside the horizon should be reported',
);

const noOperatingSavings = compareRepairVsReplace({
  repairQuote: 500,
  replacementPrice: 4_000,
  currentAnnualOperatingCost: 900,
  replacementAnnualOperatingCost: 1_000,
  planningHorizonYears: 5,
});
assertEqual(noOperatingSavings.annualOperatingSavings, -100, 'negative operating savings');
assertEqual(noOperatingSavings.simplePaybackYears, null, 'payback without savings');
assert(
  hasWarning(noOperatingSavings.warnings, 'NO_MODELED_OPERATING_SAVINGS'),
  'lack of operating savings should be reported',
);

const zeroHorizon = compareRepairVsReplace({
  repairQuote: 500,
  replacementPrice: 4_000,
  currentAnnualOperatingCost: 900,
  replacementAnnualOperatingCost: 500,
  planningHorizonYears: 0,
});
assertEqual(zeroHorizon.repairTotalCost, 500, 'zero-horizon repair total');
assertEqual(zeroHorizon.replacementTotalCost, 4_000, 'zero-horizon replacement total');
assert(
  hasWarning(zeroHorizon.warnings, 'ZERO_PLANNING_HORIZON'),
  'zero horizon should be disclosed',
);

const invalidComparison = compareRepairVsReplace({
  repairQuote: Number.POSITIVE_INFINITY,
  replacementPrice: 4_000,
  currentAnnualOperatingCost: 900,
  replacementAnnualOperatingCost: 500,
  planningHorizonYears: -1,
});
assertEqual(invalidComparison.repairTotalCost, null, 'invalid comparison returns no totals');
assertEqual(invalidComparison.lowerModeledCostOption, null, 'invalid comparison returns no winner');
assert(
  hasWarning(invalidComparison.warnings, 'INVALID_REPAIR_QUOTE'),
  'non-finite repair quote should be reported',
);
assert(
  hasWarning(invalidComparison.warnings, 'INVALID_PLANNING_HORIZON'),
  'negative planning horizon should be reported',
);

console.log('Home-cost engine verification passed.');
