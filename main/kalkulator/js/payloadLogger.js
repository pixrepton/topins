/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PAYLOAD LOGGER — Logowanie payloadu po każdej zmianie w formularzu
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Loguje:
 * - Payload po każdej zmianie w formularzu
 * - Wynik walidacji payloadu
 * - Stan przycisku "Oblicz"
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  let debounceTimer = null;
  const DEBOUNCE_DELAY = 300; // ms - opóźnienie między logowaniami

  /**
   * Sprawdza czy jesteśmy w widoku wyników (konfigurator)
   * Jeśli tak, nie loguj - użytkownik już zakończył wypełnianie formularza
   */
  function isInResultsView() {
    const resultsSection = document.querySelector('.section[data-tab="6"]');
    if (!resultsSection) return false;

    // Sprawdź czy sekcja wyników jest aktywna
    const isActive = resultsSection.classList.contains('active');
    if (!isActive) return false;

    // Sprawdź czy konfigurator jest widoczny
    const configView = document.getElementById('configurator-view');
    if (configView && !configView.classList.contains('hidden')) {
      return true;
    }

    return false;
  }

  /**
   * Loguje aktualny payload z formularza
   */
  function logPayload() {
    // ═══════════════════════════════════════════════════════════════════════════
    // WYŁĄCZ LOGOWANIE W WIDOKU WYNIKÓW (konfigurator)
    // ═══════════════════════════════════════════════════════════════════════════
    if (isInResultsView()) {
      return; // Nie loguj gdy użytkownik jest w konfiguratorze
    }

    if (typeof window.buildJsonData !== 'function') {
      console.warn('[PayloadLogger] buildJsonData nie jest dostępne');
      return;
    }

    try {
      const payload = window.buildJsonData();
      console.log(
        '%c[PayloadLogger] Payload po zmianie w formularzu:',
        'color: #f59e0b; font-weight: bold; background: #fef3c7; padding: 4px;',
        payload
      );

      // Walidacja payloadu (jeśli dostępna)
      if (typeof window.PayloadValidator !== 'undefined') {
        const validation = window.PayloadValidator.validate(payload);
        if (validation.valid) {
          console.log(
            '%c[PayloadLogger] ✅ Payload jest prawidłowy, wariant:',
            'color: #22c55e; font-weight: bold;',
            validation.variant
          );
        } else {
          console.group(
            '%c[PayloadLogger] ❌ Payload ma błędy walidacji:',
            'color: #ef4444; font-weight: bold;'
          );
          console.log('Wariant:', validation.variant || 'BRAK');
          console.log('Błędy:', validation.errors);
          console.groupEnd();
        }
      }

      // Sprawdź stan przycisku "Oblicz"
      const finishButton = document.querySelector('.btn-finish');
      if (finishButton) {
        const isDisabled = finishButton.disabled || finishButton.classList.contains('progressive-disabled');
        console.log(
          `%c[PayloadLogger] Przycisk "Oblicz": ${isDisabled ? 'ZABLOKOWANY ❌' : 'ODBLOKOWANY ✅'}`,
          isDisabled ? 'color: #ef4444; font-weight: bold;' : 'color: #22c55e; font-weight: bold;'
        );
      }
    } catch (error) {
      console.error('[PayloadLogger] Błąd podczas logowania payloadu:', error);
    }
  }

  /**
   * Debounced version of logPayload
   */
  function debouncedLogPayload() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(logPayload, DEBOUNCE_DELAY);
  }

  /**
   * Inicjalizuje logowanie payloadu
   */
  function initPayloadLogger() {
    const form = document.getElementById('heatCalcFormFull') || document.querySelector('#top-instal-calc form');

    if (!form) {
      console.warn('[PayloadLogger] Formularz nie został znaleziony');
      return;
    }

    // Nasłuchuj wszystkich zmian w formularzu
    const events = ['change', 'input', 'click'];

    events.forEach(eventType => {
      form.addEventListener(eventType, function (e) {
        // Ignoruj niektóre eventy (np. kliknięcia w przyciski nawigacyjne)
        if (e.target && (
          e.target.classList.contains('btn-next') ||
          e.target.classList.contains('btn-prev') ||
          e.target.classList.contains('btn-finish') ||
          e.target.closest('.btn-row')
        )) {
          return;
        }

        // Loguj payload po zmianie
        debouncedLogPayload();
      }, true); // Użyj capture phase, aby złapać wszystkie eventy
    });

    // Nasłuchuj również zmian w formEngine (jeśli dostępny)
    if (window.formEngine && window.formEngine.state) {
      // Obserwuj zmiany w stanie formEngine
      const originalSetValue = window.formEngine.state.setValue;
      if (originalSetValue && typeof originalSetValue === 'function') {
        window.formEngine.state.setValue = function (fieldName, value) {
          const result = originalSetValue.apply(this, arguments);
          debouncedLogPayload();
          return result;
        };
      }
    }

    console.log('✅ [PayloadLogger] Logger zainicjalizowany - logowanie payloadu po każdej zmianie');
  }

  // Inicjalizuj po załadowaniu DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPayloadLogger);
  } else {
    // DOM już załadowany
    setTimeout(initPayloadLogger, 500); // Daj czas na załadowanie innych modułów
  }

  // Export funkcji (dla ręcznego wywołania)
  window.logPayload = logPayload;
})();

