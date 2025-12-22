(function () {
  'use strict';

  window.buildJsonData = function buildJsonData() {
    //console.log('🔧 buildJsonData - zbieranie danych z formularza'); // USUNIĘTE NADMIAROWE LOGOWANIE

    const data = {};
    const debugInfo = {
      defaultValues: [],
      userValues: [],
    };

    // Znajdź formularz
    let form =
      document.getElementById('heatCalcFormFull') ||
      document.getElementById('top-instal-calc') ||
      document.querySelector("form[data-calc='top-instal']") ||
      document.querySelector('#top-instal-calc') ||
      document.body;

    if (!form) {
      console.error('❌ Nie znaleziono formularza');
      throw new Error('Nie znaleziono formularza kalkulatora');
    }

    // Funkcje pomocnicze
    const getEl = name => form.querySelector(`[name="${name}"]`);

    const isVisible = el => {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return !(style.display === 'none' || style.visibility === 'hidden');
    };

    const get = name => {
      const el = getEl(name);
      if (!el) return null;

      // Pola hidden — zbieraj wartość jeśli nie jest pusta
      if (el.type === 'hidden') {
        const val = el.value?.trim();
        if (val !== '' && val !== null) {
          debugInfo.userValues.push(`${name} = ${val} (hidden)`);
        }
        return val === '' ? null : val;
      }

      // Dla pozostałych pól sprawdź widoczność
      if (!isVisible(el)) {
        return null;
      }

      if (el.type === 'checkbox') {
        if (el.checked) {
          debugInfo.userValues.push(`${name} = checked`);
        }
        return el.checked;
      }

      if (el.type === 'radio') {
        const checked = form.querySelector(`[name="${name}"]:checked`);
        if (checked) {
          debugInfo.userValues.push(`${name} = ${checked.value}`);
        }
        return checked ? checked.value : null;
      }

      // Suwaki (range) — zawsze zwracaj ich wartość
      if (el.type === 'range') {
        const val = el.value;
        debugInfo.userValues.push(`${name} = ${val} (slider)`);
        return val;
      }

      const val = el.value?.trim();
      if (val !== '' && val !== null) {
        debugInfo.userValues.push(`${name} = ${val}`);
      }
      return val === '' ? null : val;
    };

    const getNum = name => {
      const val = get(name);
      if (val === null) return null;
      const num = parseFloat(val);
      return isNaN(num) ? null : num;
    };

    const getBool = name => {
      const val = get(name);
      if (val === null) return null;
      // Zwróć prawdziwy boolean, nie string
      // Obsługuj checkboxy (checked = true) i radio buttons (value = "yes"/"no")
      if (val === true) return true; // Checkbox checked
      if (val === 'yes' || val === 'true' || val === 1 || val === '1') return true;
      if (val === 'no' || val === 'false' || val === 0 || val === '0') return false;
      return null;
    };

    const getCheckedArray = name => {
      const els = form.querySelectorAll(`[name="${name}"]:checked`);
      return Array.from(els)
        .filter(el => isVisible(el))
        .map(el => parseInt(el.value))
        .filter(val => !isNaN(val))
        .sort((a, b) => a - b);
    };

    // === POLA OBOWIĄZKOWE - KRYSTALICZNIE IDEALNE ===

    // 1. Typ budynku (enum) - WYMAGANE
    const buildingTypeMap = {
      single_house: 'single_house',
      dom_jednorodzinny: 'single_house',
      double_house: 'double_house',
      blizniacza: 'double_house',
      row_house: 'row_house',
      szeregowiec: 'row_house',
      apartment: 'apartment',
      mieszkanie: 'apartment',
      multifamily: 'multifamily',
    };
    // Dla building_type używamy ZAWSZE stanu formEngine jako źródła prawdy (najpewniejsze),
    // a DOM i globalny helper jako fallbacki (mogą być nieaktualne gdy zakładki są ukryte).
    let buildingTypeRaw = null;

    // 🔥 ŹRÓDŁO PRAWDY: stan formEngine (odporne na ukryte zakładki, resety DOM, itp.)
    if (
      typeof window !== 'undefined' &&
      window.formEngine &&
      typeof window.formEngine.getState === 'function'
    ) {
      try {
        const engineState = window.formEngine.getState() || {};
        const stateVal = engineState.building_type;
        if (stateVal !== undefined && stateVal !== null) {
          const stateStr = String(stateVal).trim();
          if (stateStr !== '' && stateStr !== 'undefined' && stateStr !== 'null') {
            buildingTypeRaw = stateStr;
          }
        }
      } catch (e) {
        console.warn(
          'buildJsonData: błąd podczas pobierania building_type z formEngine.getState()',
          e
        );
      }
    }

    // 🔁 Fallback 1: DOM (jeśli formEngine nie ma wartości)
    if (buildingTypeRaw === null || buildingTypeRaw === '') {
      const buildingTypeEl = getEl('building_type');
      if (buildingTypeEl && buildingTypeEl.value !== undefined && buildingTypeEl.value !== null) {
        const rawValue = String(buildingTypeEl.value).trim();
        // Ignoruj wartości "undefined", "null", puste stringi
        if (rawValue !== '' && rawValue !== 'undefined' && rawValue !== 'null') {
          buildingTypeRaw = rawValue;
        }
      }
    }

    // 🔁 Fallback 2: globalny helper (np. gdy input jest poza formą)
    if (
      (buildingTypeRaw === null || buildingTypeRaw === '') &&
      typeof window !== 'undefined' &&
      typeof window.getBuildingType === 'function'
    ) {
      try {
        const globalVal = String(window.getBuildingType() || '').trim();
        if (globalVal !== '' && globalVal !== 'undefined' && globalVal !== 'null') {
          buildingTypeRaw = globalVal;
        }
      } catch (e) {
        console.warn('buildJsonData: błąd podczas pobierania building_type z getBuildingType()', e);
      }
    }
    if (buildingTypeRaw !== null && buildingTypeRaw !== '') {
      const mappedValue = buildingTypeMap[buildingTypeRaw];
      data.building_type = mappedValue !== undefined ? mappedValue : buildingTypeRaw;
    }

    // 2. Rok budowy (integer) - zgodny z dokumentacją API
    const constructionYearMap = {
      // Bezpośrednie wartości z HTML (zgodne z API)
      2025: 2025,
      2021: 2021,
      2011: 2011,
      2000: 2000,
      1990: 1990,
      1980: 1980,
      1970: 1970,
      1960: 1960,
      1950: 1950,
      1940: 1940,
      1939: 1939,
      1914: 1914,
      // Zachowaj stare mapowanie dla kompatybilności (przedziały)
      '2020-2024': 2021,
      '2011-2020': 2011,
      '2000-2010': 2000,
      '1990-1999': 1990,
      '1980-1989': 1980,
      '1970-1979': 1970,
      '1960-1969': 1960,
      '1950-1959': 1950,
      '1940-1949': 1940,
      przed_1940: 1939,
      przed_1914: 1914,
    };
    const yearRaw = get('construction_year') || get('construction_year_range');
    if (yearRaw !== null) {
      data.construction_year = constructionYearMap[yearRaw] || getNum('construction_year');
    } else {
      const yearNum = getNum('construction_year');
      if (yearNum !== null) {
        data.construction_year = yearNum;
      }
    }

    // 3. Typ konstrukcji (enum)
    const constructionTypeMap = {
      traditional: 'traditional',
      murowany: 'traditional',
      tradycyjny: 'traditional',
      canadian: 'canadian',
      szkieletowy: 'canadian',
      kanadyjski: 'canadian',
    };
    const constructionTypeRaw = get('construction_type');
    if (constructionTypeRaw !== null) {
      data.construction_type = constructionTypeMap[constructionTypeRaw] || constructionTypeRaw;
    }

    // 4. Lokalizacja (latitude, longitude) - precyzyjne współrzędne
    const locationMap = {
      PL_DOLNOSLASKIE_WROCLAW: { lat: 51.1079, lon: 17.0385 },
      PL_GDANSK: { lat: 54.352, lon: 18.6466 },
      PL_KUJAWSKOPOMORSKIE_BYDGOSZCZ: { lat: 53.1235, lon: 18.0084 },
      PL_ZAKOPANE: { lat: 49.2992, lon: 19.9496 },
      PL_STREFA_IV: { lat: 49.6216, lon: 20.697 },
      PL_STREFA_I: { lat: 54.352, lon: 18.6466 },
      PL_STREFA_II: { lat: 52.2297, lon: 21.0122 },
      PL_STREFA_III: { lat: 50.0647, lon: 19.945 },
      PL_STREFA_V: { lat: 49.2992, lon: 19.9496 },
      default: { lat: 51.4453433, lon: 16.2334445 }, // Przykład z dokumentacji
    };
    const locationId = get('location_id') || get('climate_zone');
    if (locationId !== null) {
      const coords = locationMap[locationId] || locationMap['default'];
      data.latitude = coords.lat;
      data.longitude = coords.lon;
    } else {
      // Fallback tylko jeśli brak wyboru
      const coords = locationMap['default'];
      data.latitude = coords.lat;
      data.longitude = coords.lon;
    }

    // 5. Wymiary budynku - KRYSTALICZNIE IDEALNE według API
    // Kształt budynku - opcjonalny, domyślnie "regular"
    const buildingShapeMap = {
      regular: 'regular',
      regularny: 'regular',
      czworoboczny: 'regular',
      irregular: 'irregular',
      nieregularny: 'irregular',
      fikuśny: 'irregular',
    };
    const buildingShapeRaw = get('building_shape');
    const buildingShape = buildingShapeRaw
      ? buildingShapeMap[buildingShapeRaw] || buildingShapeRaw
      : null;

    // Powierzchnia zabudowy - warunkowe
    const floorAreaInput = getNum('floor_area') ?? getNum('floor_area_irregular');

    // Długość i szerokość - warunkowe (alternatywa dla floor_area)
    const buildingLength = getNum('building_length');
    const buildingWidth = getNum('building_width');

    if (
      buildingLength !== null &&
      buildingWidth !== null &&
      buildingLength > 0 &&
      buildingWidth > 0
    ) {
      // PRAWIDŁOWA IMPLEMENTACJA: building_length + building_width (alternatywa do floor_area)
      data.building_length = buildingLength;
      data.building_width = buildingWidth;
      // NIE generujemy floor_area - API przyjmuje building_length/width jako alternatywę
    } else if (floorAreaInput !== null && floorAreaInput > 0) {
      // PRAWIDŁOWA IMPLEMENTACJA: floor_area (alternatywa do building_length/width)
      data.floor_area = floorAreaInput;
    }
    // ✅ Nie dodajemy domyślnych wartości - błąd walidacji jeśli puste

    // Dodaj building_shape tylko gdy potrzebne
    if (buildingShape === 'irregular') {
      data.building_shape = 'irregular';

      // Obwód budynku - wymagany dla irregular shape
      const floorPerimeter = getNum('floor_perimeter');
      if (floorPerimeter !== null && floorPerimeter > 0) {
        data.floor_perimeter = floorPerimeter;
      }

      // Dla irregular MUSI być floor_area (zgodnie z dokumentacją)
      // ✅ Nie dodajemy domyślnej wartości - błąd walidacji jeśli puste
    }
    // Dla regular shape nie dodajemy building_shape (opcjonalne)

    // 6. Kondygnacje - WYMAGANE
    const buildingFloors = getNum('building_floors');
    if (buildingFloors !== null && buildingFloors > 0) {
      data.building_floors = buildingFloors;
    }

    // 7. Ogrzewane kondygnacji (array[integer]) - WYMAGANE
    // ✅ Zbieramy TYLKO zaznaczone checkboxy - nie generujemy automatycznie
    let heatedFloors = getCheckedArray('building_heated_floors[]');
    if (heatedFloors.length > 0) {
      data.building_heated_floors = heatedFloors.sort((a, b) => a - b);
    }
    // Jeśli brak zaznaczonych pięter - nie dodajemy do payloadu (błąd walidacji API)

    // 8. Wysokość kondygnacji (enum/double)
    const floorHeightMap = {
      niskie: 2.3,
      2.3: 2.3,
      low: 2.3,
      standardowe: 2.6,
      2.6: 2.6,
      standard: 2.6,
      wysokie: 3.1,
      3.1: 3.1,
      high: 3.1,
      bardzo_wysokie: 4.1,
      4.1: 4.1,
      very_high: 4.1,
    };
    const floorHeightRaw = get('floor_height');
    if (floorHeightRaw !== null) {
      data.floor_height = floorHeightMap[floorHeightRaw] || getNum('floor_height');
    } else {
      const floorHeightNum = getNum('floor_height');
      if (floorHeightNum !== null) {
        data.floor_height = floorHeightNum;
      }
    }

    // 9. Rodzaj dachu (enum)
    const buildingRoofMap = {
      flat: 'flat',
      plaski: 'flat',
      płaski: 'flat',
      oblique: 'oblique',
      skosy: 'oblique',
      skośny: 'oblique',
      steep: 'steep',
      stromy: 'steep',
      poddasze: 'steep',
    };
    const buildingRoofRaw = get('building_roof');
    if (buildingRoofRaw !== null) {
      data.building_roof = buildingRoofMap[buildingRoofRaw] || buildingRoofRaw;
    }

    // 10. Piwnica (boolean) - WYMAGANE
    const hasBasement = getBool('has_basement');
    if (hasBasement !== null) {
      data.has_basement = hasBasement;
    }

    // 11. Balkon (boolean) - WYMAGANE
    const hasBalcony = getBool('has_balcony');
    if (hasBalcony !== null) {
      data.has_balcony = hasBalcony;
    }

    // 12. Garaż (enum) - KRYSTALICZNIE IDEALNE
    const garageTypeMap = {
      none: null,
      brak: null,
      single_unheated: 'single_unheated',
      jeden_nieogrzewany: 'single_unheated',
      single_heated: 'single_heated',
      jeden_ogrzewany: 'single_heated',
      double_unheated: 'double_unheated',
      dwa_nieogrzewane: 'double_unheated',
      double_heated: 'double_heated',
      dwa_ogrzewane: 'double_heated',
    };
    const garageTypeRaw = get('garage_type');
    if (garageTypeRaw !== null) {
      const garageType = garageTypeMap[garageTypeRaw];
      if (garageType !== null && garageType !== undefined) {
        data.garage_type = garageType;
      }
    }

    // 13. Ściany - WYMAGANE
    // Grubość ściany (integer, cm) - zbieraj jeśli slider jest potwierdzony
    const wallSizeEl = getEl('wall_size');
    let wallSize = null;
    if (wallSizeEl) {
      // Sprawdź czy slider jest potwierdzony (data-slider-confirmed="true")
      const isSliderConfirmed = wallSizeEl.dataset.sliderConfirmed === 'true';
      if (isSliderConfirmed) {
        const val = wallSizeEl.value?.trim();
        if (val !== '' && val !== null) {
          const num = parseFloat(val);
          if (!isNaN(num) && num > 0) {
            wallSize = num;
          }
        }
      }
    }
    if (wallSize !== null) {
      data.wall_size = wallSize;
    }

    // 14. Materiał podstawowy ścian (wymagane dla traditional)
    if (data.construction_type === 'traditional') {
      const primaryMaterial = getNum('primary_wall_material');
      if (primaryMaterial !== null && primaryMaterial > 0) {
        data.primary_wall_material = primaryMaterial;
      }
    }

    // 15. Materiał dodatkowy ścian (opcjonalny)
    const hasSecondaryMaterial = getBool('has_secondary_wall_material');
    if (hasSecondaryMaterial === true) {
      const secondaryMaterial = getNum('secondary_wall_material');
      if (secondaryMaterial !== null && secondaryMaterial > 0) {
        data.secondary_wall_material = secondaryMaterial;
      }
    }

    // 16. IZOLACJE - KRYSTALICZNIE IDEALNE według dokumentacji API

    // Funkcja pomocnicza do zbierania wartości z pól (dla izolacji)
    const getValueIgnoringDisabled = (name, isNum = false) => {
      // Dla radio buttons - sprawdź checked
      const radioEl = form.querySelector(`input[type="radio"][name="${name}"]`);
      if (radioEl) {
        const checked = form.querySelector(`input[type="radio"][name="${name}"]:checked`);
        if (checked && isVisible(checked)) {
          return checked.value;
        }
        return null;
      }

      // Dla pozostałych pól (select, input hidden, input text)
      const el = getEl(name);
      if (!el) return null;

      // Dla hidden fields z sliderami - sprawdź czy slider jest potwierdzony
      if (el.type === 'hidden' && el.dataset.requiresConfirm === 'true') {
        const isSliderConfirmed = el.dataset.sliderConfirmed === 'true';
        // Zbierz wartość tylko jeśli slider jest potwierdzony
        if (!isSliderConfirmed) {
          return null;
        }
      } else if (el.type === 'select-one' || el.tagName === 'SELECT') {
        // Dla selectów w kontenerze canadianOptions - sprawdź wartość nawet jeśli kontener jest ukryty
        // (jeśli construction_type === "canadian", to te pola są wymagane)
        const canadianContainer = el.closest('#canadianOptions');
        if (canadianContainer && data.construction_type === 'canadian') {
          // Dla canadian zbieraj wartość nawet jeśli kontener jest ukryty
        } else {
          // Dla pozostałych selectów sprawdź widoczność
          if (!isVisible(el)) return null;
        }
      } else {
        // Dla pozostałych pól sprawdź widoczność
        if (!isVisible(el)) return null;
      }

      // Zbierz wartość
      const val = el.value?.trim();
      if (val === '' || val === null) return null;

      if (isNum) {
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      }
      return val;
    };

    // Izolacja wewnętrzna ściany (wymagane dla canadian)
    if (data.construction_type === 'canadian') {
      // Dla canadian izolacja wewnętrzna jest zawsze wymagana
      // Select material - sprawdź bezpośrednio
      const intMatEl =
        getEl('internal_wall_isolation[material]') || getEl('internal_isolation_material');
      let intMat = null;
      if (intMatEl && intMatEl.value) {
        const matVal = parseInt(intMatEl.value);
        if (!isNaN(matVal) && matVal > 0) {
          intMat = matVal;
        }
      }

      // Hidden field size - sprawdź czy slider jest potwierdzony
      const intSizeEl = getEl('internal_wall_isolation[size]') || getEl('internal_isolation_size');
      let intSize = null;
      if (intSizeEl) {
        const isSliderConfirmed = intSizeEl.dataset.sliderConfirmed === 'true';
        if (isSliderConfirmed) {
          const sizeVal = intSizeEl.value?.trim();
          if (sizeVal !== '' && sizeVal !== null) {
            const num = parseFloat(sizeVal);
            if (!isNaN(num) && num > 0) {
              intSize = num;
            }
          }
        }
      }

      if (intMat !== null && intSize !== null && intSize > 0) {
        data.internal_wall_isolation = { material: intMat, size: intSize };
      }
    } else {
      // Opcjonalnie dla traditional
      const hasInternalIsolation = getBool('has_internal_isolation');
      if (hasInternalIsolation === true) {
        const intMat =
          getNum('internal_wall_isolation[material]') || getNum('internal_isolation_material');
        const intSize =
          getNum('internal_wall_isolation[size]') || getNum('internal_isolation_size');
        if (intMat !== null && intSize !== null && intSize > 0) {
          data.internal_wall_isolation = { material: intMat, size: intSize };
        }
      }
    }

    // UPROSZCZONE POZIOMY IZOLACJI (dla single_house)
    // Sprawdź najpierw czy są uproszczone poziomy (priorytet)
    // Musimy to zrobić PRZED sprawdzaniem szczegółowych danych, aby uniknąć TDZ
    const wallsLevel = get('walls_insulation_level');
    const roofLevel = get('roof_insulation_level');
    const floorLevel = get('floor_insulation_level');

    // Sprawdź czy jest w trybie szczegółowym
    const detailedModeCheckbox = document.getElementById('detailed_insulation_mode');
    const detailedMode = detailedModeCheckbox ? detailedModeCheckbox.checked : false;
    data.detailed_insulation_mode = detailedMode;

    if (wallsLevel) {
      data.walls_insulation_level = wallsLevel;
    }
    if (roofLevel) {
      data.roof_insulation_level = roofLevel;
    }
    if (floorLevel) {
      data.floor_insulation_level = floorLevel;
    }

    // Docieplenie zewnętrzne ścian (opcjonalny) - tylko jeśli nie ma uproszczonego poziomu
    if (!wallsLevel) {
      // Sprawdź wartość radio buttona nawet jeśli disabled (ale tylko jeśli checked i widoczne)
      const hasExternalIsolationRaw = getValueIgnoringDisabled('has_external_isolation', false);
      const hasExternalIsolation =
        hasExternalIsolationRaw === 'yes' ||
        hasExternalIsolationRaw === 'true' ||
        hasExternalIsolationRaw === true;

      if (hasExternalIsolation === true) {
        // Zbieraj dane nawet jeśli pola są disabled
        // Sprawdź czy kontener jest widoczny - jeśli nie, to zbieraj dane bezpośrednio (użytkownik wybrał "yes")
        const externalContainer = document.getElementById('externalIsolationFields');
        const containerVisible = externalContainer ? isVisible(externalContainer) : false;

        // Funkcja pomocnicza do zbierania wartości z pól izolacji zewnętrznej
        const getExternalIsolationValue = (name, isNum = false) => {
          const el = getEl(name);
          if (!el) return null;

          // Jeśli kontener jest widoczny, sprawdź widoczność elementu
          // Jeśli kontener jest ukryty, ale radio button jest "yes", zbierz dane bezpośrednio
          if (containerVisible && !isVisible(el)) {
            return null;
          }

          // Zbierz wartość nawet jeśli disabled
          const val = el.value?.trim();
          if (val === '' || val === null) return null;

          if (isNum) {
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
          }
          return val;
        };

        const extMat =
          getExternalIsolationValue('external_wall_isolation[material]', true) ||
          getExternalIsolationValue('external_isolation_material', true);
        const extSize =
          getExternalIsolationValue('external_wall_isolation[size]', true) ||
          getExternalIsolationValue('external_isolation_size', true);
        if (extMat !== null && extSize !== null && extSize > 0) {
          data.external_wall_isolation = { material: extMat, size: extSize };
        }
      }
    } // Koniec if (!wallsLevel)

    // Izolacja od góry (opcjonalny) - tylko jeśli nie ma uproszczonego poziomu
    if (!roofLevel) {
      const hasTopIsolation = get('top_isolation');
      if (hasTopIsolation === 'yes') {
        // Spróbuj najpierw po name z nawiasami, potem po ID
        const topMat =
          getNum('top_isolation[material]') ||
          (() => {
            const el = document.getElementById('top_isolation_material');
            if (el && el.value) return parseFloat(el.value);
            return null;
          })();
        const topSize =
          getNum('top_isolation[size]') ||
          (() => {
            const el = document.getElementById('top_isolation_size');
            if (el && el.value) return parseFloat(el.value);
            return null;
          })();
        if (topMat !== null && topSize !== null && topSize > 0) {
          data.top_isolation = { material: topMat, size: topSize };
        }
      }
    }

    // Izolacja od dołu (opcjonalny) - tylko jeśli nie ma uproszczonego poziomu
    if (!floorLevel) {
      const hasBottomIsolation = get('bottom_isolation');
      if (hasBottomIsolation === 'yes') {
        // Spróbuj najpierw po name z nawiasami, potem po ID
        const botMat =
          getNum('bottom_isolation[material]') ||
          (() => {
            const el = document.getElementById('bottom_isolation_material');
            if (el && el.value) return parseFloat(el.value);
            return null;
          })();
        const botSize =
          getNum('bottom_isolation[size]') ||
          (() => {
            const el = document.getElementById('bottom_isolation_size');
            if (el && el.value) return parseFloat(el.value);
            return null;
          })();
        if (botMat !== null && botSize !== null && botSize > 0) {
          data.bottom_isolation = { material: botMat, size: botSize };
        }
      }
    }

    // 17. OKNA I DRZWI - WYMAGANE

    // Liczba drzwi zewnętrznych
    // Dla single_house w trybie uproszczonym: domyślnie 1 (bez pytania)
    const isSimplifiedSingleHouse =
      data.building_type === 'single_house' && !data.detailed_insulation_mode;
    if (isSimplifiedSingleHouse) {
      data.number_doors = 1; // Domyślna wartość dla uproszczonego trybu
    } else {
      const numDoors = getNum('number_doors');
      if (numDoors !== null && numDoors > 0) {
        data.number_doors = numDoors;
      }
    }

    // Liczba drzwi balkonowych - ZAWSZE WYMAGANE przez API
    // Gdy has_balcony === true → użyj wartości z formularza (lub domyślnie 1)
    // Gdy has_balcony === false → wyślij 0
    if (data.has_balcony === true) {
      const balconyDoors = getNum('number_balcony_doors');
      // API wymaga tego pola, więc zawsze dodajemy (domyślnie 1)
      if (balconyDoors !== null && balconyDoors >= 0) {
        data.number_balcony_doors = balconyDoors;
      } else {
        // Jeśli pole nie jest wypełnione, użyj domyślnej wartości 1
        data.number_balcony_doors = 1;
      }
    } else if (data.has_balcony === false) {
      // Gdy has_balcony === false, API nadal wymaga tego pola → wyślij 0
      data.number_balcony_doors = 0;
    } else {
      // Fallback - jeśli has_balcony nie jest ustawione, spróbuj pobrać wartość lub użyj 0
      const balconyDoors = getNum('number_balcony_doors');
      data.number_balcony_doors = balconyDoors !== null && balconyDoors >= 0 ? balconyDoors : 0;
    }

    // Liczba okien (typowe okno = 130x150cm)
    const numWindows = getNum('number_windows');
    if (numWindows !== null && numWindows > 0) {
      data.number_windows = numWindows;
    }

    // Liczba dużych przeszkleń (np. 3x3m)
    const numHugeWindows = getNum('number_huge_windows');
    data.number_huge_windows = numHugeWindows !== null && numHugeWindows >= 0 ? numHugeWindows : 0;

    // Typ drzwi zewnętrznych (enum)
    const doorsTypeMap = {
      old_wooden: 'old_wooden',
      stare_drewniane: 'old_wooden',
      old_metal: 'old_metal',
      stare_metalowe: 'old_metal',
      new_wooden: 'new_wooden',
      nowe_drewniane: 'new_wooden',
      new_metal: 'new_metal',
      nowe_metalowe: 'new_metal',
      new_pvc: 'new_pvc',
      nowe_pvc: 'new_pvc',
    };
    // Typ drzwi zewnętrznych
    // Dla single_house w trybie uproszczonym: nie wysyłamy (silnik użyje stałej U_door = 1.8)
    // isSimplifiedSingleHouse już zdefiniowane wcześniej (linia 661)
    if (!isSimplifiedSingleHouse) {
      const doorsTypeRaw = get('doors_type');
      if (doorsTypeRaw !== null) {
        data.doors_type = doorsTypeMap[doorsTypeRaw] || doorsTypeRaw;
      }
    }
    // Dla uproszczonego trybu: doors_type nie jest wysyłane, silnik użyje stałej U_door = 1.8

    // Typ okien (enum) - KRYSTALICZNIE IDEALNE mapowanie
    const windowsTypeMap = {
      '2021_triple_glass': '2021_triple_glass',
      '2021_double_glass': '2021_double_glass',
      new_triple_glass: 'new_triple_glass',
      new_double_glass: 'new_double_glass',
      semi_new_double_glass: 'semi_new_double_glass',
      old_double_glass: 'old_double_glass',
      old_single_glass: 'old_single_glass',
      trojszybowe_2021: '2021_triple_glass',
      dwuszybowe_2021: '2021_double_glass',
      trojszybowe_2011: 'new_triple_glass',
      dwuszybowe_2011: 'new_double_glass',
      zespolone: 'semi_new_double_glass',
      zwykle_podwojne: 'old_double_glass',
      pojedyncze: 'old_single_glass',
    };
    const windowsTypeRaw = get('windows_type');
    if (windowsTypeRaw !== null) {
      data.windows_type = windowsTypeMap[windowsTypeRaw] || windowsTypeRaw;
    }

    // 18. INSTALACJE - WYMAGANE

    // Temperatura wewnętrzna (double, °C)
    const indoorTemp = getNum('indoor_temperature');
    if (indoorTemp !== null) {
      data.indoor_temperature = indoorTemp;
    }

    // Typ wentylacji (enum)
    const ventilationTypeMap = {
      natural: 'natural',
      naturalna: 'natural',
      grawitacyjna: 'natural',
      mechanical: 'mechanical',
      mechaniczna: 'mechanical',
      mechanical_recovery: 'mechanical_recovery',
      z_odzyskiem: 'mechanical_recovery',
      rekuperacja: 'mechanical_recovery',
    };
    const ventilationTypeRaw = get('ventilation_type');
    if (ventilationTypeRaw !== null) {
      data.ventilation_type = ventilationTypeMap[ventilationTypeRaw] || ventilationTypeRaw;
    }

    // Typ instalacji grzewczej (enum) - WYMAGANE
    const heatingTypeMap = {
      underfloor: 'underfloor',
      podlogowe: 'underfloor',
      podlogowka: 'underfloor',
      radiators: 'radiators',
      kaloryfery: 'radiators',
      grzejniki: 'radiators',
      mixed: 'mixed',
      mieszane: 'mixed',
      mieszany: 'mixed',
    };
    const heatingTypeRaw = get('heating_type');
    if (heatingTypeRaw !== null) {
      data.heating_type = heatingTypeMap[heatingTypeRaw] || heatingTypeRaw;
    }

    // Główne źródło ciepła (enum) - WYMAGANE
    const sourceTypeMap = {
      air_to_water_hp: 'air_to_water_hp',
      pompa_ciepla: 'air_to_water_hp',
      pc: 'air_to_water_hp',
      gas: 'gas',
      gaz: 'gas',
      oil: 'oil',
      olej: 'oil',
      biomass: 'biomass',
      biomasa: 'biomass',
      district_heating: 'district_heating',
      cieplo_sieciowe: 'district_heating',
      siec: 'district_heating',
    };
    const sourceTypeRaw = get('source_type');
    if (sourceTypeRaw !== null) {
      data.source_type = sourceTypeMap[sourceTypeRaw] || sourceTypeRaw;
    }

    // 19. CWU - CIEPŁA WODA UŻYTKOWA (KRYSTALICZNIE IDEALNE)

    // Czy włączyć CWU (boolean) - ZAWSZE WYMAGANE przez API
    const includeHotWater = getBool('include_hot_water') || getBool('includeHotWater');
    // Zawsze wysyłaj include_hot_water (true lub false) - API wymaga tego pola
    data.include_hot_water = includeHotWater === true;

    if (data.include_hot_water === true) {
      // Liczba osób korzystających z CWU (integer) - WYMAGANE gdy include_hot_water=true
      const hotWaterPersons = getNum('hot_water_persons');
      if (hotWaterPersons !== null && hotWaterPersons > 0) {
        data.hot_water_persons = hotWaterPersons;
      }

      // Intensywność wykorzystania CWU (enum) - WYMAGANE gdy include_hot_water=true
      const hotWaterUsageRaw = get('hot_water_usage');

      // KRYSTALICZNIE IDEALNE mapowanie zgodnie z dokumentacją API
      const usageMap = {
        // Wartości z formularza WordPress
        low: 'shower',
        medium: 'shower_bath',
        high: 'bath',
        // Wartości bezpośrednie z API
        shower: 'shower',
        shower_bath: 'shower_bath',
        bath: 'bath',
        // Polskie nazwy
        prysznic: 'shower',
        prysznic_wanna: 'shower_bath',
        wanna: 'bath',
        // Alternatywne nazwy
        tylko_prysznic: 'shower',
        glownie_prysznic: 'shower_bath',
        tylko_wanna: 'bath',
      };

      if (hotWaterUsageRaw !== null) {
        data.hot_water_usage = usageMap[hotWaterUsageRaw] || hotWaterUsageRaw;
      }
    }

    // 20. MIESZKANIE - POLA SPECJALNE (KRYSTALICZNIE IDEALNE)
    if (data.building_type === 'apartment') {
      // Mapowanie zgodnie z dokumentacją API
      const spaceTypeMap = {
        heated_room: 'heated_room',
        ogrzewany_lokal: 'heated_room',
        unheated_room: 'unheated_room',
        nieogrzewany_lokal: 'unheated_room',
        korytarz: 'unheated_room',
        klatka: 'unheated_room',
        outdoor: 'outdoor',
        zewnatrz: 'outdoor',
        swiat_zewnetrzny: 'outdoor',
        ground: 'ground',
        grunt: 'ground',
      };

      // Co powyżej (whats_over) - WYMAGANE (NIE MA "ground" w API dla whats_over!)
      const whatsOverRaw = get('whats_over');
      if (whatsOverRaw !== null) {
        // Mapowanie bez "ground" - zgodnie z dokumentacją API
        if (whatsOverRaw === 'ground' || whatsOverRaw === 'grunt') {
          // Fallback do outdoor jeśli użytkownik wybrał ground (nie powinno się zdarzyć)
          data.whats_over = 'outdoor';
        } else {
          data.whats_over = spaceTypeMap[whatsOverRaw] || whatsOverRaw;
        }
      }

      // Co poniżej (whats_under) - WYMAGANE
      const whatsUnderRaw = get('whats_under');
      if (whatsUnderRaw !== null) {
        data.whats_under = spaceTypeMap[whatsUnderRaw] || whatsUnderRaw;
      }

      // Sąsiedztwo - wszystkie 4 strony WYMAGANE
      const whatsNorthRaw = get('whats_north');
      if (whatsNorthRaw !== null) {
        data.whats_north = spaceTypeMap[whatsNorthRaw] || whatsNorthRaw;
      }

      const whatsSouthRaw = get('whats_south');
      if (whatsSouthRaw !== null) {
        data.whats_south = spaceTypeMap[whatsSouthRaw] || whatsSouthRaw;
      }

      const whatsEastRaw = get('whats_east');
      if (whatsEastRaw !== null) {
        data.whats_east = spaceTypeMap[whatsEastRaw] || whatsEastRaw;
      }

      const whatsWestRaw = get('whats_west');
      if (whatsWestRaw !== null) {
        data.whats_west = spaceTypeMap[whatsWestRaw] || whatsWestRaw;
      }
    }

    // 21. SZEREGOWIEC - POLA SPECJALNE
    if (data.building_type === 'row_house') {
      // on_corner (boolean) - WYMAGANE dla row_house
      const onCorner = getBool('on_corner');
      if (onCorner !== null) {
        data.on_corner = onCorner;
      }
    }

    // 22. BUDYNEK WIELORODZINNY - POLA SPECJALNE (KRYSTALICZNIE IDEALNE)
    if (data.building_type === 'multifamily') {
      // Liczba klatek schodowych (opcjonalne)
      const stairways = getNum('number_stairways');
      if (stairways !== null && stairways > 0) {
        data.number_stairways = stairways;
      }

      // Liczba wind (opcjonalne)
      const elevators = getNum('number_elevators');
      if (elevators !== null && elevators > 0) {
        data.number_elevators = elevators;
      }
    }

    // 23. POLA OPCJONALNE - Jakość izolacji nieogrzewanych przestrzeni
    // Jakość izolacji przestrzeni nieogrzewanej poniżej (opcjonalne)
    const unheatedSpaceUnderRaw = get('unheated_space_under_type');
    if (unheatedSpaceUnderRaw !== null) {
      const unheatedSpaceMap = {
        worst: 'worst',
        poor: 'poor',
        medium: 'medium',
        great: 'great',
      };
      data.unheated_space_under_type =
        unheatedSpaceMap[unheatedSpaceUnderRaw] || unheatedSpaceUnderRaw;
    }

    // Jakość izolacji przestrzeni nieogrzewanej powyżej (opcjonalne)
    const unheatedSpaceOverRaw = get('unheated_space_over_type');
    if (unheatedSpaceOverRaw !== null) {
      const unheatedSpaceMap = {
        worst: 'worst',
        poor: 'poor',
        medium: 'medium',
        great: 'great',
      };
      data.unheated_space_over_type =
        unheatedSpaceMap[unheatedSpaceOverRaw] || unheatedSpaceOverRaw;
    }

    // === FINALNE CZYSZCZENIE - KRYSTALICZNIE IDEALNE ===

    // Usuń pola null/undefined - API cieplo.app nie akceptuje null
    Object.keys(data).forEach(key => {
      if (data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });

    // Walidacja KRYSTALICZNIE IDEALNYCH danych
    // Sprawdź czy jest w trybie uproszczonym dla single_house
    // isSimplifiedSingleHouse już zdefiniowane wcześniej (linia 661)
    // Upewnijmy się, że wartość jest aktualna
    const isSimplifiedSingleHouseForValidation =
      data.building_type === 'single_house' && data.detailed_insulation_mode !== true;

    const requiredFields = [
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
      'number_balcony_doors',
      'number_windows',
      'number_huge_windows',
      'windows_type',
      'indoor_temperature',
      'ventilation_type',
      'heating_type',
      'source_type',
      'include_hot_water',
    ];

    // Dla single_house w trybie uproszczonym: doors_type i number_doors nie są wymagane
    // (silnik użyje stałej U_door = 1.8 i domyślnej liczby drzwi = 1)
    if (!isSimplifiedSingleHouseForValidation) {
      requiredFields.push('number_doors', 'doors_type');
    } else {
      // Dla trybu uproszczonego: wymagane są poziomy izolacji
      requiredFields.push(
        'walls_insulation_level',
        'roof_insulation_level',
        'floor_insulation_level'
      );
    }

    // Sprawdź czy wszystkie wymagane pola są obecne
    let missingFields = [];
    requiredFields.forEach(field => {
      if (data[field] === null || data[field] === undefined) {
        missingFields.push(field);
      }
    });

    // Specjalne walidacje warunkowe
    if (data.construction_type === 'traditional' && !data.primary_wall_material) {
      missingFields.push('primary_wall_material (required for traditional)');
    }

    if (data.construction_type === 'canadian' && !data.internal_wall_isolation) {
      missingFields.push('internal_wall_isolation (required for canadian)');
    }

    if (data.building_type === 'apartment') {
      const apartmentRequired = [
        'whats_over',
        'whats_under',
        'whats_north',
        'whats_south',
        'whats_east',
        'whats_west',
      ];
      apartmentRequired.forEach(field => {
        if (!data[field]) {
          missingFields.push(`${field} (required for apartment)`);
        }
      });
    }

    if (data.building_type === 'row_house') {
      if (data.on_corner === null || data.on_corner === undefined) {
        missingFields.push('on_corner (required for row_house)');
      }
    }

    // Walidacja dla single_house w trybie uproszczonym
    if (isSimplifiedSingleHouseForValidation) {
      if (!data.walls_insulation_level) {
        missingFields.push('walls_insulation_level (required for single_house in simplified mode)');
      }
      if (!data.roof_insulation_level) {
        missingFields.push('roof_insulation_level (required for single_house in simplified mode)');
      }
      if (!data.floor_insulation_level) {
        missingFields.push('floor_insulation_level (required for single_house in simplified mode)');
      }
    }

    if (data.include_hot_water === true) {
      if (!data.hot_water_persons)
        missingFields.push('hot_water_persons (required when include_hot_water=true)');
      if (!data.hot_water_usage)
        missingFields.push('hot_water_usage (required when include_hot_water=true)');
    }

    // number_balcony_doors jest ZAWSZE wymagane przez API (nawet gdy has_balcony=false)
    if (data.has_balcony !== null && data.has_balcony !== undefined) {
      if (data.number_balcony_doors === null || data.number_balcony_doors === undefined) {
        missingFields.push('number_balcony_doors (always required by API)');
      }
    }

    if (
      data.building_shape === 'irregular' &&
      (!data.floor_perimeter || data.floor_perimeter <= 0)
    ) {
      missingFields.push('floor_perimeter (required when building_shape=irregular)');
    }

    // Logowanie wyników - tylko w trybie debug
    if (missingFields.length > 0 && window.DEBUG_MISSING_FIELDS) {
      console.debug('⚠️ Brakujące pola (będą użyte domyślne):', missingFields);
    }

    // Walidacja krytycznych pól przed wysłaniem do API
    const criticalFields = [
      'building_type',
      'construction_year',
      'latitude',
      'longitude',
      'heating_type',
      'source_type',
    ];
    const missingCritical = criticalFields.filter(field => !data[field] && data[field] !== 0);

    if (missingCritical.length > 0 && window.DEBUG_MISSING_CRITICAL_FIELDS) {
      console.debug('🔍 [DEBUG] Brak krytycznych pól wymaganych przez API:', missingCritical);
      // Nie rzucaj błędu - API zwróci błędy walidacji, które obsłużymy
    }

    // Finalne podsumowanie z debug info
    //console.log('💎 KRYSTALICZNIE IDEALNE DANE - JSON gotowy!'); // USUNIĘTE NADMIAROWE LOGOWANIE
    //console.log('📦 Payload do cieplo.app:', data); // USUNIĘTE NADMIAROWE LOGOWANIE
    //console.log('🔢 Liczba pól:', Object.keys(data).length); // USUNIĘTE NADMIAROWE LOGOWANIE

    // Podsumowanie z kolorami
    const collectedCount = debugInfo.userValues.length;

    console.log(
      `%c✅ Pola zebrane: ${collectedCount}`,
      'color: #22c55e; font-weight: bold; font-size: 13px;'
    );

    if (window.__DEBUG_BUILD_JSON_DATA) {
      console.log(
        '%c[buildJsonData] Aktualny payload:',
        'color: #1d4ed8; font-weight: bold; padding:3px;',
        JSON.stringify(data, null, 2)
      );
    }

    return data;
  };

  /**
   * Czyści wizualne oznaczenia błędów w formularzu
   */
  window.clearValidationErrors = function () {
    const form =
      document.getElementById('heatCalcFormFull') ||
      document.getElementById('top-instal-calc') ||
      document.querySelector("form[data-calc='top-instal']") ||
      document.body;

    if (form) {
      const fields = form.querySelectorAll('input, select, textarea');
      fields.forEach(field => {
        field.style.border = '';
        field.style.backgroundColor = '';
      });
    }
  };

  // Global exports
  window.buildJsonData = buildJsonData;

  console.log('✅ Form Data Processor Module v4.1 loaded successfully');
})();
