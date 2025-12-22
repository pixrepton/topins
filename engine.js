(function (window) {
  'use strict';

  const formEngine = window.formEngine || (window.formEngine = {});
  const rules = () => formEngine.rules;

  let initialized = false;
  let visibilityCache = {};
  let containerVisibilityCache = {};
  let requiredCache = {};
  const fieldListeners = new Map();

  function toArray(elements) {
    if (!elements) return [];
    if (elements instanceof NodeList || Array.isArray(elements)) {
      return Array.from(elements);
    }
    return [elements];
  }

  function readFieldValue(fieldName) {
    const config = rules().fields[fieldName] || {};
    const elements = toArray(formEngine.state.getFieldElements(fieldName));

    // FIX: Jeśli nie ma zarejestrowanych elementów, spróbuj znaleźć element bezpośrednio w DOM
    // (ważne dla pól hidden jak building_type, które mogą nie być widoczne w momencie refresh)
    if (!elements.length) {
      // Dla pól hidden - spróbuj znaleźć bezpośrednio w DOM
      if (config.selector) {
        const directElement = document.querySelector(config.selector);
        if (directElement && directElement.type === 'hidden') {
          const value = directElement.value?.trim() || '';
          // Jeśli pole ma wartość, zachowaj ją (nie resetuj do pustego stringa)
          if (value) {
            return value;
          }
        }
      }
      // Jeśli pole jest wymagane i ma już wartość w stanie, zachowaj ją
      const currentStateValue = formEngine.state.getValue(fieldName);
      if (config.required && currentStateValue) {
        return currentStateValue;
      }
      return '';
    }

    const sample = elements[0];
    const nameIsArray = fieldName.endsWith('[]');

    if (sample.type === 'radio') {
      const checked = elements.find(el => el.checked);
      const value = checked ? checked.value : '';
      return value;
    }

    if (sample.type === 'checkbox') {
      if (nameIsArray || elements.length > 1) {
        const values = elements.filter(el => el.checked).map(el => el.value);
        return values;
      }
      const value = sample.checked ? 'yes' : 'no';
      return value;
    }

    if (nameIsArray) {
      const values = elements.filter(el => el.checked).map(el => el.value);
      return values;
    }

    if (sample.tagName === 'SELECT' && sample.multiple) {
      const values = Array.from(sample.selectedOptions).map(opt => opt.value);
      return values;
    }

    const value = typeof sample.value === 'string' ? sample.value : sample.value ?? '';

    // FIX: Dla pól hidden typu required - jeśli wartość jest pusta, ale pole ma już wartość w stanie, zachowaj ją
    // (chroni przed resetowaniem building_type i innych ważnych pól hidden)
    if (sample.type === 'hidden' && !value && config.required) {
      const currentStateValue = formEngine.state.getValue(fieldName);
      if (currentStateValue && currentStateValue.trim()) {
        return currentStateValue;
      }
    }

    return value;
  }

  function updateFieldState(fieldName) {
    const rawValue = readFieldValue(fieldName);
    const config = rules().fields[fieldName] || {};
    const currentStateValue = formEngine.state.getValue(fieldName);

    // 🔹 Normalizacja stringów typu "undefined"/"null"
    let value = rawValue;
    if (typeof value === 'string') {
      value = value.trim();
      if (value === 'undefined' || value === 'null') {
        value = '';
      }
    }

    // FIX: Nie nadpisuj wartości pustym stringiem dla wymaganych pól, które już mają wartość
    // (chroni przed przypadkowym resetowaniem building_type i innych ważnych pól)
    if (!value && config.required && currentStateValue) {
      // Zachowaj poprzednią wartość - nie aktualizuj
      return false;
    }

    // DODATKOWE ZABEZPIECZENIE: building_type NIGDY nie może zostać popsuty przez "puste" lub "undefined"
    if (fieldName === 'building_type') {
      // Jeśli mamy już sensowną wartość, a nowa jest pusta → ignoruj
      if (currentStateValue && !value) {
        console.warn(
          '[formEngine] Próba resetowania building_type na pustą/undefined/null - blokuję!',
          {
            currentStateValue,
            readValue: rawValue,
          }
        );
        return false;
      }
    }

    const changed = formEngine.state.setValue(fieldName, value);
    if (changed) {
      runEffects(fieldName);
    }
    return changed;
  }

  function hydrateInitialState() {
    Object.keys(rules().fields).forEach(fieldName => {
      try {
        updateFieldState(fieldName);
      } catch (error) {
        console.warn(`[formEngine] Błąd hydratacji pola ${fieldName}:`, error);
      }
    });
  }

  function unbindField(fieldName) {
    const entries = fieldListeners.get(fieldName);
    if (!entries) {
      return;
    }
    entries.forEach(({ element, changeHandler, inputHandler }) => {
      element.removeEventListener('change', changeHandler);
      if (inputHandler) {
        element.removeEventListener('input', inputHandler);
      }
    });
    fieldListeners.delete(fieldName);
  }

  function bindField(fieldName) {
    const config = rules().fields[fieldName];
    if (!config) return;
    const selector = config.selector || `[name="${fieldName}"]`;
    const elements = document.querySelectorAll(selector);
    if (!elements.length) {
      unbindField(fieldName);
      return;
    }

    unbindField(fieldName);
    formEngine.state.registerField(fieldName, elements.length === 1 ? elements[0] : elements);

    const entries = [];
    elements.forEach(el => {
      const changeHandler = () => {
        const changed = updateFieldState(fieldName);
        if (changed) {
          recompute();
        }
      };
      el.addEventListener('change', changeHandler);

      let inputHandler = null;
      // Nasłuchuj na input dla text, number, range oraz hidden (dla sliderów)
      if (['text', 'number', 'range', 'hidden'].includes(el.type)) {
        // Dla sliderów (hidden inputs) - NIE aktualizuj stanu przez updateFieldState
        // (może resetować inne wartości jak building_type)
        // Slider sam aktualizuje wartość i odblokowuje pola bezpośrednio
        if (el.type === 'hidden' && el.dataset.requiresConfirm === 'true') {
          // Slider z potwierdzeniem - tylko zapisz wartość bezpośrednio w stanie
          inputHandler = () => {
            const value = el.value?.trim() || '';
            if (value) {
              formEngine.state.setValue(fieldName, value);
            }
          };
        } else {
          // Zwykłe pola - aktualizuj normalnie
          inputHandler = () => {
            updateFieldState(fieldName);
          };
        }
        el.addEventListener('input', inputHandler);
      }

      entries.push({ element: el, changeHandler, inputHandler });
    });

    fieldListeners.set(fieldName, entries);
  }

  function registerFieldListeners() {
    Object.keys(rules().fields).forEach(bindField);
  }

  function computeVisibilityMaps(stateSnapshot) {
    visibilityCache = formEngine.visibility.fields(stateSnapshot);
    containerVisibilityCache = formEngine.visibility.containers(stateSnapshot);
  }

  function computeRequiredMaps(stateSnapshot) {
    requiredCache = formEngine.enablement.required(stateSnapshot);
  }

  function recompute() {
    const snapshot = formEngine.state.getAllValues();

    computeVisibilityMaps(snapshot);
    const enabledMap = formEngine.enablement.fields(snapshot);
    computeRequiredMaps(snapshot);

    const labelOutputs = {};
    const labelRules = rules().labels || {};
    Object.entries(labelRules).forEach(([key, config]) => {
      if (!config || !config.selector) return;
      const text = typeof config.text === 'function' ? config.text(snapshot) : config.text;
      labelOutputs[key] = { selector: config.selector, text };
    });

    formEngine.render.fieldVisibility(visibilityCache);
    formEngine.render.containerVisibility(containerVisibilityCache);
    formEngine.render.fieldEnabled(enabledMap);
    formEngine.render.fieldRequired(requiredCache);
    formEngine.render.labels(labelOutputs);
    updateSectionButtons(snapshot);
  }

  function fieldIsSatisfied(name, state) {
    if (!requiredCache[name]) return true;
    if (visibilityCache[name] === false) return true;

    const value = state[name];

    // Tablice (np. checkboxy) muszą mieć co najmniej 1 zaznaczenie
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    const str = value !== undefined && value !== null ? String(value).trim() : '';

    // Traktujemy "undefined" / "null" tak samo jak pustą wartość
    if (str === '' || str === 'undefined' || str === 'null') {
      return false;
    }

    return true;
  }

  function updateSectionButtons(state) {
    rules().sections.forEach(section => {
      let fieldNames = (rules().sectionFields && rules().sectionFields[section.id]) || [];

      // Dla single_house w trybie uproszczonym: dostosuj pola do sprawdzenia
      const isSimplifiedSingleHouse =
        state.building_type === 'single_house' &&
        state.detailed_insulation_mode !== true &&
        state.detailed_insulation_mode !== 'yes' &&
        state.detailed_insulation_mode !== 'true';

      if (isSimplifiedSingleHouse) {
        // Sekcja 3 (okna i drzwi): usuń doors_type i number_doors (nie są wymagane)
        if (section.id === 3) {
          fieldNames = fieldNames.filter(name => name !== 'doors_type' && name !== 'number_doors');
        }
        // Sekcja 4 (izolacje): wymagane są poziomy, nie szczegółowe dane
        if (section.id === 4) {
          // Usuń szczegółowe pola izolacji
          fieldNames = fieldNames.filter(
            name =>
              !name.includes('top_isolation') &&
              !name.includes('bottom_isolation') &&
              !name.includes('external_wall_isolation') &&
              name !== 'has_external_isolation'
          );
          // Zostaw tylko poziomy izolacji
          const simplifiedFields = [
            'detailed_insulation_mode',
            'walls_insulation_level',
            'roof_insulation_level',
            'floor_insulation_level',
          ];
          fieldNames = simplifiedFields.filter(field => fieldNames.includes(field));
        }
      } else {
        // Dla trybu szczegółowego lub innych typów budynków: usuń poziomy izolacji z sekcji 4
        if (section.id === 4) {
          fieldNames = fieldNames.filter(
            name =>
              name !== 'walls_insulation_level' &&
              name !== 'roof_insulation_level' &&
              name !== 'floor_insulation_level'
          );
        }
      }

      const sectionValid = fieldNames.every(name => fieldIsSatisfied(name, state));
      formEngine.render.sectionButton(section.id, sectionValid);
    });
  }

  function runEffects(changedField) {
    const definedEffects = rules().effects || [];
    definedEffects.forEach(effect => {
      if (!effect || typeof effect.run !== 'function') return;
      if (!effect.fields || !effect.fields.length) return;
      if (effect.fields.includes(changedField)) {
        try {
          effect.run();
        } catch (error) {
          console.warn('formEngine effect error:', error);
        }
      }
    });
  }

  function refreshField(fieldName) {
    updateFieldState(fieldName);
    recompute();
  }

  function init() {
    if (initialized) {
      return;
    }
    registerFieldListeners();
    hydrateInitialState();
    recompute();
    initialized = true;
  }

  formEngine.init = init;
  formEngine.refresh = recompute;
  formEngine.refreshField = refreshField;
  formEngine.updateSectionButtons = () => updateSectionButtons(formEngine.state.getAllValues());
  formEngine.handleExternalUpdate = refreshField;
  formEngine.getState = () => formEngine.state.getAllValues();
  formEngine.readFieldValue = readFieldValue; // ✅ Eksportowana uniwersalna funkcja do zbierania danych
  formEngine.rebindField = (fieldName, options = {}) => {
    bindField(fieldName);
    if (options.refresh) {
      refreshField(fieldName);
    }
  };
  formEngine.rebindAll = () => {
    registerFieldListeners();
    hydrateInitialState();
    recompute();
  };

  // ---------------------------------------------
  // SOFT REFRESH (bez hydratacji, bez resetu pól)
  // ---------------------------------------------
  formEngine.softRefresh = () => {
    const snapshot = formEngine.state.getAllValues();

    visibilityCache = formEngine.visibility.fields(snapshot);
    containerVisibilityCache = formEngine.visibility.containers(snapshot);
    requiredCache = formEngine.enablement.required(snapshot);
    const enabledMap = formEngine.enablement.fields(snapshot);

    formEngine.render.fieldVisibility(visibilityCache);
    formEngine.render.containerVisibility(containerVisibilityCache);
    formEngine.render.fieldEnabled(enabledMap);
    formEngine.render.fieldRequired(requiredCache);

    formEngine.updateSectionButtons(snapshot);
  };

  // HARD REFRESH wyłączamy (opcjonalnie)
  formEngine.refresh = () => {
    console.warn('HARD refresh disabled. Use softRefresh().');
  };
})(window);
