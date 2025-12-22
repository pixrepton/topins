/**
 * ozc-engine.js
 *
 * Silnik OZC (obciążenie cieplne budynku) - wersja JavaScript
 * Zgodnie z PN-EN 12831
 *
 * PRZEBUDOWANY: używa TYLKO danych z payload API cieplo.app
 * NIE używa roku budowy do zgadywania wartości
 */

(function () {
  'use strict';

  // Dane domyślne (wbudowane, nie ładujemy z JSON)
  const DEFAULTS = {
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
        steep: 1.25,
      },
    },
    corrections: {
      thermalBridgesMultiplier: 1.1,
      safetyFactor: 1.1,
    },
  };

  const WINDOWS = {
    old_single_glass: 2.8,
    old_double_glass: 2.5,
    semi_new_double_glass: 2.0,
    new_double_glass: 1.3,
    new_triple_glass: 0.9,
    '2021_double_glass': 1.0,
    '2021_triple_glass': 0.8,
  };

  const DOORS = {
    old_wooden: 3.0,
    old_metal: 3.5,
    new_wooden: 1.8,
    new_metal: 1.5,
    new_pvc: 1.3,
  };

  const VENTILATION = {
    natural: { ach: 0.8, eta_rec: 0.0 },
    mechanical: { ach: 0.6, eta_rec: 0.0 },
    mechanical_recovery: { ach: 0.6, eta_rec: 0.85 },
  };

  const MATERIALS = {
    57: { lambda: 0.25 },
    88: { lambda: 0.036 },
    68: { lambda: 0.04 },
  };

  const CLIMATE = {
    PL_III: { theta_e: -20, theta_m_e: 7.0 },
  };

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function warnPush(arr, msg) {
    if (!arr.includes(msg)) arr.push(msg);
  }

  function assumePush(arr, msg) {
    if (!arr.includes(msg)) arr.push(msg);
  }

  /**
   * Oblicza geometrię
   */
  function computeGeometry(p, warnings, assumptions) {
    let A = p.floor_area ?? null;
    if (!A) {
      if (p.building_length && p.building_width) {
        A = p.building_length * p.building_width;
        assumePush(assumptions, 'floor_area computed from building_length * building_width');
      } else {
        warnPush(warnings, 'Missing floor_area; fallback floor_area=100');
        A = 100;
        assumePush(assumptions, 'fallback floor_area=100');
      }
    }

    let length = p.building_length ?? null;
    let width = p.building_width ?? null;
    let P = p.floor_perimeter ?? null;

    if (!P) {
      if (length && width) {
        P = 2 * (length + width);
        assumePush(assumptions, 'floor_perimeter computed from length & width');
      } else {
        const ratio = 1.3;
        width = Math.sqrt(A / ratio);
        length = A / width;
        P = 2 * (length + width);
        warnPush(warnings, 'Missing floor_perimeter; approximated rectangle');
        assumePush(assumptions, 'rectangle approximation used');
      }
    } else {
      if (!length || !width) {
        const s = P / 2;
        const disc = s * s - 4 * A;
        if (disc > 0) {
          const r = Math.sqrt(disc);
          length = (s + r) / 2;
          width = (s - r) / 2;
          assumePush(assumptions, 'length/width inferred from floor_area and perimeter');
        } else {
          const ratio = 1.3;
          width = Math.sqrt(A / ratio);
          length = A / width;
          warnPush(warnings, 'Could not infer rectangle; fallback');
          assumePush(assumptions, 'rectangle ratio fallback used');
        }
      }
    }

    const heatedFloorsCount =
      Array.isArray(p.building_heated_floors) && p.building_heated_floors.length > 0
        ? p.building_heated_floors.length
        : p.building_floors;

    const h = p.floor_height;
    const volume = A * heatedFloorsCount * h;
    const Bprime = A / (0.5 * P);

    const rf = DEFAULTS.fallback.roof_area_factor[p.building_roof] ?? 1.15;
    const roofArea = A * rf;

    return { floorArea: A, perimeter: P, length, width, volume, Bprime, roofArea };
  }

  /**
   * Oblicza powierzchnie
   */
  function computeAreas(p, floorArea, roofArea, floorHeight, perimeter, warnings, assumptions) {
    let A_walls = p.wall_size;
    if (!A_walls || A_walls <= 0) {
      const heatedFloorsCount =
        Array.isArray(p.building_heated_floors) && p.building_heated_floors.length > 0
          ? p.building_heated_floors.length
          : p.building_floors;
      A_walls = perimeter * floorHeight * heatedFloorsCount;
      warnPush(warnings, 'Missing wall_size; computed from geometry');
      assumePush(assumptions, 'walls area computed from geometry');
    }

    const A_window =
      (p.number_windows || 0) * DEFAULTS.fallback.window_area_per_piece_m2 +
      (p.number_huge_windows || 0) * DEFAULTS.fallback.huge_window_area_m2;

    const A_doors =
      (p.number_doors || 0) * DEFAULTS.fallback.door_area_m2 +
      (p.number_balcony_doors || 0) * DEFAULTS.fallback.balcony_door_area_m2;

    return {
      walls: A_walls,
      roof: roofArea,
      floor: floorArea,
      windows: A_window,
      doors: A_doors,
    };
  }

  /**
   * Rozwiązuje U z materiału i grubości
   */
  function resolveUFromMaterial(materialId, thicknessCm, fallbackU, warnings, assumptions, label) {
    if (!materialId || !thicknessCm) {
      warnPush(warnings, `Missing ${label} material/thickness; fallback U=${fallbackU}`);
      assumePush(assumptions, `${label}: fallback U=${fallbackU}`);
      return fallbackU;
    }

    const mat = MATERIALS[String(materialId)];
    if (!mat?.lambda) {
      warnPush(warnings, `Unknown materialId=${materialId} for ${label}; fallback U=${fallbackU}`);
      assumePush(assumptions, `${label}: fallback U=${fallbackU}`);
      return fallbackU;
    }

    const d_m = thicknessCm / 100;
    const R_ins = d_m / mat.lambda;
    const R0 = 0.2;
    const U = 1 / (R_ins + R0);
    const Uc = clamp(U, 0.08, 3.5);

    assumePush(assumptions, `${label}: U computed from lambda with simplified formula`);
    return Uc;
  }

  /**
   * Główna funkcja obliczająca OZC
   */
  async function calculateOZC(payload) {
    const warnings = [];
    const assumptions = [];

    // Geometria
    const geo = computeGeometry(payload, warnings, assumptions);
    const areas = computeAreas(
      payload,
      geo.floorArea,
      geo.roofArea,
      payload.floor_height,
      geo.perimeter,
      warnings,
      assumptions
    );

    // Klimat
    const zoneId = 'PL_III';
    const climate = CLIMATE[zoneId] || { theta_e: -20, theta_m_e: 7.0 };
    assumePush(assumptions, 'climate zone resolved by fallback resolver (PL_III)');

    // Wartości U - HARD-LOCK dla trybu uproszczonego single_house
    let U_wall, U_roof, U_floor;

    // Mapowanie poziomów ocieplenia na wartości U
    const INSULATION_LEVEL_MAP = {
      walls: {
        poor: 0.9,
        average: 0.45,
        good: 0.23,
        very_good: 0.15,
      },
      roof: {
        poor: 1.0,
        average: 0.4,
        good: 0.18,
        very_good: 0.12,
      },
      floor: {
        poor: 0.8,
        average: 0.45,
        good: 0.25,
        very_good: 0.18,
      },
    };

    // HARD-LOCK: Dla single_house w trybie uproszczonym - TYLKO poziomy izolacji
    const isSimplifiedSingleHouse =
      payload.building_type === 'single_house' && payload.detailed_insulation_mode !== true;

    if (isSimplifiedSingleHouse) {
      // Diagnostyczny log
      assumePush(
        assumptions,
        'Single house: simplified insulation model enabled (levels → fixed U-values)'
      );

      // ŚCIANY - tylko z poziomu, ignoruj szczegółowe dane
      if (
        payload.walls_insulation_level &&
        INSULATION_LEVEL_MAP.walls[payload.walls_insulation_level]
      ) {
        U_wall = INSULATION_LEVEL_MAP.walls[payload.walls_insulation_level];
        assumePush(
          assumptions,
          `U_wall from simplified level: ${payload.walls_insulation_level} = ${U_wall}`
        );
      } else {
        // Fallback tylko jeśli brak poziomu (nie używamy external_wall_isolation!)
        U_wall = DEFAULTS.fallback.U_wall;
        warnPush(
          warnings,
          'Missing walls_insulation_level in simplified mode; using fallback U_wall'
        );
        assumePush(assumptions, 'U_wall from fallback (simplified mode, no level provided)');
      }

      // DACH - tylko z poziomu, ignoruj szczegółowe dane
      if (
        payload.roof_insulation_level &&
        INSULATION_LEVEL_MAP.roof[payload.roof_insulation_level]
      ) {
        U_roof = INSULATION_LEVEL_MAP.roof[payload.roof_insulation_level];
        assumePush(
          assumptions,
          `U_roof from simplified level: ${payload.roof_insulation_level} = ${U_roof}`
        );
      } else {
        // Fallback tylko jeśli brak poziomu (nie używamy top_isolation!)
        U_roof = DEFAULTS.fallback.U_roof;
        warnPush(
          warnings,
          'Missing roof_insulation_level in simplified mode; using fallback U_roof'
        );
        assumePush(assumptions, 'U_roof from fallback (simplified mode, no level provided)');
      }

      // PODŁOGA - tylko z poziomu, ignoruj szczegółowe dane
      if (
        payload.floor_insulation_level &&
        INSULATION_LEVEL_MAP.floor[payload.floor_insulation_level]
      ) {
        U_floor = INSULATION_LEVEL_MAP.floor[payload.floor_insulation_level];
        assumePush(
          assumptions,
          `U_floor from simplified level: ${payload.floor_insulation_level} = ${U_floor}`
        );
      } else {
        // Fallback tylko jeśli brak poziomu (nie używamy bottom_isolation!)
        U_floor = DEFAULTS.fallback.U_floor;
        warnPush(
          warnings,
          'Missing floor_insulation_level in simplified mode; using fallback U_floor'
        );
        assumePush(assumptions, 'U_floor from fallback (simplified mode, no level provided)');
      }
    } else {
      // TRYB SZCZEGÓŁOWY: użyj szczegółowych danych (materiał + grubość) lub fallback
      // Sprawdź najpierw czy są uproszczone poziomy (dla innych typów budynków, jeśli przypadkiem są)
      if (
        payload.walls_insulation_level &&
        INSULATION_LEVEL_MAP.walls[payload.walls_insulation_level]
      ) {
        U_wall = INSULATION_LEVEL_MAP.walls[payload.walls_insulation_level];
        assumePush(
          assumptions,
          `U_wall from simplified level: ${payload.walls_insulation_level} = ${U_wall}`
        );
      } else {
        // Fallback do szczegółowych danych lub obliczeń
        U_wall = resolveUFromMaterial(
          payload.external_wall_isolation?.material,
          payload.external_wall_isolation?.size,
          DEFAULTS.fallback.U_wall,
          warnings,
          assumptions,
          'U_wall'
        );
      }

      if (
        payload.roof_insulation_level &&
        INSULATION_LEVEL_MAP.roof[payload.roof_insulation_level]
      ) {
        U_roof = INSULATION_LEVEL_MAP.roof[payload.roof_insulation_level];
        assumePush(
          assumptions,
          `U_roof from simplified level: ${payload.roof_insulation_level} = ${U_roof}`
        );
      } else {
        // Fallback do szczegółowych danych lub obliczeń
        U_roof = resolveUFromMaterial(
          payload.top_isolation?.material,
          payload.top_isolation?.size,
          DEFAULTS.fallback.U_roof,
          warnings,
          assumptions,
          'U_roof'
        );
      }

      if (
        payload.floor_insulation_level &&
        INSULATION_LEVEL_MAP.floor[payload.floor_insulation_level]
      ) {
        U_floor = INSULATION_LEVEL_MAP.floor[payload.floor_insulation_level];
        assumePush(
          assumptions,
          `U_floor from simplified level: ${payload.floor_insulation_level} = ${U_floor}`
        );
      } else {
        // Fallback do szczegółowych danych lub obliczeń
        U_floor = resolveUFromMaterial(
          payload.bottom_isolation?.material,
          payload.bottom_isolation?.size,
          DEFAULTS.fallback.U_floor,
          warnings,
          assumptions,
          'U_floor'
        );
      }
    }

    const U_window = WINDOWS[payload.windows_type] || DEFAULTS.fallback.U_window;
    if (!WINDOWS[payload.windows_type]) {
      warnPush(warnings, `Unknown windows_type; fallback U_window`);
      assumePush(assumptions, 'fallback window U');
    }

    // Dla single_house w trybie uproszczonym: stała U_door = 1.8 (bez pytania o typ drzwi)
    // isSimplifiedSingleHouse już zdefiniowane wcześniej (linia 259)
    let U_door;
    if (isSimplifiedSingleHouse && !payload.doors_type) {
      U_door = 1.8; // Stała wartość dla uproszczonego trybu
      assumePush(assumptions, 'U_door = 1.8 (simplified mode for single_house)');
    } else {
      U_door = DOORS[payload.doors_type] || DEFAULTS.fallback.U_door;
      if (!DOORS[payload.doors_type] && payload.doors_type) {
        warnPush(warnings, `Unknown doors_type; fallback U_door`);
        assumePush(assumptions, 'fallback door U');
      }
    }

    // Wentylacja
    const vent = VENTILATION[payload.ventilation_type] || VENTILATION.natural;
    if (!VENTILATION[payload.ventilation_type]) {
      warnPush(warnings, `Unknown ventilation_type; fallback natural`);
      assumePush(assumptions, 'fallback ventilation natural');
    }

    const V_dot_m3h = vent.ach * geo.volume;
    const eta_rec = vent.eta_rec;

    // Korekty
    const thermalBridgesMultiplier = DEFAULTS.corrections.thermalBridgesMultiplier;
    const safetyFactor = DEFAULTS.corrections.safetyFactor;

    assumePush(assumptions, 'No construction year used. No guessing beyond defaults.');

    // Obliczenia
    const thetaInt = payload.indoor_temperature;
    const thetaE = climate.theta_e;
    const deltaT = thetaInt - thetaE;

    if (!Number.isFinite(deltaT) || deltaT <= 0) {
      warnPush(warnings, `Invalid deltaT; fallback 20K`);
      assumePush(assumptions, 'deltaT fallback=20K');
    }
    const dT = Number.isFinite(deltaT) && deltaT > 0 ? deltaT : 20;

    // HT = Σ(U_i * A_i)
    const HT =
      areas.walls * U_wall +
      areas.roof * U_roof +
      areas.floor * U_floor +
      areas.windows * U_window +
      areas.doors * U_door;

    // HV = 0.34 * V_dot
    const HV = 0.34 * V_dot_m3h;

    // Straty
    const phiT = HT * dT;
    const phiV = HV * dT * (1 - eta_rec);
    const phiPsi = phiT * (thermalBridgesMultiplier - 1);

    // Strategia A': Łagodne korekty addytywne (poza fizyką)
    const basePhysicsW = phiT + phiV + phiPsi;
    const additiveCorrections = computeAdditiveCorrectionsKw(payload);
    const baseW = basePhysicsW + additiveCorrections.totalKw * 1000;
    const total = baseW * safetyFactor;

    const Aref = areas.floor > 0 ? areas.floor : 1;
    const wPerM2 = total / Aref;

    // Sanity check
    if (wPerM2 < 20 || wPerM2 > 250) {
      warnPush(
        warnings,
        `Sanity-check: heatLossPerM2=${Math.round(wPerM2)} W/m2 looks suspicious.`
      );
    }

    // Dodaj assumptions z korekt
    if (additiveCorrections.notes.length > 0) {
      assumptions.push(...additiveCorrections.notes);
    }
    assumptions.push(
      "Strategy A' enabled: blended additive corrections (windows, doors, ventilation, basement)"
    );

    return {
      designHeatLoss_W: Math.round(total),
      designHeatLoss_kW: Math.round((total / 1000) * 100) / 100,
      heatLossPerM2: Math.round(wPerM2 * 100) / 100,
      breakdown: {
        transmission: Math.round(phiT),
        ventilation: Math.round(phiV),
        bridges: Math.round(phiPsi),
      },
      assumptions,
      warnings,
    };
  }

  /**
   * Strategia A': Łagodne korekty addytywne
   */
  function computeAdditiveCorrectionsKw(payload) {
    const notes = [];
    const cfg = {
      windowsBlend: 0.65,
      doorsBlend: 0.75,
      ventilationBlend: 0.7,
      basementBlend: 0.75,
      maxAbsTotalCorrectionKw: 2.5,
    };

    const WINDOW_DELTA_P_KW_FULL = {
      semi_new_double_glass: +0.9,
      old_double_glass: +1.7,
      old_single_glass: +2.4,
      new_double_glass: 0,
      new_triple_glass: -0.3,
      '2021_double_glass': -0.3,
      '2021_triple_glass': -0.5,
    };

    const DOOR_DELTA_P_KW_FULL = {
      old_wooden: +0.2,
      old_metal: +0.1,
      new_metal: 0,
      new_pvc: 0,
      new_wooden: 0,
    };

    const VENT_DELTA_P_KW_FULL = {
      natural: 0,
      mechanical: 0,
      mechanical_recovery: -1.0,
    };

    const BASEMENT_DELTA_P_KW_FULL = {
      worst: -0.1,
      poor: -0.2,
      medium: -0.3,
      great: -0.4,
    };

    function blendedDelta(fullDeltaKw, blend) {
      return fullDeltaKw * clamp(blend, 0, 1);
    }

    let windowsKw = blendedDelta(
      WINDOW_DELTA_P_KW_FULL[payload.windows_type] ?? 0,
      cfg.windowsBlend
    );
    windowsKw = clamp(windowsKw, -0.6, +1.5);

    let doorsKw = blendedDelta(DOOR_DELTA_P_KW_FULL[payload.doors_type] ?? 0, cfg.doorsBlend);
    doorsKw = clamp(doorsKw, -0.2, +0.2);

    let ventilationKw = blendedDelta(
      VENT_DELTA_P_KW_FULL[payload.ventilation_type] ?? 0,
      cfg.ventilationBlend
    );
    ventilationKw = clamp(ventilationKw, -0.7, 0);

    let basementKw = 0;
    if (payload.has_basement) {
      const underType = payload.unheated_space_under_type ?? 'medium';
      basementKw = blendedDelta(BASEMENT_DELTA_P_KW_FULL[underType] ?? -0.3, cfg.basementBlend);
      basementKw = clamp(basementKw, -0.3, 0);
    }

    const rawTotal = windowsKw + doorsKw + ventilationKw + basementKw;
    const totalKw = clamp(rawTotal, -cfg.maxAbsTotalCorrectionKw, cfg.maxAbsTotalCorrectionKw);

    if (rawTotal !== totalKw) {
      notes.push(
        `Additive correction clamped from ${rawTotal.toFixed(2)} kW to ${totalKw.toFixed(2)} kW`
      );
    }

    return {
      totalKw,
      partsKw: { windowsKw, doorsKw, ventilationKw, basementKw },
      notes,
    };
  }

  /**
   * Konwertuje do formatu cieplo.app
   * Pełny format zgodny z API cieplo.app
   */
  function convertToCieploAppFormat(ozcResult, payload) {
    const heatedArea =
      payload.floor_area || payload.building_length * payload.building_width || 100;
    const maxPower = ozcResult.designHeatLoss_kW;

    // Oblicz annual_energy_consumption bardziej realistycznie
    // Bazując na max_heating_power i średniej temperaturze zewnętrznej
    // Uproszczony model: E_year ≈ P_max * hours_at_design * factor
    // Dla Polski: ~2400 godzin ogrzewania, średnia temp ~2°C, design temp -20°C
    const avgOutdoorTemp = 1.9; // Średnia roczna temperatura zewnętrzna (PL_III)
    const designOutdoorTemp = -20;
    const indoorTemp = payload.indoor_temperature || 21;
    const heatingHours = 2400; // Przybliżona liczba godzin ogrzewania w roku

    // Współczynnik korekcyjny dla średniej temperatury vs projektowej
    const avgDeltaT = indoorTemp - avgOutdoorTemp;
    const designDeltaT = indoorTemp - designOutdoorTemp;
    const tempRatio = avgDeltaT / designDeltaT;

    // Roczne zużycie energii (uproszczony model)
    const annualEnergy = Math.round(
      maxPower * heatingHours * tempRatio * 0.85 // 0.85 = współczynnik korekcyjny
    );

    // Współczynnik zużycia energii na m²
    const energyFactor = heatedArea > 0 ? annualEnergy / heatedArea : 0;

    return {
      id: `OZC-${Date.now()}`,
      total_area: Math.round(heatedArea),
      heated_area: Math.round(heatedArea),
      design_outdoor_temperature: designOutdoorTemp,
      max_heating_power: Math.round(maxPower * 100) / 100,
      hot_water_power: 0,
      bivalent_point_heating_power: Math.round(maxPower * 0.8 * 100) / 100,
      avg_heating_power: Math.round(maxPower * 0.55 * 100) / 100,
      avg_outdoor_temperature: avgOutdoorTemp,
      annual_energy_consumption: annualEnergy,
      annual_energy_consumption_factor: Math.round(energyFactor),
      heating_power_factor: Math.round((ozcResult.heatLossPerM2 / 1000) * 1000) / 1000,
      source: 'internal_ozc_engine',
      fallback: false, // Teraz to główne źródło, nie fallback
    };
  }

  // Eksport
  window.OZCEngine = {
    calculate: calculateOZC,
    convertToCieploAppFormat: convertToCieploAppFormat,
  };
})();
