/**
 * climate.ts
 *
 * Rozwiązywanie strefy klimatycznej
 * Na razie fallback PL_III, docelowo mapping lat/lon → zoneId
 */

import { warnPush, assumePush } from './utils';

/**
 * Rozwiązuje strefę klimatyczną na podstawie współrzędnych
 * Na razie: fallback PL_III
 * Docelowo: mapping lat/lon → zoneId
 */
export function resolveClimate(
  lat: number,
  lon: number,
  climateData: any,
  warnings: string[],
  assumptions: string[]
): { zoneId: string; theta_e: number; theta_m_e: number } {
  // TU DOCELOWO: mapping lat/lon → strefa (wasz lookup)
  // Na razie fallback: PL_III
  const zoneId = 'PL_III';

  if (!climateData || !climateData[zoneId]) {
    warnPush(warnings, 'Missing climate zone PL_III in climate.json; fallback theta_e=-20 theta_m_e=7');
    assumePush(assumptions, 'fallback climate constants used');
    return { zoneId, theta_e: -20, theta_m_e: 7.0 };
  }

  const z = climateData[zoneId];
  assumePush(assumptions, 'climate zone resolved by fallback resolver (PL_III)');
  return {
    zoneId,
    theta_e: z.theta_e || -20,
    theta_m_e: z.theta_m_e || 7.0
  };
}
