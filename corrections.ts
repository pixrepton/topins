/**
 * corrections.ts
 *
 * Strategia A': Łagodne korekty addytywne inspirowane cieplo.app
 * Korekty są CELowo słabsze niż cieplo.app, z twardym limitem kumulacji
 */

import type { CieploApiPayload } from './types';

export type CorrectionsConfig = {
  windowsBlend: number;
  doorsBlend: number;
  ventilationBlend: number;
  basementBlend: number;
  maxAbsTotalCorrectionKw: number;
};

export const DEFAULT_CORRECTIONS_CONFIG: CorrectionsConfig = {
  windowsBlend: 0.65,
  doorsBlend: 0.75,
  ventilationBlend: 0.7,
  basementBlend: 0.75,
  maxAbsTotalCorrectionKw: 2.5
};

const WINDOW_DELTA_P_KW_FULL: Record<string, number> = {
  semi_new_double_glass: +0.9,
  old_double_glass: +1.7,
  old_single_glass: +2.4,
  new_double_glass: 0,
  new_triple_glass: -0.3,
  '2021_double_glass': -0.3,
  '2021_triple_glass': -0.5
};

const DOOR_DELTA_P_KW_FULL: Record<string, number> = {
  old_wooden: +0.2,
  old_metal: +0.1,
  new_metal: 0,
  new_pvc: 0,
  new_wooden: 0
};

const VENT_DELTA_P_KW_FULL: Record<string, number> = {
  natural: 0,
  mechanical: 0,
  mechanical_recovery: -1.0
};

const BASEMENT_DELTA_P_KW_FULL: Record<string, number> = {
  worst: -0.1,
  poor: -0.2,
  medium: -0.3,
  great: -0.4
};

function clamp(x: number, min: number, max: number) {
  return Math.min(max, Math.max(min, x));
}

function blendedDelta(fullDeltaKw: number, blend: number) {
  return fullDeltaKw * clamp(blend, 0, 1);
}

export function computeAdditiveCorrectionsKw(
  payload: CieploApiPayload,
  cfg: CorrectionsConfig = DEFAULT_CORRECTIONS_CONFIG
) {
  const notes: string[] = [];

  let windowsKw = blendedDelta(
    WINDOW_DELTA_P_KW_FULL[payload.windows_type] ?? 0,
    cfg.windowsBlend
  );
  windowsKw = clamp(windowsKw, -0.6, +1.5);

  let doorsKw = blendedDelta(
    DOOR_DELTA_P_KW_FULL[payload.doors_type] ?? 0,
    cfg.doorsBlend
  );
  doorsKw = clamp(doorsKw, -0.2, +0.2);

  let ventilationKw = blendedDelta(
    VENT_DELTA_P_KW_FULL[payload.ventilation_type] ?? 0,
    cfg.ventilationBlend
  );
  ventilationKw = clamp(ventilationKw, -0.7, 0);

  let basementKw = 0;
  if (payload.has_basement) {
    const underType = (payload as any).unheated_space_under_type ?? 'medium';
    basementKw = blendedDelta(
      BASEMENT_DELTA_P_KW_FULL[underType] ?? -0.3,
      cfg.basementBlend
    );
    basementKw = clamp(basementKw, -0.3, 0);
  }

  const rawTotal = windowsKw + doorsKw + ventilationKw + basementKw;
  const totalKw = clamp(
    rawTotal,
    -cfg.maxAbsTotalCorrectionKw,
    cfg.maxAbsTotalCorrectionKw
  );

  if (rawTotal !== totalKw) {
    notes.push(
      `Additive correction clamped from ${rawTotal.toFixed(2)} kW to ${totalKw.toFixed(2)} kW`
    );
  }

  return {
    totalKw,
    partsKw: { windowsKw, doorsKw, ventilationKw, basementKw },
    notes
  };
}
