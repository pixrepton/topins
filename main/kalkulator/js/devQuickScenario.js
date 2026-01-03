/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUICK SCENARIO — DEV MODE PRESET FORMULARZA
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Quick Scenario NIE jest alternatywnym kalkulatorem.
 * Jest trybem developerskim, który:
 * - programowo wypełnia ten sam obiekt danych, co pełny formularz,
 * - uruchamia ten sam flow, co użytkownik końcowy,
 * - nie duplikuje logiki OZC, renderu ani UI.
 *
 * ARCHITECTURAL CONTRACT:
 * - Quick Scenario wypełnia formularz programowo
 * - Następnie wywołuje normalny flow: buildJsonData() → callCieplo() → displayResults()
 * - Zero bezpośrednich wywołań OZC, zero ręcznego sterowania UI
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  // DEV PRESET — wartości odpowiadające realnemu domowi
  const QUICK_SCENARIO_PRESET = {
    building_type: 'single_house',
    construction_year: 2000,
    construction_type: 'traditional',
    latitude: 51.1079,
    longitude: 17.0385,
    building_length: 10,
    building_width: 5,
    building_floors: 1,
    // ✅ building_heated_floors będzie automatycznie wyznaczone przez calculateHeatedFloors()
    // building_heated_floors: [1, 2], // USUNIĘTE - auto-wyznaczane
    floor_height: 2.6,
    building_roof: 'steep',
    has_basement: false,
    has_balcony: true,
    wall_size: 50,
    primary_wall_material: 84,
    top_isolation: { material: 68, size: 30 },
    bottom_isolation: { material: 71, size: 5 },
    number_doors: 1,
    number_balcony_doors: 1,
    number_windows: 14,
    number_huge_windows: 0,
    doors_type: 'new_wooden',
    windows_type: '2021_triple_glass',
    indoor_temperature: 21,
    ventilation_type: 'natural',
    heating_type: 'underfloor',
    source_type: 'air_to_water_hp',
    include_hot_water: true,
    hot_water_persons: 4,
    hot_water_usage: 'shower_bath',
  };

  // Konfiguracja pól edytowalnych w modalu (rozszerzona o wszystkie kluczowe pola)
  const fieldConfigs = [
    // ═══════════════════════════════════════════════════════════════════════════
    // PODSTAWOWE INFORMACJE
    // ═══════════════════════════════════════════════════════════════════════════
    { key: 'construction_year', label: 'Rok budowy', type: 'number', step: 1, min: 1900, max: 2030 },
    {
      key: 'construction_type',
      label: 'Typ konstrukcji',
      type: 'select',
      options: [
        { value: 'traditional', label: 'Tradycyjna' },
        { value: 'canadian', label: 'Kanadyjska' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // WYMIARY
    // ═══════════════════════════════════════════════════════════════════════════
    { key: 'building_length', label: 'Długość budynku [m]', type: 'number', step: 0.5, min: 4, max: 40 },
    { key: 'building_width', label: 'Szerokość budynku [m]', type: 'number', step: 0.5, min: 3, max: 30 },
    { key: 'building_floors', label: 'Liczba kondygnacji', type: 'number', step: 1, min: 1, max: 4 },
    { key: 'floor_height', label: 'Wysokość kondygnacji [m]', type: 'number', step: 0.1, min: 2.2, max: 4.0 },

    // ═══════════════════════════════════════════════════════════════════════════
    // KONSTRUKCJA
    // ═══════════════════════════════════════════════════════════════════════════
    {
      key: 'building_roof',
      label: 'Typ dachu',
      type: 'select',
      options: [
        { value: 'flat', label: 'Płaski' },
        { value: 'steep', label: 'Skośny z poddaszem' },
        { value: 'oblique', label: 'Skośny bez poddasza' }
      ]
    },
    { key: 'has_basement', label: 'Ma piwnicę', type: 'boolean' },
    { key: 'has_balcony', label: 'Ma balkon', type: 'boolean' },
    { key: 'wall_size', label: 'Grubość ścian [cm]', type: 'number', step: 1, min: 20, max: 80 },
    {
      key: 'primary_wall_material',
      label: 'Materiał ścian',
      type: 'select',
      options: [
        { value: 84, label: 'Porotherm' },
        { value: 54, label: 'Beton komórkowy (Ytong, H+H, Termalica)' },
        { value: 63, label: 'Pustaki ceramiczne' },
        { value: 57, label: 'Cegła pełna' },
        { value: 60, label: 'Cegła silikatowa' },
        { value: 51, label: 'Beton' },
        { value: 52, label: 'Żelbet' },
        { value: 56, label: 'Drewno iglaste' },
        { value: 55, label: 'Drewno liściaste' },
        { value: 53, label: 'Pustak żużlobetonowy' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // IZOLACJE
    // ═══════════════════════════════════════════════════════════════════════════
    {
      key: 'top_isolation.material',
      label: 'Materiał izolacji stropu',
      type: 'select',
      options: [
        { value: 68, label: 'Styropian EPS' },
        { value: 69, label: 'Styropian XPS' },
        { value: 70, label: 'Wełna mineralna' },
        { value: 71, label: 'Pianka PUR' }
      ]
    },
    { key: 'top_isolation.size', label: 'Izolacja stropu [cm]', type: 'number', step: 1, min: 0, max: 40 },
    {
      key: 'bottom_isolation.material',
      label: 'Materiał izolacji podłogi',
      type: 'select',
      options: [
        { value: 68, label: 'Styropian EPS' },
        { value: 69, label: 'Styropian XPS' },
        { value: 70, label: 'Wełna mineralna' },
        { value: 71, label: 'Pianka PUR' }
      ]
    },
    { key: 'bottom_isolation.size', label: 'Izolacja podłogi [cm]', type: 'number', step: 1, min: 0, max: 30 },

    // ═══════════════════════════════════════════════════════════════════════════
    // OKNA I DRZWI
    // ═══════════════════════════════════════════════════════════════════════════
    {
      key: 'windows_type',
      label: 'Typ okien',
      type: 'select',
      options: [
        { value: '2021_triple_glass', label: 'Nowoczesne (od 2021) - 3-szybowe' },
        { value: '2021_double_glass', label: 'Nowoczesne (od 2021) - 2-szybowe' },
        { value: 'new_triple_glass', label: 'Współczesne - 3-szybowe' },
        { value: 'new_double_glass', label: 'Współczesne - 2-szybowe' },
        { value: 'semi_new_double_glass', label: 'Starsze zespolone (lata 90.)' },
        { value: 'old_double_glass', label: 'Stare okna 2-szybowe' },
        { value: 'old_single_glass', label: 'Stare okna 1-szybowe' }
      ]
    },
    { key: 'number_windows', label: 'Liczba okien', type: 'number', step: 1, min: 0, max: 40 },
    { key: 'number_huge_windows', label: 'Liczba dużych okien', type: 'number', step: 1, min: 0, max: 20 },
    {
      key: 'doors_type',
      label: 'Typ drzwi',
      type: 'select',
      options: [
        { value: 'new_pvc', label: 'Nowe PVC' },
        { value: 'new_wooden', label: 'Nowe drewniane' },
        { value: 'new_metal', label: 'Nowe metalowe' },
        { value: 'old_wooden', label: 'Stare drewniane' },
        { value: 'old_metal', label: 'Stare metalowe' }
      ]
    },
    { key: 'number_doors', label: 'Liczba drzwi', type: 'number', step: 1, min: 0, max: 10 },
    { key: 'number_balcony_doors', label: 'Liczba drzwi balkonowych', type: 'number', step: 1, min: 0, max: 10 },

    // ═══════════════════════════════════════════════════════════════════════════
    // INSTALACJA
    // ═══════════════════════════════════════════════════════════════════════════
    {
      key: 'source_type',
      label: 'Główne źródło ogrzewania',
      type: 'select',
      options: [
        { value: 'air_to_water_hp', label: 'Pompa ciepła powietrze-woda' },
        { value: 'gas', label: 'Gaz' },
        { value: 'oil', label: 'Olej' },
        { value: 'biomass', label: 'Biomasa' },
        { value: 'district_heating', label: 'Ciepło sieciowe' }
      ]
    },
    { key: 'indoor_temperature', label: 'Temperatura wewnętrzna [°C]', type: 'number', step: 1, min: 18, max: 24 },
    {
      key: 'ventilation_type',
      label: 'Typ wentylacji',
      type: 'select',
      options: [
        { value: 'natural', label: 'Naturalna (grawitacyjna)' },
        { value: 'mechanical', label: 'Mechaniczna (bez rekuperacji)' },
        { value: 'mechanical_recovery', label: 'Z rekuperacją' }
      ]
    },
    {
      key: 'heating_type',
      label: 'Typ ogrzewania',
      type: 'select',
      options: [
        { value: 'underfloor', label: 'Podłogowe' },
        { value: 'radiators', label: 'Grzejniki' },
        { value: 'mixed', label: 'Mieszane' }
      ]
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CWU
    // ═══════════════════════════════════════════════════════════════════════════
    { key: 'include_hot_water', label: 'Uwzględnij CWU', type: 'boolean' },
    { key: 'hot_water_persons', label: 'Liczba osób (CWU)', type: 'number', step: 1, min: 1, max: 10 },
    {
      key: 'hot_water_usage',
      label: 'Profil zużycia CWU',
      type: 'select',
      options: [
        { value: 'minimal', label: 'Minimalne' },
        { value: 'shower_bath', label: 'Standardowe (prysznic/kąpiel)' },
        { value: 'bath', label: 'Podwyższone (częste kąpiele)' }
      ]
    },
  ];

  function getByPath(obj, path) {
    return path
      .split('.')
      .reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), obj);
  }

  function setByPath(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    let current = obj;
    parts.forEach(key => {
      if (!current[key] || typeof current[key] !== 'object') current[key] = {};
      current = current[key];
    });
    current[last] = value;
  }

  /**
   * ✅ Automatycznie wyznacza ogrzewane kondygnacje na podstawie:
   * - building_floors (liczba kondygnacji)
   * - has_basement (czy ma piwnicę - pomijamy kondygnację 0)
   * - building_roof (jeśli 'steep' - pomijamy poddasze = building_floors + 1)
   */
  function calculateHeatedFloors(preset) {
    const floors = preset.building_floors || 1;
    const hasBasement = preset.has_basement === true || preset.has_basement === 'yes';
    const roofType = preset.building_roof || 'steep';

    const heatedFloors = [];

    // Kondygnacje od 1 do building_floors (pomijamy piwnicę = 0)
    for (let i = 1; i <= floors; i++) {
      heatedFloors.push(i);
    }

    // Jeśli ma poddasze (building_roof === 'steep'), NIE dodajemy poddasza do ogrzewanych
    // Poddasze to zwykle building_floors + 1, więc nie dodajemy go do listy

    console.log(`[Quick Scenario] 🔥 Automatycznie wyznaczono ogrzewane kondygnacje:`, heatedFloors);
    console.log(`[Quick Scenario] 📊 Parametry: floors=${floors}, hasBasement=${hasBasement}, roofType=${roofType}`);

    return heatedFloors;
  }

  /**
   * Wypełnia formularz programowo na podstawie presetu
   * Używa tej samej logiki, co fillFormFromURLParams
   */
  function fillFormFromPreset(preset) {
    const form = document.getElementById('heatCalcFormFull');
    if (!form) {
      console.error('❌ [Quick Scenario] Nie znaleziono formularza');
      return false;
    }

    // ✅ Automatycznie wyznacz ogrzewane kondygnacje jeśli nie są ustawione
    if (!preset.building_heated_floors || !Array.isArray(preset.building_heated_floors) || preset.building_heated_floors.length === 0) {
      preset.building_heated_floors = calculateHeatedFloors(preset);
      console.log(`[Quick Scenario] ✅ Ustawiono building_heated_floors:`, preset.building_heated_floors);
    }

    let filledFields = 0;
    const errors = [];

    // Funkcja pomocnicza do ustawiania wartości w polu
    function setFieldValue(fieldName, value) {
      const element = form.querySelector(`[name="${fieldName}"]`);
      if (!element) {
        // Próbuj znaleźć przez formEngine.state.setValue dla pól dynamicznych
        if (
          window.formEngine &&
          window.formEngine.state &&
          window.formEngine.state.setValue
        ) {
          try {
            window.formEngine.state.setValue(fieldName, value);
            filledFields++;
            return true;
          } catch (e) {
            // Ignoruj błędy dla pól, które nie istnieją w formEngine
          }
        }
        return false;
      }

      try {
        if (element.type === 'checkbox') {
          element.checked = Boolean(value);
        } else if (element.type === 'radio') {
          const radioButton = form.querySelector(`[name="${fieldName}"][value="${value}"]`);
          if (radioButton) {
            radioButton.checked = true;
          } else {
            errors.push(`Nieprawidłowa wartość radio dla ${fieldName}: ${value}`);
            return false;
          }
        } else if (element.type === 'number') {
          element.value = String(value);
        } else if (element.type === 'hidden') {
          element.value = String(value);
        } else {
          element.value = String(value);
        }

        // Trigger change event dla dynamic fields
        element.dispatchEvent(new Event('change', { bubbles: true }));
        element.dispatchEvent(new Event('input', { bubbles: true }));
        filledFields++;
        return true;
      } catch (fieldError) {
        errors.push(`Błąd przetwarzania pola ${fieldName}: ${fieldError.message}`);
        return false;
      }
    }

    // Wypełnij wszystkie pola z presetu
    Object.entries(preset).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (typeof value === 'object' && !Array.isArray(value)) {
        // Zagnieżdżone obiekty (np. top_isolation: { material: 68, size: 30 })
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          const fieldName = `${key}[${nestedKey}]`;
          setFieldValue(fieldName, nestedValue);
        });
      } else if (Array.isArray(value)) {
        // Tablice (np. building_heated_floors: [1, 2])
        // Dla tablic, ustawiamy wartości jako checkboxy lub multiple select
        value.forEach((item, index) => {
          const fieldName = `${key}[]`;
          const checkbox = form.querySelector(`[name="${fieldName}"][value="${item}"]`);
          if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            filledFields++;
          }
        });
      } else {
        // Proste wartości
        setFieldValue(key, value);
      }
    });

    if (errors.length > 0) {
      console.warn('⚠️ [Quick Scenario] Błędy wypełniania formularza:', errors);
    }

    console.log(`✅ [Quick Scenario] Wypełniono ${filledFields} pól formularza`);

    // Trigger rerender dla dynamicznych elementów
    setTimeout(() => {
      if (typeof window.renderHeatedFloors === 'function') {
        window.renderHeatedFloors();
      }
      // formEngine.refresh obsługuje to automatycznie
    }, 100);

    return filledFields > 0;
  }

  /**
   * Wywołuje normalny flow obliczeń (ten sam, co po kliknięciu "Dalej")
   */
  async function triggerNormalCalculationFlow() {
    if (typeof window.buildJsonData !== 'function') {
      console.error('❌ [Quick Scenario] Funkcja buildJsonData nie jest dostępna');
      ErrorHandler.showToast('Błąd: Funkcja buildJsonData nie została załadowana', 'error');
      return;
    }

    let jsonData;
    try {
      jsonData = window.buildJsonData();
      console.log(
        '📦 [Quick Scenario] Payload z formularza:',
        JSON.stringify(jsonData, null, 2)
      );
      window.lastSentPayload = jsonData;
    } catch (error) {
      console.error('❌ [Quick Scenario] Błąd buildJsonData:', error);
      ErrorHandler.showToast('Błąd podczas przygotowywania danych', 'error');
      return;
    }

    // Znajdź przycisk "Dalej" i programowo go kliknij, aby uruchomić normalny flow
    // To zapewnia, że używamy dokładnie tego samego flow, co użytkownik końcowy
    const finishBtn = document.querySelector('.btn-finish');
    if (finishBtn) {
      // Włącz przycisk, jeśli jest wyłączony (może być disabled, jeśli formularz nie był wypełniony)
      if (finishBtn.disabled) {
        finishBtn.disabled = false;
      }
      console.log('🚀 [Quick Scenario] Uruchamiam normalny flow obliczeń...');
      finishBtn.click();
    } else {
      console.error('❌ [Quick Scenario] Nie znaleziono przycisku "Dalej"');
      ErrorHandler.showToast('Błąd: Nie można uruchomić obliczeń', 'error');
    }
  }

  function openQuickScenarioModal() {
    const modal = document.getElementById('quick-scenario-modal');
    const fieldsContainer = document.getElementById('quick-scenario-fields');
    if (!modal || !fieldsContainer) return;

    const workingPayload = JSON.parse(JSON.stringify(QUICK_SCENARIO_PRESET));
    modal.__payload = workingPayload;

    fieldsContainer.innerHTML = '';

    fieldConfigs.forEach(cfg => {
      const value = getByPath(workingPayload, cfg.key);
      const row = document.createElement('div');
      row.className = 'quick-scenario-row';
      row.dataset.key = cfg.key;
      row.dataset.type = cfg.type || 'number';

        // ✅ Obsługa różnych typów pól
      if (cfg.type === 'select' && cfg.options) {
        // SELECT
        // Porównaj wartości (również numeryczne)
        const getSelectedAttr = (optVal, currentVal) => {
          // Porównaj jako liczby jeśli oba są liczbami
          const optNum = parseFloat(optVal);
          const currentNum = parseFloat(currentVal);
          if (!isNaN(optNum) && !isNaN(currentNum) && String(optNum) === String(optVal) && String(currentNum) === String(currentVal)) {
            return optNum === currentNum ? 'selected' : '';
          }
          // Porównaj jako stringi
          return String(optVal) === String(currentVal) ? 'selected' : '';
        };

        row.innerHTML = `
          <div class="quick-scenario-label">${cfg.label}</div>
          <div class="quick-scenario-controls">
            <select class="qs-select">
              ${cfg.options.map(opt =>
                `<option value="${opt.value}" ${getSelectedAttr(opt.value, value)}>${opt.label}</option>`
              ).join('')}
            </select>
          </div>
        `;
      } else if (cfg.type === 'boolean') {
        // CHECKBOX (boolean)
        row.innerHTML = `
          <div class="quick-scenario-label">${cfg.label}</div>
          <div class="quick-scenario-controls">
            <label class="qs-checkbox-label">
              <input type="checkbox" class="qs-checkbox" ${value ? 'checked' : ''}>
              <span>${value ? 'Tak' : 'Nie'}</span>
            </label>
          </div>
        `;
        const checkbox = row.querySelector('.qs-checkbox');
        checkbox.addEventListener('change', function() {
          const span = row.querySelector('span');
          span.textContent = this.checked ? 'Tak' : 'Nie';
        });
      } else {
        // NUMBER (domyślny typ)
        row.innerHTML = `
          <div class="quick-scenario-label">${cfg.label}</div>
          <div class="quick-scenario-controls">
            <button type="button" class="qs-btn qs-minus" aria-label="Zmniejsz wartość">−</button>
            <input type="number" class="qs-input" value="${value}" step="${cfg.step || 1}" ${
          cfg.min !== undefined ? `min="${cfg.min}"` : ''
        } ${cfg.max !== undefined ? `max="${cfg.max}"` : ''}>
            <button type="button" class="qs-btn qs-plus" aria-label="Zwiększ wartość">+</button>
          </div>
        `;

        const input = row.querySelector('.qs-input');
        const minus = row.querySelector('.qs-minus');
        const plus = row.querySelector('.qs-plus');

        function clamp(val) {
          let num = parseFloat(val);
          if (isNaN(num)) num = cfg.min !== undefined ? cfg.min : 0;
          if (cfg.min !== undefined && num < cfg.min) num = cfg.min;
          if (cfg.max !== undefined && num > cfg.max) num = cfg.max;
          return num;
        }

        minus?.addEventListener('click', function () {
          const current = clamp(input.value === '' ? (cfg.min !== undefined ? cfg.min : 0) : input.value);
          input.value = clamp(current - (cfg.step || 1));
        });

        plus?.addEventListener('click', function () {
          const current = clamp(input.value === '' ? (cfg.min !== undefined ? cfg.min : 0) : input.value);
          input.value = clamp(current + (cfg.step || 1));
        });

        input.addEventListener('change', function () {
          input.value = clamp(input.value);
        });
      }

      fieldsContainer.appendChild(row);
    });

    // ✅ Auto-przelicz building_heated_floors przy zmianie kluczowych pól
    function updateHeatedFloors() {
      const floors = getByPath(workingPayload, 'building_floors') || 1;
      const hasBasement = getByPath(workingPayload, 'has_basement') === true || getByPath(workingPayload, 'has_basement') === 'yes';
      const roofType = getByPath(workingPayload, 'building_roof') || 'steep';

      // Przelicz tylko jeśli wszystkie wymagane pola są ustawione
      if (floors > 0) {
        const calculated = calculateHeatedFloors({
          building_floors: floors,
          has_basement: hasBasement,
          building_roof: roofType
        });
        setByPath(workingPayload, 'building_heated_floors', calculated);
        console.log('[Quick Scenario] 🔄 Auto-przeliczono building_heated_floors:', calculated);
      }
    }

    // Nasłuchuj zmian w kluczowych polach
    fieldsContainer.addEventListener('change', function(e) {
      const row = e.target.closest('.quick-scenario-row');
      if (!row) return;

      const key = row.dataset.key;
      if (key === 'building_floors' || key === 'has_basement' || key === 'building_roof') {
        // Zaktualizuj wartość w payload
        const type = row.dataset.type || 'number';
        if (type === 'number') {
          const input = row.querySelector('.qs-input');
          if (input) {
            const num = parseFloat(input.value);
            if (!isNaN(num)) {
              setByPath(workingPayload, key, num);
            }
          }
        } else if (type === 'select') {
          const select = row.querySelector('.qs-select');
          if (select) {
            const value = select.value;
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && String(numValue) === value) {
              setByPath(workingPayload, key, numValue);
            } else {
              setByPath(workingPayload, key, value);
            }
          }
        } else if (type === 'boolean') {
          const checkbox = row.querySelector('.qs-checkbox');
          if (checkbox) {
            setByPath(workingPayload, key, checkbox.checked);
          }
        }

        // Przelicz building_heated_floors
        updateHeatedFloors();
      }
    });

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeQuickScenarioModal() {
    const modal = document.getElementById('quick-scenario-modal');
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  /**
   * Główna funkcja Quick Scenario — wypełnia formularz i uruchamia normalny flow
   */
  async function sendQuickScenario() {
    const modal = document.getElementById('quick-scenario-modal');
    const fieldsContainer = document.getElementById('quick-scenario-fields');
    if (!modal || !fieldsContainer || !modal.__payload) return;

    // ✅ Zbierz zaktualizowane wartości z modalu (obsługa różnych typów pól)
    const payload = modal.__payload;
    const rows = fieldsContainer.querySelectorAll('.quick-scenario-row');
    rows.forEach(row => {
      const key = row.dataset.key;
      const type = row.dataset.type || 'number';
      if (!key) return;

      const cfg = fieldConfigs.find(f => f.key === key);

      if (type === 'select') {
        const select = row.querySelector('.qs-select');
        if (select) {
          const value = select.value;
          if (value !== '') {
            // Konwertuj wartości numeryczne dla selectów (np. primary_wall_material, top_isolation.material)
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && String(numValue) === value) {
              // Wartość jest czystą liczbą (np. "84" -> 84)
              setByPath(payload, key, numValue);
            } else {
              // Wartość jest stringiem (np. "traditional", "natural")
              setByPath(payload, key, value);
            }
          }
        }
      } else if (type === 'boolean') {
        const checkbox = row.querySelector('.qs-checkbox');
        if (checkbox) {
          setByPath(payload, key, checkbox.checked);
        }
      } else {
        // NUMBER
        const input = row.querySelector('.qs-input');
        if (!input) return;
        const raw = input.value;
        let num = raw === '' ? null : parseFloat(raw);
        if (num !== null && !isNaN(num)) {
          if (cfg) {
            if (cfg.min !== undefined && num < cfg.min) num = cfg.min;
            if (cfg.max !== undefined && num > cfg.max) num = cfg.max;
          }
          setByPath(payload, key, num);
        }
      }
    });

    closeQuickScenarioModal();

    console.log('🔧 [Quick Scenario] Wypełnianie formularza presetem...');

    // ✅ Automatycznie wyznacz ogrzewane kondygnacje jeśli nie są ustawione
    if (!payload.building_heated_floors || !Array.isArray(payload.building_heated_floors) || payload.building_heated_floors.length === 0) {
      payload.building_heated_floors = calculateHeatedFloors(payload);
      console.log(`[Quick Scenario] ✅ Automatycznie wyznaczono building_heated_floors:`, payload.building_heated_floors);
    }

    // Wypełnij formularz programowo
    const filled = fillFormFromPreset(payload);
    if (!filled) {
      ErrorHandler.showToast('Błąd: Nie udało się wypełnić formularza', 'error');
      return;
    }

    // Poczekaj chwilę, aby formularz się zsynchronizował
    await new Promise(resolve => setTimeout(resolve, 200));

    // Uruchom normalny flow obliczeń (ten sam, co po kliknięciu "Dalej")
    await triggerNormalCalculationFlow();
  }

  function initQuickScenario() {
    const trigger = document.getElementById('quick-scenario-trigger');
    const modal = document.getElementById('quick-scenario-modal');
    if (!trigger || !modal) return;

    const okBtn = modal.querySelector('.quick-scenario-ok');
    const cancelBtn = modal.querySelector('.quick-scenario-cancel');
    const backdrop = modal.querySelector('.quick-scenario-backdrop');

    trigger.addEventListener('click', openQuickScenarioModal);
    okBtn?.addEventListener('click', sendQuickScenario);
    cancelBtn?.addEventListener('click', closeQuickScenarioModal);
    backdrop?.addEventListener('click', closeQuickScenarioModal);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeQuickScenarioModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuickScenario);
  } else {
    initQuickScenario();
  }
})();

