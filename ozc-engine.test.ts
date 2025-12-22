/**
 * ozc-engine.test.ts
 *
 * Testy dla silnika OZC
 */

import { calculateOZC } from '../src/calculateOZC';
import { CieploApiPayload } from '../src/types';

// Wbudowane dane testowe (zamiast ładowania JSON)
const defaults = {
  fallback: {
    U_wall: 0.6,
    U_roof: 0.3,
    U_floor: 0.4,
    U_window: 1.3,
    U_door: 1.8,
    window_area_per_piece_m2: 1.6,
    huge_window_area_m2: 4.0,
    door_area_m2: 2.0,
    balcony_door_area_m2: 2.2,
    roof_area_factor: {
      flat: 1.05,
      oblique: 1.15,
      steep: 1.25
    }
  },
  corrections: {
    thermalBridgesMultiplier: 1.1,
    safetyFactor: 1.1
  }
};

const windows = {
  old_single_glass: 2.8,
  old_double_glass: 2.5,
  semi_new_double_glass: 2.0,
  new_double_glass: 1.3,
  new_triple_glass: 0.9,
  '2021_double_glass': 1.0,
  '2021_triple_glass': 0.8
};

const doors = {
  old_wooden: 3.0,
  old_metal: 3.5,
  new_wooden: 1.8,
  new_metal: 1.5,
  new_pvc: 1.3
};

const ventilation = {
  natural: { ach: 0.8, eta_rec: 0.0 },
  mechanical: { ach: 0.6, eta_rec: 0.0 },
  mechanical_recovery: { ach: 0.6, eta_rec: 0.85 }
};

const climate = {
  PL_III: { theta_e: -20, theta_m_e: 7.0 }
};

const materials = {
  '57': { lambda: 0.25 },
  '88': { lambda: 0.036 },
  '68': { lambda: 0.04 }
};

test('basic payload returns deterministic result', () => {
  const payload: CieploApiPayload = {
    building_type: 'single_house',
    latitude: 52.23,
    longitude: 21.01,
    floor_area: 120,
    floor_perimeter: 44,
    building_floors: 2,
    building_heated_floors: [1, 2],
    floor_height: 2.7,
    building_roof: 'oblique',
    has_basement: false,
    has_balcony: false,
    wall_size: 160,
    primary_wall_material: 57,
    external_wall_isolation: { material: 88, size: 20 },
    top_isolation: { material: 88, size: 25 },
    bottom_isolation: { material: 68, size: 10 },
    number_doors: 1,
    number_balcony_doors: 1,
    number_windows: 12,
    number_huge_windows: 1,
    doors_type: 'new_pvc',
    windows_type: 'new_triple_glass',
    indoor_temperature: 21,
    ventilation_type: 'mechanical_recovery'
  };

  const res = calculateOZC(payload, defaults, windows, doors, ventilation, climate, materials);
  expect(res.designHeatLoss_kW).toBeGreaterThan(1);
  expect(res.designHeatLoss_kW).toBeLessThan(30);
  expect(Array.isArray(res.warnings)).toBe(true);
  expect(Array.isArray(res.assumptions)).toBe(true);
});
