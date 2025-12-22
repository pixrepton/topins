/**
 * bridges.ts
 *
 * Straty przez mostki cieplne Φ_ψ
 * Model mnożnikowy (heurystyka): Φ_ψ = Φ_T * (multiplier - 1)
 */

import { NormalizedInput } from './types';

/**
 * Oblicza straty przez mostki cieplne
 * Φ_ψ = Φ_T * (multiplier - 1)
 *
 * Multiplier:
 * - low: 1.05 (+5%)
 * - standard: 1.10 (+10%)
 * - high: 1.20 (+20%)
 *
 * To jest heurystyka zgodna z praktyką audytorską
 */
export function calculateThermalBridges(
  input: NormalizedInput,
  transmissionLosses: number
): number {
  const { multiplier } = input.bridges;

  // Heurystyka mnożnikowa
  const losses = transmissionLosses * (multiplier - 1);

  return Math.max(0, losses);
}

/**
 * Zwraca informacje o mostkach dla assumptions
 */
export function getBridgeInfo(input: NormalizedInput) {
  return {
    level: input.bridges.level,
    multiplier: input.bridges.multiplier,
    method: 'thermalBridgesMultiplierHeuristic'
  };
}
