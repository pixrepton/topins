/**
 * ground.ts
 *
 * Straty przez podłogę na gruncie
 * Uproszczony model: U_floor z tabeli + korekta A/P
 */

import { NormalizedInput } from './types';

/**
 * Oblicza straty przez podłogę na gruncie
 * Φ_ground = U_floor * A_floor * ΔT
 *
 * U_floor z danych payloadu (izolacja) lub fallback z defaults.json
 * Korekta zależna od stosunku A/P (powierzchnia/obwód)
 */
export function calculateGroundFloorLosses(input: NormalizedInput): number {
  const { floorArea, perimeter } = input.geometry;
  const { deltaT } = input.temps;
  const U_floor = input.envelope.uValues.floor;

  // Korekta na kształt podłogi (A/P)
  // Mniejsze A/P = większe straty krawędziowe
  const A_P_ratio = floorArea / perimeter;
  let shapeCorrection = 1.0;

  // Dla małych budynków (A/P < 5) zwiększ straty o 10%
  if (A_P_ratio < 5) {
    shapeCorrection = 1.1;
  }
  // Dla bardzo małych (A/P < 3) zwiększ o 20%
  else if (A_P_ratio < 3) {
    shapeCorrection = 1.2;
  }

  const losses = U_floor * floorArea * deltaT * shapeCorrection;

  return Math.max(0, losses);
}

/**
 * Zwraca informacje o modelu podłogi
 */
export function getGroundModelInfo(input: NormalizedInput) {
  return {
    model: 'simple_table_v1',
    U_floor: input.envelope.uValues.floor,
    floorArea: input.geometry.floorArea,
    perimeter: input.geometry.perimeter,
    A_P_ratio: input.geometry.floorArea / input.geometry.perimeter
  };
}
