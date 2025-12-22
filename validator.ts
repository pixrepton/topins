/**
 * validator.ts
 *
 * Walidacja payload z API cieplo.app
 * TYLKO walidacja - NIE normalizacja oparta na roku budowy
 */

import { CieploApiPayload } from './cieploMapper';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Waliduje payload z API cieplo.app
 * Sprawdza czy są wszystkie wymagane dane do obliczeń
 */
export function validateCieploPayload(payload: Partial<CieploApiPayload>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 1. Geometria - wymagane: floor_area LUB (building_length + building_width)
  if (!payload.floor_area && (!payload.building_length || !payload.building_width)) {
    errors.push({
      field: 'geometry',
      message: 'Wymagane: floor_area lub (building_length + building_width)',
      severity: 'error'
    });
  }

  // 2. Dla nieregularnego kształtu wymagany floor_perimeter
  if (payload.building_shape === 'irregular' && !payload.floor_perimeter) {
    errors.push({
      field: 'floor_perimeter',
      message: 'Dla nieregularnego kształtu wymagany floor_perimeter',
      severity: 'error'
    });
  }

  // 3. Kondygnacje
  if (!payload.building_floors || payload.building_floors < 1) {
    errors.push({
      field: 'building_floors',
      message: 'Wymagana liczba kondygnacji (minimum 1)',
      severity: 'error'
    });
  }

  if (!payload.building_heated_floors || payload.building_heated_floors.length === 0) {
    errors.push({
      field: 'building_heated_floors',
      message: 'Wymagana lista ogrzewanych kondygnacji',
      severity: 'error'
    });
  }

  // 4. Lokalizacja
  if (!payload.latitude || payload.latitude < 49 || payload.latitude > 55) {
    warnings.push({
      field: 'latitude',
      message: 'Współrzędne mogą być poza Polską',
      severity: 'warning'
    });
  }

  if (!payload.longitude || payload.longitude < 14 || payload.longitude > 25) {
    warnings.push({
      field: 'longitude',
      message: 'Współrzędne mogą być poza Polską',
      severity: 'warning'
    });
  }

  // 5. Wentylacja
  if (!payload.ventilation_type) {
    errors.push({
      field: 'ventilation_type',
      message: 'Wymagany typ wentylacji',
      severity: 'error'
    });
  }

  // 6. Typ budynku
  if (!payload.building_type) {
    errors.push({
      field: 'building_type',
      message: 'Wymagany typ budynku',
      severity: 'error'
    });
  }

  // 7. Ostrzeżenia o braku danych o izolacji
  // Dla single_house w trybie uproszczonym: sprawdź poziomy zamiast szczegółowych danych
  const isSimplifiedSingleHouse =
    payload.building_type === 'single_house' && payload.detailed_insulation_mode !== true;

  if (isSimplifiedSingleHouse) {
    // Tryb uproszczony - sprawdź poziomy
    if (!payload.walls_insulation_level) {
      warnings.push({
        field: 'walls_insulation_level',
        message: 'Brak poziomu izolacji ścian - użyto wartości fallback',
        severity: 'warning'
      });
    }
    if (!payload.roof_insulation_level) {
      warnings.push({
        field: 'roof_insulation_level',
        message: 'Brak poziomu izolacji dachu - użyto wartości fallback',
        severity: 'warning'
      });
    }
    if (!payload.floor_insulation_level) {
      warnings.push({
        field: 'floor_insulation_level',
        message: 'Brak poziomu izolacji podłogi - użyto wartości fallback',
        severity: 'warning'
      });
    }
  } else {
    // Tryb szczegółowy - sprawdź szczegółowe dane
    if (!payload.external_wall_isolation && !payload.internal_wall_isolation) {
      warnings.push({
        field: 'wall_isolation',
        message: 'Brak danych o izolacji ścian - użyto wartości fallback',
        severity: 'warning'
      });
    }

    if (!payload.top_isolation) {
      warnings.push({
        field: 'top_isolation',
        message: 'Brak danych o izolacji dachu - użyto wartości fallback',
        severity: 'warning'
      });
    }

    if (!payload.bottom_isolation) {
      warnings.push({
        field: 'bottom_isolation',
        message: 'Brak danych o izolacji podłogi - użyto wartości fallback',
        severity: 'warning'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
