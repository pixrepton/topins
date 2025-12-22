/**
 * geometry.ts
 *
 * Obliczanie geometrii budynku
 * TYLKO z danych payloadu, bez zgadywania
 */

import { CieploApiPayload } from './types';
import { warnPush, assumePush } from './utils';

export function computeGeometry(
  p: CieploApiPayload,
  defaults: any,
  warnings: string[],
  assumptions: string[]
): {
  floorArea: number;
  perimeter: number;
  length: number;
  width: number;
  volume: number;
  Bprime: number;
  roofArea: number;
} {
  // Floor area
  let A = p.floor_area ?? null;
  if (!A) {
    if (p.building_length && p.building_width) {
      A = p.building_length * p.building_width;
      assumePush(assumptions, 'floor_area computed from building_length * building_width');
    } else {
      warnPush(warnings, 'Missing floor_area and missing building_length/building_width; fallback floor_area=100');
      A = 100;
      assumePush(assumptions, 'fallback floor_area=100');
    }
  }

  // Length/width + perimeter
  let length = p.building_length ?? null;
  let width = p.building_width ?? null;
  let P = p.floor_perimeter ?? null;

  if (!P) {
    if (length && width) {
      P = 2 * (length + width);
      assumePush(assumptions, 'floor_perimeter computed from length & width');
    } else {
      // Fallback: assume rectangle with ratio 1.3
      const ratio = 1.3;
      width = Math.sqrt(A / ratio);
      length = A / width;
      P = 2 * (length + width);
      warnPush(warnings, 'Missing floor_perimeter; approximated rectangle perimeter using ratio=1.3');
      assumePush(assumptions, 'rectangle approximation used for perimeter');
    }
  } else {
    if (!length || !width) {
      // Infer length/width from A and P by solving rectangle:
      // l+w = P/2 and l*w = A => l,w roots of t^2 - (P/2)t + A = 0
      const s = P / 2;
      const disc = s * s - 4 * A;
      if (disc > 0) {
        const r = Math.sqrt(disc);
        length = (s + r) / 2;
        width = (s - r) / 2;
        assumePush(assumptions, 'length/width inferred from floor_area and floor_perimeter assuming rectangle');
      } else {
        // Fallback
        const ratio = 1.3;
        width = Math.sqrt(A / ratio);
        length = A / width;
        warnPush(warnings, 'Could not infer rectangle from floor_area & perimeter; fallback rectangle ratio=1.3');
        assumePush(assumptions, 'rectangle ratio fallback used');
      }
    }
  }

  // Volume: only heated floors count
  const heatedFloorsCount =
    Array.isArray(p.building_heated_floors) && p.building_heated_floors.length > 0
      ? p.building_heated_floors.length
      : p.building_floors;

  if (!Array.isArray(p.building_heated_floors) || p.building_heated_floors.length === 0) {
    warnPush(warnings, 'Missing building_heated_floors; using building_floors for volume');
    assumePush(assumptions, 'heatedFloorsCount = building_floors');
  }

  const h = p.floor_height;
  const volume = A * heatedFloorsCount * h;

  // B' = A / (0.5*P)
  const Bprime = A / (0.5 * P);

  // Roof area approximation
  const rf = defaults.fallback?.roof_area_factor?.[p.building_roof] ?? 1.15;
  if (!defaults.fallback?.roof_area_factor?.[p.building_roof]) {
    warnPush(warnings, `Unknown building_roof=${p.building_roof}; fallback roof_area_factor=1.15`);
    assumePush(assumptions, 'fallback roof_area_factor=1.15');
  }
  const roofArea = A * rf;

  return {
    floorArea: A,
    perimeter: P,
    length: length!,
    width: width!,
    volume,
    Bprime,
    roofArea
  };
}
