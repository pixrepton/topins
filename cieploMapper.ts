/**
 * cieploMapper.ts
 *
 * Mapuje payload z API cieplo.app → NormalizedBuildingModel
 * ZERO roku budowy, ZERO zgadywania
 * TYLKO dane z payloadu + lookupy w JSON-ach
 */

import { CieploApiPayload, NormalizedBuildingModel } from './types';
import { computeGeometry } from './geometry';
import { resolveClimate } from './climate';
import { warnPush, assumePush, clamp } from './utils';

/**
 * Minimalistyczny, deterministyczny "U z materiałów" bez pełnej fizyki warstw
 * Jeśli nie masz danych → fallback
 */
function resolveUFromMaterialAndThickness(
  materialId: number | undefined,
  thicknessCm: number | undefined,
  fallbackU: number,
  materials: any,
  warnings: string[],
  assumptions: string[],
  label: string
): number {
  if (!materialId || !thicknessCm) {
    warnPush(warnings, `Missing ${label} material/thickness; fallback U=${fallbackU}`);
    assumePush(assumptions, `${label}: fallback U=${fallbackU}`);
    return fallbackU;
  }

  const mat = materials[String(materialId)] || materials.materials?.[String(materialId)];
  if (!mat?.lambda) {
    warnPush(warnings, `Unknown materialId=${materialId} for ${label}; fallback U=${fallbackU}`);
    assumePush(assumptions, `${label}: fallback U=${fallbackU}`);
    return fallbackU;
  }

  // Ultra-prosty model: R = d / lambda, U = 1 / (R + R0)
  // R0 stałe (opory przejmowania) jako 0.20
  const d_m = thicknessCm / 100;
  const R_ins = d_m / mat.lambda;
  const R0 = 0.2;
  const U = 1 / (R_ins + R0);

  // Sanity clamp: nie pozwól na kosmos
  const Uc = clamp(U, 0.08, 3.5);

  assumePush(assumptions, `${label}: U computed from lambda(thin) with simplified formula`);
  return Uc;
}

function resolveWindowU(
  type: string,
  windows: any,
  defaults: any,
  warnings: string[],
  assumptions: string[]
): number {
  const u = windows[type];
  if (typeof u !== 'number') {
    warnPush(warnings, `Unknown windows_type=${type}; fallback U_window=${defaults.fallback.U_window}`);
    assumePush(assumptions, `fallback window U=${defaults.fallback.U_window}`);
    return defaults.fallback.U_window;
  }
  return u;
}

function resolveDoorU(
  type: string,
  doors: any,
  defaults: any,
  warnings: string[],
  assumptions: string[]
): number {
  const u = doors[type];
  if (typeof u !== 'number') {
    warnPush(warnings, `Unknown doors_type=${type}; fallback U_door=${defaults.fallback.U_door}`);
    assumePush(assumptions, `fallback door U=${defaults.fallback.U_door}`);
    return defaults.fallback.U_door;
  }
  return u;
}

function resolveVentilation(
  p: CieploApiPayload,
  volume: number,
  ventilation: any,
  defaults: any,
  warnings: string[],
  assumptions: string[]
) {
  const v = ventilation[p.ventilation_type];
  if (!v) {
    warnPush(warnings, `Unknown ventilation_type=${p.ventilation_type}; fallback natural`);
    assumePush(assumptions, 'fallback ventilation natural');
    const ach = ventilation['natural']?.ach ?? 0.8;
    return { V_dot_m3h: ach * volume, eta_rec: 0 };
  }
  const ach = v.ach ?? 0.6;
  const eta_rec = v.eta_rec ?? 0.0;
  return { V_dot_m3h: ach * volume, eta_rec };
}

function computeAreas(
  p: CieploApiPayload,
  floorArea: number,
  roofArea: number,
  floorHeight: number,
  perimeter: number,
  defaults: any,
  warnings: string[],
  assumptions: string[]
) {
  // Ściany - w payloadzie jest wall_size (wygląda jak "pole ścian zewn.")
  // Jeśli wall_size jest w m2 – używamy 1:1. Jeśli nie ma → obliczamy P*H*heatedFloors
  let A_walls = p.wall_size;
  if (!A_walls || A_walls <= 0) {
    // Fallback
    const heatedFloorsCount =
      Array.isArray(p.building_heated_floors) && p.building_heated_floors.length > 0
        ? p.building_heated_floors.length
        : p.building_floors;
    A_walls = perimeter * floorHeight * heatedFloorsCount;
    warnPush(warnings, 'Missing/invalid wall_size; computed walls area from perimeter * height * floors');
    assumePush(assumptions, 'walls area computed from geometry');
  }

  // Okna/drzwi – liczymy z liczby sztuk * domyślne pola
  const A_window =
    (p.number_windows ?? 0) * defaults.fallback.window_area_per_piece_m2 +
    (p.number_huge_windows ?? 0) * defaults.fallback.huge_window_area_m2;

  const A_doors =
    (p.number_doors ?? 0) * defaults.fallback.door_area_m2 +
    (p.number_balcony_doors ?? 0) * defaults.fallback.balcony_door_area_m2;

  if ((p.number_windows ?? 0) > 0 && A_window <= 0) {
    warnPush(warnings, 'Window count present but window area computed as 0; check defaults');
  }

  // Podłoga
  const A_floor = floorArea;

  return {
    walls: A_walls,
    roof: roofArea,
    floor: A_floor,
    windows: A_window,
    doors: A_doors
  };
}

/**
 * Główna funkcja mapująca payload → model
 */
export function mapFromCieploPayload(
  payload: CieploApiPayload,
  defaults: any = {},
  windows: any = {},
  doors: any = {},
  ventilation: any = {},
  climate: any = {},
  materials: any = {}
): NormalizedBuildingModel {
  const warnings: string[] = [];
  const assumptions: string[] = [];

  const geo = computeGeometry(payload, defaults, warnings, assumptions);
  const climateResolved = resolveClimate(
    payload.latitude,
    payload.longitude,
    climate,
    warnings,
    assumptions
  );

  const areas = computeAreas(
    payload,
    geo.floorArea,
    geo.roofArea,
    payload.floor_height,
    geo.perimeter,
    defaults,
    warnings,
    assumptions
  );

  // U-wall/roof/floor: sprawdź najpierw tryb uproszczony dla single_house
  const isSimplifiedSingleHouse =
    payload.building_type === 'single_house' && payload.detailed_insulation_mode !== true;

  let U_wall: number;
  let U_roof: number;
  let U_floor: number;

  if (isSimplifiedSingleHouse) {
    // TRYB UPROSZCZONY: użyj poziomów izolacji
    const INSULATION_LEVEL_MAP = {
      walls: { poor: 0.9, average: 0.45, good: 0.23, very_good: 0.15 },
      roof: { poor: 1.0, average: 0.4, good: 0.18, very_good: 0.12 },
      floor: { poor: 0.8, average: 0.45, good: 0.25, very_good: 0.18 },
    };

    assumePush(assumptions, 'Single house: simplified insulation model enabled (levels → fixed U-values)');

    U_wall =
      (payload.walls_insulation_level &&
        INSULATION_LEVEL_MAP.walls[payload.walls_insulation_level]) ||
      defaults.fallback?.U_wall ||
      0.6;
    U_roof =
      (payload.roof_insulation_level &&
        INSULATION_LEVEL_MAP.roof[payload.roof_insulation_level]) ||
      defaults.fallback?.U_roof ||
      0.3;
    U_floor =
      (payload.floor_insulation_level &&
        INSULATION_LEVEL_MAP.floor[payload.floor_insulation_level]) ||
      defaults.fallback?.U_floor ||
      0.4;

    if (payload.walls_insulation_level) {
      assumePush(assumptions, `U_wall from simplified level: ${payload.walls_insulation_level} = ${U_wall}`);
    }
    if (payload.roof_insulation_level) {
      assumePush(assumptions, `U_roof from simplified level: ${payload.roof_insulation_level} = ${U_roof}`);
    }
    if (payload.floor_insulation_level) {
      assumePush(assumptions, `U_floor from simplified level: ${payload.floor_insulation_level} = ${U_floor}`);
    }
  } else {
    // TRYB SZCZEGÓŁOWY: użyj szczegółowych danych (materiał + grubość)
    U_wall = resolveUFromMaterialAndThickness(
      payload.external_wall_isolation?.material,
      payload.external_wall_isolation?.size,
      defaults.fallback?.U_wall ?? 0.6,
      materials,
      warnings,
      assumptions,
      'U_wall'
    );

    U_roof = resolveUFromMaterialAndThickness(
      payload.top_isolation?.material,
      payload.top_isolation?.size,
      defaults.fallback?.U_roof ?? 0.3,
      materials,
      warnings,
      assumptions,
      'U_roof'
    );

    U_floor = resolveUFromMaterialAndThickness(
      payload.bottom_isolation?.material,
      payload.bottom_isolation?.size,
      defaults.fallback?.U_floor ?? 0.4,
      materials,
      warnings,
      assumptions,
      'U_floor'
    );
  }

  const U_window = resolveWindowU(payload.windows_type, windows, defaults, warnings, assumptions);

  // Dla single_house w trybie uproszczonym: stała U_door = 1.8 (bez pytania o typ drzwi)
  let U_door: number;
  if (isSimplifiedSingleHouse && !payload.doors_type) {
    U_door = 1.8; // Stała wartość dla uproszczonego trybu
    assumePush(assumptions, 'U_door = 1.8 (simplified mode for single_house)');
  } else {
    U_door = resolveDoorU(payload.doors_type, doors, defaults, warnings, assumptions);
  }

  const vent = resolveVentilation(payload, geo.volume, ventilation, defaults, warnings, assumptions);

  // Korekty: tylko defaults (bez roku budowy)
  const thermalBridgesMultiplier = defaults.corrections?.thermalBridgesMultiplier ?? 1.1;
  const safetyFactor = defaults.corrections?.safetyFactor ?? 1.1;

  assumePush(assumptions, 'No construction year used. No guessing beyond defaults.json.');

  return {
    areas,
    U: {
      wall: U_wall,
      roof: U_roof,
      floor: U_floor,
      window: U_window,
      door: U_door
    },
    geometry: {
      volume: geo.volume,
      perimeter: geo.perimeter,
      Bprime: geo.Bprime,
      length: geo.length,
      width: geo.width
    },
    climate: {
      zoneId: climateResolved.zoneId,
      theta_e: climateResolved.theta_e,
      theta_m_e: climateResolved.theta_m_e
    },
    ventilation: vent,
    corrections: {
      thermalBridgesMultiplier,
      safetyFactor
    },
    assumptions,
    warnings
  };
}
