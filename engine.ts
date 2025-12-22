/**
 * engine.ts
 *
 * Główny silnik OZC (obciążenie cieplne budynku)
 * Zgodnie z PN-EN 12831
 *
 * PRZEBUDOWANY: używa TYLKO danych z payload API cieplo.app
 * NIE używa roku budowy do zgadywania wartości
 */

import { mapFromCieploPayload, CieploApiPayload } from './cieploMapper';
import { OZCResult } from './types';
import { calculateTransmissionLosses } from './transmission';
import { calculateVentilationLosses } from './ventilation';
import { calculateGroundFloorLosses } from './ground';
import { calculateThermalBridges } from './bridges';
import { calculateCorrections } from './corrections';
import { validateCieploPayload } from './validator';

/**
 * Oblicza confidence (0.0-1.0) na podstawie użytych fallbacków
 */
function calculateConfidence(assumptions: string[]): number {
  let confidence = 1.0;

  // Każdy fallback zmniejsza confidence
  if (assumptions.some(a => a.includes('fallback'))) {
    confidence -= 0.1;
  }

  // Heurystyki
  if (assumptions.some(a => a.includes('thermalBridgesMultiplierHeuristic'))) {
    confidence -= 0.05;
  }

  if (assumptions.some(a => a.includes('simple_table_v1'))) {
    confidence -= 0.05;
  }

  return Math.max(0.0, Math.min(1.0, confidence));
}

/**
 * Główna funkcja obliczająca obciążenie cieplne
 * Przyjmuje payload z API cieplo.app (1:1)
 */
export function calculateOZC(
  payload: CieploApiPayload,
  materials: any = {},
  windowsData: any = {},
  doorsData: any = {},
  climateData: any = {}
): OZCResult {
  // 1. Walidacja payload
  const validation = validateCieploPayload(payload);
  if (!validation.isValid) {
    throw new Error(`Błąd walidacji: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  // 2. Mapowanie payload → NormalizedInput
  const mappingResult = mapFromCieploPayload(payload, materials, windowsData, doorsData, climateData);
  const normalized = mappingResult.normalized;

  const assumptions: string[] = [...mappingResult.assumptions];
  const warnings: string[] = [...mappingResult.warnings];

  // Dodaj warnings z walidacji
  validation.warnings.forEach(w => warnings.push(w.message));

  // 2. Oblicz straty przez przenikanie
  const transmission = calculateTransmissionLosses(normalized);

  // 3. Oblicz straty wentylacyjne
  const ventilation = calculateVentilationLosses(normalized);

  // 4. Oblicz straty przez podłogę na gruncie
  const ground = calculateGroundFloorLosses(normalized);

  // 5. Oblicz straty przez mostki cieplne
  const bridges = calculateThermalBridges(normalized, transmission);

  // 6. Suma podstawowa
  const baseLosses = transmission + ventilation + ground + bridges;

  // 7. Zastosuj korekty (sąsiedztwo, kształt, bezpieczeństwo)
  const corrections = calculateCorrections(normalized);
  const totalLosses = baseLosses * corrections;

  // 8. Confidence
  const confidence = calculateConfidence(assumptions);

  // 9. Przygotuj wyniki
  const result: OZCResult = {
    designHeatLoss_W: Math.round(totalLosses),
    designHeatLoss_kW: Math.round((totalLosses / 1000) * 100) / 100,
    heatLossPerM2: Math.round((totalLosses / normalized.geometry.floorArea) * 100) / 100,
    breakdown: {
      transmission: Math.round(transmission),
      ventilation: Math.round(ventilation),
      ground: Math.round(ground),
      bridges: Math.round(bridges)
    },
    assumptions,
    warnings,
    confidence,
    inputsUsed: {
      U_values: {
        walls: normalized.envelope.uValues.walls,
        roof: normalized.envelope.uValues.roof,
        floor: normalized.envelope.uValues.floor,
        windows: normalized.envelope.uValues.windows,
        doors: normalized.envelope.uValues.doors
      },
      areas: {
        floor: normalized.geometry.floorArea,
        roof: normalized.geometry.roofArea,
        walls: normalized.geometry.wallAreaNet,
        windows: normalized.geometry.windowArea,
        doors: normalized.geometry.doorArea
      },
      v_dot_m3h: normalized.ventilation.v_dot_m3h,
      ach: normalized.ventilation.ach,
      deltaT: normalized.temps.deltaT
    },
    validation: {
      isValid: true,
      errors: [],
      warnings: warnings.map(w => ({ field: 'general', message: w, severity: 'warning' }))
    }
  };

  return result;
}

/**
 * Konwertuje wynik OZC do formatu zgodnego z cieplo.app API
 */
export function convertToCieploAppFormat(
  ozcResult: OZCResult,
  payload: CieploApiPayload
): any {
  const heatedArea = payload.floor_area || (payload.building_length || 0) * (payload.building_width || 0);

  return {
    id: `OZC-${Date.now()}`,
    total_area: heatedArea,
    heated_area: heatedArea,
    design_outdoor_temperature: -20, // Będzie znormalizowane w mapper
    max_heating_power: ozcResult.designHeatLoss_kW,
    hot_water_power: 0,
    bivalent_point_heating_power: ozcResult.designHeatLoss_kW * 0.8,
    avg_heating_power: ozcResult.designHeatLoss_kW * 0.55,
    avg_outdoor_temperature: 1.0,
    annual_energy_consumption: Math.round(heatedArea * 120),
    annual_energy_consumption_factor: 0.82,
    heating_power_factor: ozcResult.heatLossPerM2 / 1000,
    source: 'internal_ozc_engine',
    fallback: true,
    confidence: ozcResult.confidence
  };
}
