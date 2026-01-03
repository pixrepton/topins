(function(window) {
  'use strict';

  const formEngine = window.formEngine || (window.formEngine = {});
  const values = Object.create(null);
  const fieldElements = Object.create(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // APP STATE MANAGEMENT — sessionStorage persistence
  // ═══════════════════════════════════════════════════════════════════════════
  const APP_STATE_KEY = 'wycena2025_appState';
  let appState = null;
  let saveTimeout = null;
  const SAVE_DEBOUNCE_MS = 400;

  /**
   * Ładuje appState z sessionStorage
   */
  function loadFromSessionStorage() {
    try {
      const stored = sessionStorage.getItem(APP_STATE_KEY);
      if (stored) {
        appState = JSON.parse(stored);
        console.log('[AppState] ✅ Załadowano stan z sessionStorage');
        return appState;
      }
    } catch (error) {
      console.warn('[AppState] ❌ Błąd ładowania z sessionStorage:', error);
    }
    return null;
  }

  /**
   * Zapisuje appState do sessionStorage
   */
  function saveToSessionStorage(state) {
    try {
      sessionStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
      console.log('[AppState] 💾 Zapisano stan do sessionStorage');
      return true;
    } catch (error) {
      console.warn('[AppState] ❌ Błąd zapisu do sessionStorage:', error);
      return false;
    }
  }

  /**
   * Zwraca aktualny appState (lub tworzy nowy jeśli nie istnieje)
   */
  function getAppState() {
    if (!appState) {
      appState = {
        formData: {},
        currentTab: 0,
        lastCalculationResult: null,
        completionAnimationShown: false, // Flaga czy animacja completion już była pokazana
        timestamp: Date.now()
      };
    }
    return appState;
  }

  /**
   * Aktualizuje appState częściowo
   */
  function updateAppState(updates) {
    const state = getAppState();
    Object.assign(state, updates);
    state.timestamp = Date.now();

    // Debounced save
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      saveToSessionStorage(state);
      saveTimeout = null;
    }, SAVE_DEBOUNCE_MS);

    return state;
  }

  /**
   * Synchronizuje formData z appState
   */
  function syncFormDataToAppState() {
    const formData = getAllValues();
    updateAppState({ formData });
  }

  /**
   * Synchronizuje appState.formData z formEngine.state
   */
  function syncAppStateToFormEngine() {
    const state = getAppState();
    if (state.formData && Object.keys(state.formData).length > 0) {
      Object.entries(state.formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(key, value);
        }
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FORM ENGINE STATE (existing code)
  // ═══════════════════════════════════════════════════════════════════════════

  function registerField(name, elements) {
    fieldElements[name] = elements;
  }

  function getFieldElements(name) {
    return fieldElements[name] || null;
  }

  function setValue(name, value) {
    const previous = values[name];
    if (typeof value === 'string') {
      values[name] = value.trim();
    } else if (Array.isArray(value)) {
      values[name] = value.slice();
    } else if (value === undefined || value === null) {
      delete values[name];
    } else {
      values[name] = value;
    }
    const changed = previous !== values[name];

    // Auto-sync do appState (tylko jeśli appState jest zainicjalizowany)
    if (changed && appState) {
      syncFormDataToAppState();
    }

    return changed;
  }

  function getValue(name) {
    return values[name];
  }

  function getAllValues() {
    // ✅ Zwróć appState.formData jeśli istnieje (single source of truth)
    // Ale tylko jeśli appState jest załadowany i ma dane
    if (appState && appState.formData && Object.keys(appState.formData).length > 0) {
      // Merge: wartości z formEngine.state mają priorytet nad appState (użytkownik może właśnie edytować)
      return { ...appState.formData, ...values };
    }
    return { ...values };
  }

  function resetValues() {
    Object.keys(values).forEach(key => delete values[key]);
    // NIE resetuj appState - to jest trwały stan
  }

  formEngine.state = {
    registerField,
    getFieldElements,
    setValue,
    getValue,
    getAllValues,
    resetValues
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // GLOBAL APP STATE API
  // ═══════════════════════════════════════════════════════════════════════════
  window.loadAppStateFromSessionStorage = loadFromSessionStorage;
  window.saveAppStateToSessionStorage = saveToSessionStorage;
  window.getAppState = getAppState;
  window.updateAppState = updateAppState;
  window.syncFormDataToAppState = syncFormDataToAppState;
  window.syncAppStateToFormEngine = syncAppStateToFormEngine;
})(window);
