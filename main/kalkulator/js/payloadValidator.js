/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAYLOAD VALIDATOR — KANONICZNE WARIANTY PAYLOADU
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ARCHITECTURAL CONTRACT:
 * Payload wygenerowany z formularza MUSI w 100% pasować do JEDNEGO z wariantów.
 * Nie wolno akceptować payloadów „pomiędzy wariantami”.
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // 1️⃣ POLA WSPÓLNE – WYSTĘPUJĄ ZAWSZE (CORE)
  // ═══════════════════════════════════════════════════════════════════════════
  const CORE_FIELDS = [
    'building_type',
    'construction_year',
    'construction_type',
    'latitude',
    'longitude',
    'building_floors',
    'building_heated_floors',
    'floor_height',
    'building_roof',
    'has_basement',
    'has_balcony',
    'wall_size',
    'number_doors',
    'number_balcony_doors',
    'number_windows',
    'number_huge_windows',
    'doors_type',
    'windows_type',
    'indoor_temperature',
    'ventilation_type',
    'include_hot_water',
  ];

  // ═══════════════════════════════════════════════════════════════════════════
  // 2️⃣ GEOMETRIA BUDYNKU – DOKŁADNIE JEDEN WARIANT
  // ═══════════════════════════════════════════════════════════════════════════
  const GEOMETRY_VARIANTS = {
    A: ['building_length', 'building_width'], // długość + szerokość
    B: ['floor_area'], // powierzchnia (dla regular)
    C: ['building_shape', 'floor_area', 'floor_perimeter'], // nieregularny (building_shape === "irregular", floor_area dla nieregularnego)
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 3️⃣ KONSTRUKCJA ŚCIAN – ROZŁĄCZNE
  // ═══════════════════════════════════════════════════════════════════════════
  const WALLS_VARIANTS = {
    TRADITIONAL: {
      required: ['primary_wall_material'],
      optional: ['secondary_wall_material'],
      forbidden: ['internal_wall_isolation'],
    },
    CANADIAN: {
      required: ['internal_wall_isolation.material', 'internal_wall_isolation.size'],
      optional: [],
      forbidden: ['primary_wall_material', 'secondary_wall_material'],
    },
  };

  // Opcjonalna izolacja zewnętrzna (może występować w obu wariantach)
  const EXTERNAL_ISOLATION_FIELDS = ['external_wall_isolation.material', 'external_wall_isolation.size'];

  // ═══════════════════════════════════════════════════════════════════════════
  // 4️⃣ IZOLACJE GÓRA / DÓŁ (OPCJONALNE, ALE ATOMOWE)
  // ═══════════════════════════════════════════════════════════════════════════
  const TOP_ISOLATION_FIELDS = ['top_isolation.material', 'top_isolation.size'];
  const BOTTOM_ISOLATION_FIELDS = ['bottom_isolation.material', 'bottom_isolation.size'];

  // ═══════════════════════════════════════════════════════════════════════════
  // 5️⃣ GARAŻ – JEDEN Z DWÓCH (LUB ŻADEN)
  // ═══════════════════════════════════════════════════════════════════════════
  const GARAGE_FIELDS = {
    NEW: ['garage_type'],
    OLD: ['has_garage'],
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 6️⃣ CWU – WARIANTY ROZŁĄCZNE
  // ═══════════════════════════════════════════════════════════════════════════
  const CWU_VARIANTS = {
    OFF: {
      required: [], // include_hot_water: false (sprawdzane przez wartość)
      forbidden: ['hot_water_persons', 'hot_water_usage'],
    },
    ON: {
      required: ['hot_water_persons', 'hot_water_usage'],
      forbidden: [],
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 7️⃣ ZALEŻNE OD building_type
  // ═══════════════════════════════════════════════════════════════════════════
  const BUILDING_TYPE_SPECIFIC = {
    apartment: {
      required: ['whats_over', 'whats_under', 'whats_north', 'whats_south', 'whats_east', 'whats_west'],
      forbidden: ['on_corner', 'unheated_space_under_type', 'unheated_space_over_type'],
    },
    row_house: {
      required: ['on_corner'],
      forbidden: ['whats_over', 'whats_under', 'whats_north', 'whats_south', 'whats_east', 'whats_west'],
    },
    single_house: {
      required: [],
      optional: ['unheated_space_under_type', 'unheated_space_over_type'],
      forbidden: ['on_corner', 'whats_over', 'whats_under', 'whats_north', 'whats_south', 'whats_east', 'whats_west'],
    },
    double_house: {
      required: [],
      optional: ['unheated_space_under_type', 'unheated_space_over_type'],
      forbidden: ['on_corner', 'whats_over', 'whats_under', 'whats_north', 'whats_south', 'whats_east', 'whats_west'],
    },
    multifamily: {
      required: [],
      optional: ['number_stairways', 'number_elevators'],
      forbidden: ['on_corner'],
    },
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNKCJE POMOCNICZE
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Sprawdza czy pole istnieje w payloadzie (nie null, nie undefined, nie pusty string)
   */
  function hasField(payload, fieldName) {
    const value = payload[fieldName];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' && value.trim() === '') return false;
    return true;
  }

  /**
   * Sprawdza czy pole zagnieżdżone istnieje (np. "external_wall_isolation.material")
   * Obsługuje też sprawdzanie całego obiektu (np. "internal_wall_isolation")
   */
  function hasNestedField(payload, fieldPath) {
    const parts = fieldPath.split('.');
    let current = payload;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== 'object') return false;
      current = current[part];
    }
    if (current === null || current === undefined) return false;
    if (typeof current === 'string' && current.trim() === '') return false;
    // Jeśli to obiekt zagnieżdżony (np. {material: X, size: Y}), sprawdź czy ma przynajmniej jedną właściwość
    if (typeof current === 'object' && !Array.isArray(current)) {
      return Object.keys(current).length > 0;
    }
    return true;
  }

  /**
   * Sprawdza czy pole istnieje (zwykłe lub zagnieżdżone)
   */
  function fieldExists(payload, fieldName) {
    if (fieldName.includes('.')) {
      return hasNestedField(payload, fieldName);
    }
    return hasField(payload, fieldName);
  }

  /**
   * Sprawdza czy wszystkie wymagane pola są obecne
   */
  function allRequiredFieldsPresent(payload, requiredFields) {
    return requiredFields.every(field => fieldExists(payload, field));
  }

  /**
   * Sprawdza czy żadne zabronione pola nie są obecne
   */
  function noForbiddenFieldsPresent(payload, forbiddenFields) {
    return forbiddenFields.every(field => !fieldExists(payload, field));
  }

  /**
   * Sprawdza czy wszystkie pola z grupy są obecne (atomowość)
   */
  function isAtomicGroup(payload, fields) {
    const presentCount = fields.filter(f => fieldExists(payload, f)).length;
    // Albo wszystkie są obecne, albo żadne
    return presentCount === 0 || presentCount === fields.length;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WYKRYWANIE WARIANTU GEOMETRII
  // ═══════════════════════════════════════════════════════════════════════════

  function detectGeometryVariant(payload) {
    console.log('%c[PayloadValidator] Wykrywanie wariantu geometrii:', 'color: #3b82f6; font-weight: bold;');

    // WARIANT C: nieregularny (musi mieć building_shape === "irregular")
    if (hasField(payload, 'building_shape') && payload.building_shape === 'irregular') {
      console.log('[PayloadValidator] Sprawdzam WARIANT C (irregular)');
      // Dla nieregularnego: floor_area + floor_perimeter (nie building_length/width)
      const hasFloorArea = hasField(payload, 'floor_area');
      const hasFloorPerimeter = hasField(payload, 'floor_perimeter');
      const hasLength = hasField(payload, 'building_length');
      const hasWidth = hasField(payload, 'building_width');

      console.log('[PayloadValidator] C - floor_area:', hasFloorArea, 'floor_perimeter:', hasFloorPerimeter, 'building_length:', hasLength, 'building_width:', hasWidth);

      if (hasFloorArea && hasFloorPerimeter && !hasLength && !hasWidth) {
        console.log('%c[PayloadValidator] ✅ Wykryto WARIANT C (irregular)', 'color: #22c55e; font-weight: bold;');
        return 'C';
      } else {
        console.warn('[PayloadValidator] ❌ WARIANT C nie spełnia warunków');
      }
    }

    // WARIANT A: długość + szerokość (NIE może mieć building_shape === "irregular")
    const hasLength = hasField(payload, 'building_length');
    const hasWidth = hasField(payload, 'building_width');
    const hasFloorArea = hasField(payload, 'floor_area');
    const isIrregular = hasField(payload, 'building_shape') && payload.building_shape === 'irregular';

    console.log('[PayloadValidator] Sprawdzam WARIANT A (dimensions)');
    console.log('[PayloadValidator] A - building_length:', hasLength, 'building_width:', hasWidth, 'floor_area:', hasFloorArea, 'isIrregular:', isIrregular);

    if (hasLength && hasWidth && !hasFloorArea && !isIrregular) {
      console.log('%c[PayloadValidator] ✅ Wykryto WARIANT A (dimensions)', 'color: #22c55e; font-weight: bold;');
      return 'A';
    }

    // WARIANT B: powierzchnia (NIE może mieć building_length/width, NIE może być irregular)
    console.log('[PayloadValidator] Sprawdzam WARIANT B (area)');
    console.log('[PayloadValidator] B - floor_area:', hasFloorArea, 'building_length:', hasLength, 'building_width:', hasWidth, 'isIrregular:', isIrregular);

    if (hasFloorArea && !hasLength && !hasWidth && !isIrregular) {
      console.log('%c[PayloadValidator] ✅ Wykryto WARIANT B (area)', 'color: #22c55e; font-weight: bold;');
      return 'B';
    }

    console.error('%c[PayloadValidator] ❌ Nie wykryto żadnego wariantu geometrii!', 'color: #ef4444; font-weight: bold;');
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WYKRYWANIE WARIANTU ŚCIAN
  // ═══════════════════════════════════════════════════════════════════════════

  function detectWallsVariant(payload) {
    // TRADITIONAL: ma primary_wall_material, NIE MA internal_wall_isolation (całego obiektu)
    const hasInternalIsolation = hasField(payload, 'internal_wall_isolation');
    const hasPrimaryMaterial = hasField(payload, 'primary_wall_material');

    if (hasPrimaryMaterial && !hasInternalIsolation) {
      // Sprawdź czy nie ma zabronionych pól
      if (noForbiddenFieldsPresent(payload, WALLS_VARIANTS.TRADITIONAL.forbidden)) {
        return 'TRADITIONAL';
      }
    }

    // CANADIAN: ma internal_wall_isolation (z material i size), NIE MA primary_wall_material
    if (hasInternalIsolation && !hasPrimaryMaterial) {
      // Sprawdź czy internal_wall_isolation ma wymagane pola
      const internalIsolation = payload.internal_wall_isolation;
      if (
        internalIsolation &&
        typeof internalIsolation === 'object' &&
        hasField(internalIsolation, 'material') &&
        hasField(internalIsolation, 'size')
      ) {
        // Sprawdź czy nie ma zabronionych pól
        if (noForbiddenFieldsPresent(payload, WALLS_VARIANTS.CANADIAN.forbidden)) {
          return 'CANADIAN';
        }
      }
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WYKRYWANIE WARIANTU CWU
  // ═══════════════════════════════════════════════════════════════════════════

  function detectCwuVariant(payload) {
    const includeHotWater = payload.include_hot_water;
    const isCwuOn = includeHotWater === true || includeHotWater === 'yes' || includeHotWater === 1;

    if (isCwuOn) {
      // CWU ON: musi mieć hot_water_persons i hot_water_usage
      if (allRequiredFieldsPresent(payload, CWU_VARIANTS.ON.required)) {
        return 'ON';
      }
    } else {
      // CWU OFF: NIE MOŻE mieć hot_water_persons ani hot_water_usage
      if (noForbiddenFieldsPresent(payload, CWU_VARIANTS.OFF.forbidden)) {
        return 'OFF';
      }
    }

    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GŁÓWNA FUNKCJA WALIDACJI
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Waliduje payload względem kanonicznych wariantów
   * @param {Object} payload - Payload do walidacji
   * @returns {{valid: boolean, variant?: string, errors?: string[]}}
   */
  function validatePayload(payload) {
    // Logowanie wejściowego payloadu
    console.log('%c[PayloadValidator] Walidacja payloadu:', 'color: #3b82f6; font-weight: bold;', payload);

    if (!payload || typeof payload !== 'object') {
      console.error('[PayloadValidator] Payload nie jest obiektem:', payload);
      return {
        valid: false,
        errors: ['Payload nie jest obiektem'],
      };
    }

    const errors = [];
    const variant = {
      geometry: null,
      walls: null,
      cwu: null,
      buildingType: null,
    };

    // 1. Sprawdź pola CORE (niektóre mogą być null/undefined, ale muszą być obecne w payloadzie)
    // Sprawdzamy czy pole istnieje w payloadzie (nawet jeśli jest null/undefined)
    const missingCore = CORE_FIELDS.filter(field => !(field in payload));
    if (missingCore.length > 0) {
      errors.push(`Brakujące pola CORE w payloadzie: ${missingCore.join(', ')}`);
    }

    // 2. Wykryj wariant geometrii
    variant.geometry = detectGeometryVariant(payload);
    if (!variant.geometry) {
      errors.push('Nieprawidłowy wariant geometrii (musi być A, B lub C)');
    }

    // 3. Wykryj wariant ścian
    variant.walls = detectWallsVariant(payload);
    if (!variant.walls) {
      errors.push('Nieprawidłowy wariant konstrukcji ścian (musi być TRADITIONAL lub CANADIAN)');
    }

    // 4. Sprawdź izolację zewnętrzną (opcjonalna, ale atomowa)
    const hasExternalIsolation = hasField(payload, 'external_wall_isolation');
    if (hasExternalIsolation) {
      const extIsolation = payload.external_wall_isolation;
      if (extIsolation && typeof extIsolation === 'object') {
        const hasMaterial = hasField(extIsolation, 'material');
        const hasSize = hasField(extIsolation, 'size');
        if (hasMaterial !== hasSize) {
          errors.push('Izolacja zewnętrzna musi być kompletna (material + size) lub całkowicie pusta');
        }
      }
    }

    // 5. Sprawdź izolację góry (opcjonalna, ale atomowa)
    const hasTopIsolation = hasField(payload, 'top_isolation');
    if (hasTopIsolation) {
      const topIsolation = payload.top_isolation;
      if (topIsolation && typeof topIsolation === 'object') {
        const hasMaterial = hasField(topIsolation, 'material');
        const hasSize = hasField(topIsolation, 'size');
        if (hasMaterial !== hasSize) {
          errors.push('Izolacja dachu musi być kompletna (material + size) lub całkowicie pusta');
        }
      }
    }

    // 6. Sprawdź izolację dołu (opcjonalna, ale atomowa)
    const hasBottomIsolation = hasField(payload, 'bottom_isolation');
    if (hasBottomIsolation) {
      const bottomIsolation = payload.bottom_isolation;
      if (bottomIsolation && typeof bottomIsolation === 'object') {
        const hasMaterial = hasField(bottomIsolation, 'material');
        const hasSize = hasField(bottomIsolation, 'size');
        if (hasMaterial !== hasSize) {
          errors.push('Izolacja podłogi musi być kompletna (material + size) lub całkowicie pusta');
        }
      }
    }

    // 7. Sprawdź garaż (garage_type ma pierwszeństwo nad has_garage)
    const hasGarageType = fieldExists(payload, GARAGE_FIELDS.NEW[0]);
    const hasGarageOld = fieldExists(payload, GARAGE_FIELDS.OLD[0]);
    if (hasGarageType && hasGarageOld) {
      errors.push('Nie można mieć jednocześnie garage_type i has_garage');
    }

    // 8. Wykryj wariant CWU
    variant.cwu = detectCwuVariant(payload);
    if (!variant.cwu) {
      errors.push('Nieprawidłowy wariant CWU (musi być ON lub OFF)');
    }

    // 9. Sprawdź pola specyficzne dla building_type
    const buildingType = payload.building_type;
    if (!buildingType) {
      errors.push('Brak building_type');
    } else {
      const buildingTypeRules = BUILDING_TYPE_SPECIFIC[buildingType];
      if (!buildingTypeRules) {
        errors.push(`Nieznany building_type: ${buildingType}`);
      } else {
        variant.buildingType = buildingType;

        // Sprawdź wymagane pola
        const missingRequired = buildingTypeRules.required.filter(field => !fieldExists(payload, field));
        if (missingRequired.length > 0) {
          errors.push(`Brakujące pola dla ${buildingType}: ${missingRequired.join(', ')}`);
        }

        // Sprawdź zabronione pola
        const presentForbidden = buildingTypeRules.forbidden.filter(field => fieldExists(payload, field));
        if (presentForbidden.length > 0) {
          errors.push(`Zabronione pola dla ${buildingType}: ${presentForbidden.join(', ')}`);
        }
      }
    }

    // Jeśli są błędy, zwróć je
    if (errors.length > 0) {
      const result = {
        valid: false,
        variant: variant.geometry && variant.walls && variant.cwu ? `${variant.geometry}-${variant.walls}-${variant.cwu}-${variant.buildingType}` : null,
        errors,
      };
      console.log('%c[PayloadValidator] Wynik walidacji (BŁĘDY):', 'color: #ef4444; font-weight: bold;', result);
      return result;
    }

    // Payload jest prawidłowy
    const result = {
      valid: true,
      variant: `${variant.geometry}-${variant.walls}-${variant.cwu}-${variant.buildingType}`,
    };
    console.log('%c[PayloadValidator] Wynik walidacji (OK):', 'color: #22c55e; font-weight: bold;', result);
    return result;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EKSPORT
  // ═══════════════════════════════════════════════════════════════════════════

  window.PayloadValidator = {
    validate: validatePayload,
    CORE_FIELDS,
    GEOMETRY_VARIANTS,
    WALLS_VARIANTS,
    CWU_VARIANTS,
    BUILDING_TYPE_SPECIFIC,
  };
})(window);

