/**
 * ventilation.ts
 *
 * Obliczanie strat wentylacyjnych
 * HV = 0.34 * V_dot [W/K]
 * Φ_V = HV * ΔT * (1 - eta_rec)
 */

import { NormalizedBuildingModel } from './types';

/**
 * Oblicza współczynnik HV (wentylacja)
 * HV = 0.34 * V_dot [W/K]
 */
export function calcHV(model: NormalizedBuildingModel): number {
  // HV = 0.34 * V_dot [W/K]
  return 0.34 * model.ventilation.V_dot_m3h;
}
