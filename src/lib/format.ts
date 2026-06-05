/**
 * format.ts — Small display formatting helpers shared across components.
 */

/** Format a USD amount compactly: 1500 → "$1.5K", 2_300_000 → "$2.3M". */
export function formatCompactUSD(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}$${trim(abs / 1_000_000)}M`;
  if (abs >= 1_000) return `${sign}$${trim(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}

/** Format a USD amount with grouping: 1500 → "$1,500". */
export function formatUSD(value: number): string {
  return `${value < 0 ? '-' : ''}$${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
}

function trim(n: number): string {
  // One decimal place, but drop a trailing ".0".
  return (Math.round(n * 10) / 10).toString();
}

/** Ordinal-ish percentile phrasing helper, e.g. 68 → "68%". */
export function pct(value: number): string {
  return `${Math.round(value)}%`;
}
