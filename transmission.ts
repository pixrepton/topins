/**
 * transmission.ts
 *
 * Obliczanie strat przez przenikanie
 * HT = Σ(U_i * A_i)
 * Φ_T = HT * ΔT
 */

import { NormalizedBuildingModel } from './types';

/**
 * Oblicza współczynnik HT (przenikanie)
 * HT = Σ(U_i * A_i) [W/K]
 */
export function calcHT(model: NormalizedBuildingModel): number {
  const { areas, U } = model;
  const HT =
    areas.walls * U.wall +
    areas.roof * U.roof +
    areas.floor * U.floor +
    areas.windows * U.window +
    areas.doors * U.door;
  return HT; // [W/K]
}
