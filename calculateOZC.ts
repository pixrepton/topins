/**
 * calculateOZC.ts
 *
 * Główna funkcja obliczająca OZC
 * Przyjmuje payload z API cieplo.app (1:1)
 */

import { CieploApiPayload, OZCResult } from './types';
import { mapFromCieploPayload } from './cieploMapper';
import { calcHT } from './transmission';
import { calcHV } from './ventilation';
import { assumePush, warnPush } from './utils';
import { computeAdditiveCorrectionsKw, DEFAULT_CORRECTIONS_CONFIG } from './corrections';

/**
 * Główna funkcja obliczająca obciążenie cieplne
 */
export function calculateOZC(
  payload: CieploApiPayload,
  defaults: any = {},
  windows: any = {},
  doors: any = {},
  ventilation: any = {},
  climate: any = {},
  materials: any = {}
): OZCResult {
  const model = mapFromCieploPayload(
    payload,
    defaults,
    windows,
    doors,
    ventilation,
    climate,
    materials
  );

  const thetaInt = payload.indoor_temperature;
  const thetaE = model.climate.theta_e;
  const deltaT = thetaInt - thetaE;

  if (!Number.isFinite(deltaT) || deltaT <= 0) {
    warnPush(
      model.warnings,
      `Invalid deltaT (thetaInt=${thetaInt}, thetaE=${thetaE}). Using deltaT=20K fallback.`
    );
    assumePush(model.assumptions, 'deltaT fallback=20K');
  }
  const dT = Number.isFinite(deltaT) && deltaT > 0 ? deltaT : 20;

  const HT = calcHT(model);
  const HV = calcHV(model);

  const phiT = HT * dT;
  // Φ_V = HV * ΔT * (1 - η_rec)
  const phiV = HV * dT * (1 - model.ventilation.eta_rec);

  const phiPsi = phiT * (model.corrections.thermalBridgesMultiplier - 1);

  // Strategia A': Łagodne korekty addytywne (poza fizyką)
  const basePhysicsW = phiT + phiV + phiPsi;
  const add = computeAdditiveCorrectionsKw(payload, DEFAULT_CORRECTIONS_CONFIG);
  const baseW = basePhysicsW + add.totalKw * 1000;
  const total = baseW * model.corrections.safetyFactor;

  const Aref = model.areas.floor > 0 ? model.areas.floor : 1;
  const wPerM2 = total / Aref;

  // Sanity warnings
  if (wPerM2 < 20 || wPerM2 > 250) {
    warnPush(
      model.warnings,
      `Sanity-check: heatLossPerM2=${Math.round(wPerM2)} W/m2 looks suspicious.`
    );
  }

  // Zbierz wszystkie assumptions (fizyka + korekty)
  const allAssumptions = [
    ...model.assumptions,
    "Strategy A' enabled: blended additive corrections (windows, doors, ventilation, basement)",
    ...add.notes
  ];

  return {
    designHeatLoss_W: Math.round(total),
    designHeatLoss_kW: Math.round((total / 1000) * 100) / 100,
    heatLossPerM2: Math.round(wPerM2 * 100) / 100,
    breakdown: {
      transmission: Math.round(phiT),
      ventilation: Math.round(phiV),
      bridges: Math.round(phiPsi)
    },
    assumptions: allAssumptions,
    warnings: model.warnings
  };
}
