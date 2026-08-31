/**
 * Pure, deterministic home-cost calculations.
 *
 * These helpers intentionally model only the values supplied by the caller.
 * They do not fetch utility tariffs, estimate equipment life, or predict when
 * an appliance will fail. Invalid values are reported instead of coerced.
 */

export type HomeCostWarningSeverity = 'error' | 'caution';

export type HomeCostWarningCode =
  | 'INVALID_ANNUAL_ELECTRICITY_KWH'
  | 'INVALID_ELECTRICITY_RATE'
  | 'INCOMPLETE_GAS_INPUT'
  | 'INVALID_ANNUAL_GAS_THERMS'
  | 'INVALID_GAS_RATE'
  | 'INVALID_REPAIR_QUOTE'
  | 'INVALID_REPLACEMENT_PRICE'
  | 'INVALID_CURRENT_OPERATING_COST'
  | 'INVALID_REPLACEMENT_OPERATING_COST'
  | 'INVALID_PLANNING_HORIZON'
  | 'ZERO_PLANNING_HORIZON'
  | 'NO_MODELED_OPERATING_SAVINGS'
  | 'PAYBACK_OUTSIDE_HORIZON'
  | 'NO_FAILURE_PREDICTION';

export interface HomeCostWarning {
  code: HomeCostWarningCode;
  severity: HomeCostWarningSeverity;
  message: string;
}

export interface AnnualUtilityCostResult {
  annualCost: number | null;
  averageMonthlyCost: number | null;
  warnings: HomeCostWarning[];
}

export interface HomeEnergyCostInput {
  /** Electricity consumed over one year, in kilowatt-hours. */
  annualElectricityKwh: number;
  /** All-in or marginal electricity price supplied by the caller, per kWh. */
  electricityRatePerKwh: number;
  /** Optional annual natural-gas use. Supply this together with gasRatePerTherm. */
  annualGasTherms?: number;
  /** Optional natural-gas price per therm. Supply this together with annualGasTherms. */
  gasRatePerTherm?: number;
}

export interface HomeEnergyCostResult {
  electricity: AnnualUtilityCostResult;
  gas: AnnualUtilityCostResult | null;
  annualTotal: number | null;
  averageMonthlyTotal: number | null;
  warnings: HomeCostWarning[];
  assumptions: readonly string[];
}

export const HOME_ENERGY_COST_ASSUMPTIONS = [
  'Annual usage and supplied unit rates are treated as constant for the calculation period.',
  'Fixed customer charges, taxes, tiered rates, demand charges, credits, and seasonal pricing are excluded unless the supplied unit rate already incorporates them.',
  'The monthly amount is the annual total divided by 12; it is an average, not a forecast for a particular bill.',
] as const;

export interface RepairVsReplaceInput {
  /** Up-front cost to complete the contemplated repair. */
  repairQuote: number;
  /** Up-front installed price of the contemplated replacement. */
  replacementPrice: number;
  /** Expected annual energy/operating cost after repairing and keeping the current item. */
  currentAnnualOperatingCost: number;
  /** Expected annual energy/operating cost for the replacement. */
  replacementAnnualOperatingCost: number;
  /** Comparison period in years. Fractional years are allowed. */
  planningHorizonYears: number;
}

export type LowerModeledCostOption = 'repair' | 'replace' | 'tie';

export interface RepairVsReplaceResult {
  repairTotalCost: number | null;
  replacementTotalCost: number | null;
  /** Positive means replacement costs less over the supplied horizon. */
  modeledReplacementSavings: number | null;
  lowerModeledCostOption: LowerModeledCostOption | null;
  /** Current annual operating cost minus replacement annual operating cost. */
  annualOperatingSavings: number | null;
  /** Replacement price minus repair quote. Negative means replacement is cheaper up front. */
  additionalUpfrontCostToReplace: number | null;
  /** Simple, undiscounted payback from operating savings; null when it is not meaningful. */
  simplePaybackYears: number | null;
  warnings: HomeCostWarning[];
  assumptions: readonly string[];
}

export const REPAIR_VS_REPLACE_ASSUMPTIONS = [
  'The repair quote and replacement price are treated as complete up-front costs supplied by the caller.',
  'The repaired item and the replacement are each assumed to remain usable for the full planning horizon.',
  'Annual operating costs are held constant; inflation, discount rates, financing, rebates, taxes, maintenance, resale value, and future repairs are not modeled.',
  'The comparison does not estimate breakdown probability, remaining service life, safety, comfort, or reliability.',
] as const;

/** Calculate annual electricity cost from annual kWh and a caller-supplied rate. */
export function calculateAnnualElectricityCost(
  annualKwh: number,
  ratePerKwh: number,
): AnnualUtilityCostResult {
  return calculateAnnualUtilityCost(
    annualKwh,
    ratePerKwh,
    'INVALID_ANNUAL_ELECTRICITY_KWH',
    'Annual electricity use must be a finite, nonnegative number of kWh.',
    'INVALID_ELECTRICITY_RATE',
    'The electricity rate must be a finite, nonnegative amount per kWh.',
  );
}

/** Calculate annual natural-gas cost from annual therms and a caller-supplied rate. */
export function calculateAnnualGasCost(
  annualTherms: number,
  ratePerTherm: number,
): AnnualUtilityCostResult {
  return calculateAnnualUtilityCost(
    annualTherms,
    ratePerTherm,
    'INVALID_ANNUAL_GAS_THERMS',
    'Annual gas use must be a finite, nonnegative number of therms.',
    'INVALID_GAS_RATE',
    'The gas rate must be a finite, nonnegative amount per therm.',
  );
}

/**
 * Calculate a combined annual and average-monthly energy cost. Natural gas is
 * optional, but gas usage and its rate must either both be supplied or both be
 * omitted. A requested but invalid gas calculation makes the combined total
 * unavailable rather than silently excluding it.
 */
export function calculateHomeEnergyCost(input: HomeEnergyCostInput): HomeEnergyCostResult {
  const electricity = calculateAnnualElectricityCost(
    input.annualElectricityKwh,
    input.electricityRatePerKwh,
  );
  const warnings = [...electricity.warnings];

  const hasGasUse = input.annualGasTherms !== undefined;
  const hasGasRate = input.gasRatePerTherm !== undefined;
  const gasWasRequested = hasGasUse || hasGasRate;
  let gas: AnnualUtilityCostResult | null = null;

  if (hasGasUse !== hasGasRate) {
    warnings.push({
      code: 'INCOMPLETE_GAS_INPUT',
      severity: 'error',
      message: 'Provide both annual gas therms and a gas rate per therm, or omit both.',
    });
  } else if (hasGasUse && hasGasRate) {
    gas = calculateAnnualGasCost(input.annualGasTherms!, input.gasRatePerTherm!);
    warnings.push(...gas.warnings);
  }

  const electricityIsValid = electricity.annualCost !== null;
  const gasIsValid = !gasWasRequested || (gas !== null && gas.annualCost !== null);
  const annualTotal = electricityIsValid && gasIsValid
    ? roundMoney(electricity.annualCost! + (gas?.annualCost ?? 0))
    : null;

  return {
    electricity,
    gas,
    annualTotal,
    averageMonthlyTotal: annualTotal === null ? null : roundMoney(annualTotal / 12),
    warnings,
    assumptions: HOME_ENERGY_COST_ASSUMPTIONS,
  };
}

/**
 * Compare simple undiscounted ownership cost for repairing versus replacing.
 * This is a scenario comparison, not a recommendation or equipment-life model.
 */
export function compareRepairVsReplace(input: RepairVsReplaceInput): RepairVsReplaceResult {
  const warnings: HomeCostWarning[] = [
    {
      code: 'NO_FAILURE_PREDICTION',
      severity: 'caution',
      message: 'This comparison does not predict failures or remaining service life; both options are assumed to remain usable for the full planning horizon.',
    },
  ];

  validateNonnegative(
    input.repairQuote,
    'INVALID_REPAIR_QUOTE',
    'The repair quote must be a finite, nonnegative amount.',
    warnings,
  );
  validateNonnegative(
    input.replacementPrice,
    'INVALID_REPLACEMENT_PRICE',
    'The replacement price must be a finite, nonnegative amount.',
    warnings,
  );
  validateNonnegative(
    input.currentAnnualOperatingCost,
    'INVALID_CURRENT_OPERATING_COST',
    'The current annual operating cost must be a finite, nonnegative amount.',
    warnings,
  );
  validateNonnegative(
    input.replacementAnnualOperatingCost,
    'INVALID_REPLACEMENT_OPERATING_COST',
    'The replacement annual operating cost must be a finite, nonnegative amount.',
    warnings,
  );
  validateNonnegative(
    input.planningHorizonYears,
    'INVALID_PLANNING_HORIZON',
    'The planning horizon must be a finite, nonnegative number of years.',
    warnings,
  );

  if (warnings.some((warning) => warning.severity === 'error')) {
    return emptyRepairVsReplaceResult(warnings);
  }

  if (input.planningHorizonYears === 0) {
    warnings.push({
      code: 'ZERO_PLANNING_HORIZON',
      severity: 'caution',
      message: 'A zero-year horizon compares up-front prices only and includes no operating costs.',
    });
  }

  const rawRepairTotal = input.repairQuote
    + input.currentAnnualOperatingCost * input.planningHorizonYears;
  const rawReplacementTotal = input.replacementPrice
    + input.replacementAnnualOperatingCost * input.planningHorizonYears;
  const annualOperatingSavings = input.currentAnnualOperatingCost
    - input.replacementAnnualOperatingCost;
  const additionalUpfrontCostToReplace = input.replacementPrice - input.repairQuote;

  let simplePaybackYears: number | null = null;
  if (annualOperatingSavings > 0) {
    simplePaybackYears = additionalUpfrontCostToReplace <= 0
      ? 0
      : round(additionalUpfrontCostToReplace / annualOperatingSavings, 2);
    if (simplePaybackYears > input.planningHorizonYears) {
      warnings.push({
        code: 'PAYBACK_OUTSIDE_HORIZON',
        severity: 'caution',
        message: 'Modeled operating savings do not recover the additional replacement price within the selected planning horizon.',
      });
    }
  } else {
    warnings.push({
      code: 'NO_MODELED_OPERATING_SAVINGS',
      severity: 'caution',
      message: 'The supplied replacement operating cost is not lower, so an operating-savings payback is not calculated.',
    });
  }

  const lowerModeledCostOption: LowerModeledCostOption = rawRepairTotal < rawReplacementTotal
    ? 'repair'
    : rawReplacementTotal < rawRepairTotal
      ? 'replace'
      : 'tie';

  return {
    repairTotalCost: roundMoney(rawRepairTotal),
    replacementTotalCost: roundMoney(rawReplacementTotal),
    modeledReplacementSavings: roundMoney(rawRepairTotal - rawReplacementTotal),
    lowerModeledCostOption,
    annualOperatingSavings: roundMoney(annualOperatingSavings),
    additionalUpfrontCostToReplace: roundMoney(additionalUpfrontCostToReplace),
    simplePaybackYears,
    warnings,
    assumptions: REPAIR_VS_REPLACE_ASSUMPTIONS,
  };
}

function calculateAnnualUtilityCost(
  annualUsage: number,
  unitRate: number,
  usageCode: HomeCostWarningCode,
  usageMessage: string,
  rateCode: HomeCostWarningCode,
  rateMessage: string,
): AnnualUtilityCostResult {
  const warnings: HomeCostWarning[] = [];
  validateNonnegative(annualUsage, usageCode, usageMessage, warnings);
  validateNonnegative(unitRate, rateCode, rateMessage, warnings);

  if (warnings.length > 0) {
    return { annualCost: null, averageMonthlyCost: null, warnings };
  }

  const annualCost = roundMoney(annualUsage * unitRate);
  return {
    annualCost,
    averageMonthlyCost: roundMoney(annualCost / 12),
    warnings,
  };
}

function validateNonnegative(
  value: number,
  code: HomeCostWarningCode,
  message: string,
  warnings: HomeCostWarning[],
): void {
  if (!Number.isFinite(value) || value < 0) {
    warnings.push({ code, severity: 'error', message });
  }
}

function emptyRepairVsReplaceResult(
  warnings: HomeCostWarning[],
): RepairVsReplaceResult {
  return {
    repairTotalCost: null,
    replacementTotalCost: null,
    modeledReplacementSavings: null,
    lowerModeledCostOption: null,
    annualOperatingSavings: null,
    additionalUpfrontCostToReplace: null,
    simplePaybackYears: null,
    warnings,
    assumptions: REPAIR_VS_REPLACE_ASSUMPTIONS,
  };
}

function roundMoney(value: number): number {
  return round(value, 2);
}

function round(value: number, places: number): number {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
