// === FILE: calculatorInit.js ===
// 🧠 Obsługuje: Inicjalizacja kalkulatora TOP-INSTAL z fix dla podwójnych wywołań API
// FIX: Usunięto live debug system powodujący duplikację wywołań buildJsonData()

(function () {
  'use strict';

  let calculatorInitialized = false;
  let isAPICallInProgress = false;

  /**
   * Sprawdza czy strona zawiera elementy kalkulatora
   * Zgodnie z architekturą WordPress/Elementor: sprawdza #wycena-calculator-app lub fallback
   */
  function hasCalculatorElements() {
    // Zgodnie z dokumentacją: sprawdź #wycena-calculator-app
    const rootApp = document.querySelector('#wycena-calculator-app');
    if (rootApp) return true;

    // Fallback: sprawdź stare ID (dla kompatybilności wstecznej)
    const legacyApp = document.querySelector('#top-instal-calc, .heatpump-calculator-wrapper');
    return legacyApp !== null;
  }

  if (!hasCalculatorElements()) {
    // Brak elementów kalkulatora - przerwanie inicjalizacji (idempotentność)
    return;
  }

  /**
   * Ulepszona animacja AI Analysis z loading screen
   */
  function simulateAIAnalysis(tabIndex, steps, callback) {
    // Rozpoczęcie analizy AI dla zakładki

    let currentStep = 0;
    const progressElement = document.createElement('div');
    progressElement.className = 'ai-analysis-overlay';
    progressElement.innerHTML = `
            <div class="ai-analysis-content">
                <div class="ai-spinner"></div>
                <p id="ai-step-text">${steps[0]?.text || 'Przygotowuję analizę...'}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;

    // Dodaj style CSS jeśli nie istnieją
    if (!document.querySelector('#ai-analysis-styles')) {
      const style = document.createElement('style');
      style.id = 'ai-analysis-styles';
      style.textContent = `
                .ai-analysis-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                }
                .ai-analysis-content {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                .ai-spinner {
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(220, 20, 60, 0.2);
                    border-top: 4px solid #d4a574;
                    border-radius: 50%;
                    animation: spin 1.5s linear infinite;
                    margin: 0 auto 20px;
                }
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(220, 20, 60, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 20px;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #d4a574, #b8976a);
                    border-radius: 4px;
                    transition: width 0.5s ease-in-out;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(progressElement);

    function nextStep() {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        const stepText = document.getElementById('ai-step-text');
        const progressFill = progressElement.querySelector('.progress-fill');

        if (stepText) stepText.textContent = step.text;
        if (progressFill) {
          const progress = ((currentStep + 1) / steps.length) * 100;
          progressFill.style.width = `${progress}%`;
        }

        currentStep++;
        setTimeout(nextStep, (step.delay || 1000) * 0.75); // Przyspieszone o 25%
      } else {
        setTimeout(() => {
          progressElement.remove();
          if (callback) callback();
        }, 500);
      }
    }

    nextStep();
  }

  /**
   * Globalne przechowywanie event listenerów
   */
  const calculatorEventListeners = new Map();

  /**
   * Czyszczenie starych event listenerów
   */
  function cleanupCalculatorEvents() {
    calculatorEventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    calculatorEventListeners.clear();
  }

  /**
   * Dodawanie event listenera z śledzeniem
   */
  function addCalculatorEventListener(element, event, handler) {
    if (!element) return;

    element.removeEventListener(event, handler);
    element.addEventListener(event, handler);

    if (!calculatorEventListeners.has(element)) {
      calculatorEventListeners.set(element, []);
    }
    calculatorEventListeners.get(element).push({ event, handler });
  }

  /**
   * Reset stanu kalkulatora
   * NIE resetuje appState (sessionStorage) - to jest trwały stan
   */
  function resetCalculatorState() {
    cleanupCalculatorEvents();

    if (typeof window.resetResultsSection === 'function') {
      window.resetResultsSection();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // APP STATE PERSISTENCE — przywróć z appState jeśli istnieje
    // ═══════════════════════════════════════════════════════════════════════════
    if (typeof window.getAppState === 'function') {
      const appState = window.getAppState();
      if (appState && Object.keys(appState.formData || {}).length > 0) {
        // Przywróć z appState (nie resetuj)
        window.currentTab = appState.currentTab || 0;
        window.lastCalculationResult = appState.lastCalculationResult || null;
        // Przywrócono stan z appState
        isAPICallInProgress = false;
        return; // NIE resetuj dalej - stan jest przywrócony
      }
    }

    // Tylko jeśli brak appState - reset do domyślnych wartości
    window.lastCalculationResult = null;
    window.currentTab = 0;
    isAPICallInProgress = false;

    try {
      sessionStorage.removeItem('temp_calc_data');
      localStorage.removeItem('temp_calc_data');
    } catch (error) {
      // Błąd czyszczenia localStorage - cichy fallback
    }
  }

  /**
   * Wypełnia DOM z appState.formData (przed init formEngine)
   */
  function fillDOMFromAppState() {
    if (typeof window.getAppState !== 'function') {
      return;
    }

    const appState = window.getAppState();
    if (!appState || !appState.formData || Object.keys(appState.formData).length === 0) {
      return;
    }

    // Wypełnianie DOM z appState
    let filledCount = 0;

    Object.entries(appState.formData).forEach(([fieldName, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      try {
        // ═══════════════════════════════════════════════════════════════════════════
        // SPECJALNA OBSŁUGA: building_type (building type cards)
        // ═══════════════════════════════════════════════════════════════════════════
        if (fieldName === 'building_type' && typeof window.triggerBuildingTypeChange === 'function') {
          window.triggerBuildingTypeChange(value);
          filledCount++;
          return;
        }

        // ═══════════════════════════════════════════════════════════════════════════
        // STANDARDOWE POLA
        // ═══════════════════════════════════════════════════════════════════════════
        let element = document.querySelector(`[name="${fieldName}"]`);

        // ═══════════════════════════════════════════════════════════════════════════
        // FALLBACK: Option cards (ukryte inputy + karty wizualne)
        // ═══════════════════════════════════════════════════════════════════════════
        if (!element) {
          // Spróbuj znaleźć ukryty input po ID (option cards używają id=fieldName)
          element = document.getElementById(fieldName);
          if (element && element.type === 'hidden') {
            // To jest option card - ustaw wartość i wywołaj change
            element.value = String(value);
            element.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
            return;
          }

          // Jeśli nadal nie znaleziono, spróbuj kliknąć kartę (jeśli istnieje)
          const optionCard = document.querySelector(`.option-card[data-field="${fieldName}"][data-value="${value}"]`);
          if (optionCard) {
            // Kliknij kartę (to wywoła wszystkie potrzebne eventy)
            optionCard.click();
            filledCount++;
          }
          return;
        }

        if (element.type === 'checkbox') {
          element.checked = Boolean(value);
        } else if (element.type === 'radio') {
          const radioButton = document.querySelector(`[name="${fieldName}"][value="${value}"]`);
          if (radioButton) {
            radioButton.checked = true;
          }
        } else if (element.tagName === 'SELECT' && element.multiple) {
          // Multi-select - ustaw selected dla każdej wartości
          if (Array.isArray(value)) {
            Array.from(element.options).forEach(opt => {
              opt.selected = value.includes(opt.value);
            });
          }
        } else {
          element.value = String(value);
        }

        // Wywołaj change event dla dynamic fields
        element.dispatchEvent(new Event('change', { bubbles: true }));
        filledCount++;
      } catch (error) {
        // Błąd wypełniania pola - cichy fallback
      }
    });

    // Wypełniono pola z appState

    // ═══════════════════════════════════════════════════════════════════════════
    // ODŚWIEŻ FORM ENGINE — jeśli już jest zainicjalizowany
    // ═══════════════════════════════════════════════════════════════════════════
    // To jest ważne: jeśli formEngine jest już zainicjalizowany, odśwież stan
    // (widoczność, enablement) na podstawie wypełnionych wartości
    if (window.formEngine && typeof window.formEngine.softRefresh === 'function') {
      setTimeout(() => {
        window.formEngine.softRefresh();
        // Odświeżono formEngine po wypełnieniu DOM z appState
      }, 50);
    }
  }

  /**
   * Główna funkcja inicjalizacji kalkulatora TOP-INSTAL
   */
  function initTopInstalCalculator() {
    if (calculatorInitialized) {
      // Kalkulator już zainicjalizowany - pomijam
      return;
    }

    resetCalculatorState();

    const sections = document.querySelectorAll('#top-instal-calc .section');
    if (!sections.length) {
      // Nie znaleziono sekcji kalkulatora - cichy fallback
      return;
    }

    window.sections = sections;

    // ═══════════════════════════════════════════════════════════════════════════
    // KOLEJNOŚĆ INICJALIZACJI (KRYTYCZNE):
    // 1. Wypełnij DOM z appState (jeśli istnieje)
    // 2. fillFormFromURLParams() (nadpisze jeśli URL params istnieją)
    // 3. Ustaw currentTab z appState
    // 4. init formEngine (przeczyta z DOM który już jest wypełniony)
    // ═══════════════════════════════════════════════════════════════════════════

    // KROK 1: Wypełnij DOM z appState
    fillDOMFromAppState();

    // KROK 2: fillFormFromURLParams() (nadpisze appState jeśli URL params istnieją)
    if (typeof window.TopInstalCalculator !== 'undefined' &&
        typeof window.TopInstalCalculator.fillFormFromURLParams === 'function') {
      window.TopInstalCalculator.fillFormFromURLParams();
    }

    // KROK 3: Ustaw currentTab z appState (lub domyślnie 0)
    const appState = typeof window.getAppState === 'function' ? window.getAppState() : null;
    window.currentTab = (appState && appState.currentTab !== undefined) ? appState.currentTab : 0;

    if (typeof window.showTab !== 'function') {
      // Funkcja showTab nie jest dostępna - cichy fallback
      return;
    }

    window.showTab(window.currentTab);

    // ⏳ Poczekaj aż wszystkie inline scripty (option-cards, yes-no-cards) się zainicjalizują
    // WAŻNE: formEngine.init() musi być wywołane PO fillDOMFromAppState(),
    // żeby event listenery były zarejestrowane i mogły przechwycić wartości z DOM
    setTimeout(() => {
      if (window.formEngine && typeof window.formEngine.init === 'function') {
        // Inicjalizacja formEngine
        window.formEngine.init();

        // ═══════════════════════════════════════════════════════════════════════════
        // ODŚWIEŻ PO INICJALIZACJI — upewnij się, że widoczność/enablement są poprawne
        // ═══════════════════════════════════════════════════════════════════════════
        // Po init() formEngine ma już event listenery, więc odśwież stan
        // na podstawie wartości wypełnionych w DOM (z appState)
        setTimeout(() => {
          if (window.formEngine && typeof window.formEngine.softRefresh === 'function') {
            window.formEngine.softRefresh();
            // Odświeżono formEngine po init (progressive disclosure)
          }
        }, 100);

        // USUNIĘTE: Event listenery powodowały podwójne wywołania buildJsonData()
        // buildJsonData() jest wywoływane tylko gdy potrzeba (przy wysyłce do API)
      } else {
        // formEngine nie jest dostępny - cichy fallback
      }
    }, 300);

    calculatorInitialized = true;

    function setupStepButton(className, tabIndex, steps, nextTabIndex) {
      const btn = document.querySelector(`.${className}`);
      if (!btn) {
        // Nie znaleziono przycisku - cichy fallback
        return;
      }

      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      const clickHandler = e => {
        e.preventDefault();
        e.stopPropagation();

        simulateAIAnalysis(tabIndex, steps, () => {
          window.showTab(nextTabIndex);

          if (typeof window.activateTooltips === 'function') {
            setTimeout(window.activateTooltips, 100);
          }
        });
      };

      addCalculatorEventListener(newBtn, 'click', clickHandler);
    }

    function setupFinishButtonWithAPI(className, tabIndex, steps, resultTabIndex = 6) {
      const btn = document.querySelector(`.${className}`);
      if (!btn) {
        // Nie znaleziono przycisku - cichy fallback
        return;
      }

      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      // Użyj dynamicznego URL z WordPress (HEATPUMP_CONFIG) lub fallback
      const proxyUrl = (window.HEATPUMP_CONFIG && window.HEATPUMP_CONFIG.cieploProxyUrl)
        ? window.HEATPUMP_CONFIG.cieploProxyUrl
        : 'https://topinstal.com.pl/cieplo-proxy.php';
      // PRODUKCJA: Wyłączony tryb testowy - używamy prawdziwego API
      const CIEPLO_API_SLEEP_MODE = false;
      const simulatedApiStore = new Map(); // Zachowane dla ewentualnych testów w przyszłości
      const clickHandler = e => {
        e.preventDefault();
        e.stopPropagation();

        if (isAPICallInProgress) {
          console.log('⚠️ Wywołanie API już w toku - pomijam');
          return;
        }

        isAPICallInProgress = true;
        newBtn.disabled = true;
        newBtn.style.opacity = '0.6';

        simulateAIAnalysis(tabIndex, steps, () => {
          if (typeof window.buildJsonData !== 'function') {
            // Funkcja buildJsonData nie jest dostępna - cichy fallback
            ErrorHandler.showToast('Błąd: Funkcja buildJsonData nie została załadowana', 'error');
            isAPICallInProgress = false;
            newBtn.disabled = false;
            newBtn.style.opacity = '1';
            return;
          }

          // ═══════════════════════════════════════════════════════════════════════════
          // APP STATE PERSISTENCE — zapisz formData przed buildJsonData()
          // ═══════════════════════════════════════════════════════════════════════════
          if (typeof window.syncFormDataToAppState === 'function') {
            window.syncFormDataToAppState();
          }

          let jsonData;
          try {
            jsonData = window.buildJsonData();
            // Logowanie usunięte dla produkcji
            window.lastSentPayload = jsonData;
          } catch (error) {
            // Błąd buildJsonData - cichy fallback
            ErrorHandler.showToast('Błąd podczas przygotowywania danych', 'error');
            isAPICallInProgress = false;
            newBtn.disabled = false;
            newBtn.style.opacity = '1';
            return;
          }

          [
            'r-total-area',
            'r-heated-area',
            'r-temp',
            'r-max-power',
            'r-bi-power',
            'r-avg-power',
            'r-cwu',
            'r-temp-avg',
            'r-energy',
            'r-factor',
            'r-power-factor',
          ].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = '...';
          });

          if (typeof window.clearValidationErrors === 'function') {
            window.clearValidationErrors();
          }

          function deriveNumber(value, fallback) {
            const num = Number(value);
            return Number.isFinite(num) ? num : fallback;
          }

          function buildSimulatedResult(payload) {
            const building = payload && payload.building ? payload.building : {};
            const dhw = payload && payload.domestic_hot_water ? payload.domestic_hot_water : {};
            const heatedArea = deriveNumber(building.heated_area, 150);
            const totalArea = deriveNumber(building.total_area, heatedArea);
            const designTemp = deriveNumber(building.design_outdoor_temperature, -20);
            const people = deriveNumber(dhw.people, 3);
            const maxPower = +(heatedArea * 0.065).toFixed(2);
            const id = `SIM-${Date.now()}`;

            return {
              id,
              total_area: totalArea,
              heated_area: heatedArea,
              design_outdoor_temperature: designTemp,
              max_heating_power: maxPower,
              hot_water_power: +Math.max(2, people * 0.35).toFixed(2),
              bivalent_point_heating_power: +(maxPower * 0.8).toFixed(2),
              avg_heating_power: +(maxPower * 0.55).toFixed(2),
              avg_outdoor_temperature: 0,
              annual_energy_consumption: Math.round(totalArea * 120),
              annual_energy_consumption_factor: 0.82,
              heating_power_factor: 1.07,
              people,
              profile: dhw.profile || 'standard',
              building_type: payload && payload.building_type ? payload.building_type : 'detached',
              source: 'simulated',
            };
          }

          function buildSimulatedExtendedData(simulatedResult) {
            const basePower = simulatedResult.max_heating_power;
            return {
              id: simulatedResult.id,
              result: simulatedResult,
              bivalent_points: [
                { temperature: -20, power: +(basePower * 1).toFixed(2) },
                { temperature: -10, power: +(basePower * 0.87).toFixed(2) },
                { temperature: 0, power: +(basePower * 0.65).toFixed(2) },
              ],
              heating_costs: {
                electricity: Math.round(simulatedResult.annual_energy_consumption * 0.65),
                pellets: Math.round(simulatedResult.annual_energy_consumption * 0.52),
                gas: Math.round(simulatedResult.annual_energy_consumption * 0.58),
              },
              improvements: [
                {
                  area: 'ściany',
                  suggestion: 'Rozważ docieplenie do 20 cm grafit EPS',
                  gain_kw: +(basePower * 0.08).toFixed(2),
                },
                {
                  area: 'stolarka',
                  suggestion: 'Uszczelnienie i wymiana najstarszych okien',
                  gain_kw: +(basePower * 0.05).toFixed(2),
                },
              ],
              energy_losses: {
                walls: +(basePower * 0.32).toFixed(2),
                roof: +(basePower * 0.18).toFixed(2),
                floor: +(basePower * 0.12).toFixed(2),
                ventilation: +(basePower * 0.22).toFixed(2),
              },
            };
          }

          function simulateCieploApiResponse(payload) {
            return new Promise(resolve => {
              setTimeout(() => {
                const simulatedResult = buildSimulatedResult(payload);
                const extendedPayload = buildSimulatedExtendedData(simulatedResult);
                simulatedApiStore.set(simulatedResult.id, extendedPayload);
                resolve({
                  status: 200,
                  data: {
                    id: simulatedResult.id,
                    result: simulatedResult,
                    extended: extendedPayload,
                    errors: null,
                  },
                });
              }, 900 + Math.round(Math.random() * 600));
            });
          }

          /**
           * Pobiera dane rozszerzone z API zgodnie z dokumentacją
           * GET https://cieplo.app/api/calculation/{id}?extended=1
           */
          async function fetchExtendedData(calculationId) {
            if (CIEPLO_API_SLEEP_MODE) {
              const stored = simulatedApiStore.get(calculationId);
              if (stored) {
                return {
                  success: true,
                  status: 200,
                  data: stored,
                };
              }
              return {
                success: false,
                status: 404,
                error: 'Brak danych symulacji',
              };
            }
            try {
              // Pobieram dane rozszerzone

              // Użyj tego samego proxy - przekaż ID jako parametr GET
              // Proxy powinien przekierować do: https://cieplo.app/api/calculation/{id}?extended=1
              const extendedUrl = `${proxyUrl}?id=${calculationId}&extended=1`;

              const response = await fetch(extendedUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }

              let data;
              try {
                data = await response.json();
                // Otrzymano dane rozszerzone
              } catch (jsonError) {
                // Błąd parsowania JSON danych rozszerzonych - cichy fallback
                throw new Error(
                  `Serwer zwrócił nieprawidłową odpowiedź (status ${response.status})`
                );
              }

              return {
                success: true,
                status: response.status,
                data: data,
              };
            } catch (error) {
              // Błąd pobierania danych rozszerzonych - cichy fallback
              return {
                success: false,
                status: 0,
                error: error.message,
              };
            }
          }

          async function callCieplo(payload) {
            // Increment counter if debug is enabled
            if (window.__DEBUG_PIPELINE_CALLS) {
              if (typeof window.__PIPELINE_CALL_COUNTERS === 'undefined') {
                window.__PIPELINE_CALL_COUNTERS = {
                  buildJsonData: 0,
                  callCieplo: 0,
                };
              }
              window.__PIPELINE_CALL_COUNTERS.callCieplo++;
              // Logowanie usunięte dla produkcji
            }

            try {
              let data;
              let httpStatus = 200;
              let useFallback = false;

              // ═══════════════════════════════════════════════════════════════════════════
              // ARCHITECTURAL DECISION: OZC ENGINE AS PRIMARY SOURCE
              // ═══════════════════════════════════════════════════════════════════════════
              // The canonical OZC engine (ozc-engine.js) is the primary source of truth.
              // API cieplo.app is used only as fallback if OZC engine fails.
              // This ensures deterministic, offline-capable calculations.
              // ═══════════════════════════════════════════════════════════════════════════
              const USE_OZC_ENGINE_PRIMARY = true; // ARCHITECTURAL: OZC is canonical

              if (USE_OZC_ENGINE_PRIMARY) {
                // Użyj naszego silnika OZC jako głównego źródła
                // Logowanie usunięte dla produkcji

                if (window.OZCEngine && typeof window.OZCEngine.calculateWithExtended === 'function') {
                  try {
                    // Użyj calculateWithExtended, aby uzyskać dane rozszerzone
                    const cieploFormat = await window.OZCEngine.calculateWithExtended(payload);

                    data = {
                      id: cieploFormat.id,
                      result: cieploFormat,
                      source: 'internal_ozc_engine',
                      fallback: false,
                    };
                    httpStatus = 200;
                  } catch (ozcError) {
                    // FAILURE HANDLING: OZC engine failure is explicit, not silent
                    console.error('❌ Błąd silnika OZC:', ozcError);
                    ErrorHandler.showToast(
                      `Błąd obliczeń: ${ozcError.message}`,
                      'error',
                      5000
                    );
                    throw new Error(`Błąd silnika OZC: ${ozcError.message}`);
                  }
                } else {
                  // FAILURE HANDLING: Missing OZC engine is explicit error
                  console.error('❌ Silnik OZC nie jest dostępny');
                  ErrorHandler.showToast(
                    'Błąd: Silnik obliczeniowy nie jest dostępny. Odśwież stronę.',
                    'error',
                      5000
                  );
                  throw new Error('Silnik OZC nie jest dostępny');
                }
              } else if (CIEPLO_API_SLEEP_MODE) {
                // Tryb uśpienia API – symuluję odpowiedź cieplo.app
                const simulatedResponse = await simulateCieploApiResponse(payload);
                data = simulatedResponse.data;
                httpStatus = simulatedResponse.status;
              } else {
                // Wysyłam zapytanie do API

                try {
                  const response = await fetch(proxyUrl, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                  });

                  let parsed;
                  try {
                    parsed = await response.json();
                    // Otrzymano odpowiedź z API
                  } catch (jsonError) {
                    // Błąd parsowania JSON odpowiedzi - cichy fallback
                    const textResponse = await response.text();
                    // Surowa odpowiedź serwera - cichy fallback
                    throw new Error(
                      `Serwer zwrócił nieprawidłową odpowiedź (status ${response.status})`
                    );
                  }

                  // Sprawdź błędy walidacji przed rzuceniem błędu HTTP
                  if (parsed.errors && Object.keys(parsed.errors).length > 0) {
                    // API zwróciło błędy walidacji - cichy fallback
                    // Ustaw dane, żeby obsługa błędów mogła je wyświetlić
                    data = parsed;
                    httpStatus = response.status;
                  } else if (!response.ok) {
                    // Jeśli nie ma błędów walidacji, ale status nie jest OK
                    const statusText = response.statusText || 'Błąd serwera';
                    // HTTP błąd - cichy fallback
                    throw new Error(`HTTP ${response.status}: ${statusText}`);
                  } else {
                    // Sukces
                    data = parsed;
                    httpStatus = response.status;
                  }
                } catch (apiError) {
                  // Rozróżnij błędy 4xx (błąd danych) vs 5xx/timeout (błąd serwera)
                  const isClientError = apiError.message && apiError.message.includes('4');
                  const isServerError =
                    apiError.message &&
                    (apiError.message.includes('5') ||
                      apiError.message.includes('timeout') ||
                      apiError.message.includes('network'));

                  if (isClientError) {
                    // Błąd 4xx = błąd danych użytkownika, NIE używaj fallback
                    console.error(
                      '❌ Błąd walidacji danych (4xx) - nie używam fallback:',
                      apiError
                    );
                    throw apiError;
                  }

                  // Błąd 5xx/timeout = użyj silnika OZC jako fallback
                  if (isServerError || !isClientError) {
                    console.warn(
                      '⚠️ Błąd serwera/timeout, używam silnika OZC jako fallback:',
                      apiError
                    );
                    useFallback = true;

                    if (window.OZCEngine && typeof window.OZCEngine.calculateWithExtended === 'function') {
                      try {
                        console.log('🔧 Obliczam OZC lokalnym silnikiem z danymi rozszerzonymi...');
                        const cieploFormat = await window.OZCEngine.calculateWithExtended(payload);

                        data = {
                          id: cieploFormat.id,
                          result: cieploFormat,
                          source: 'internal_ozc_engine',
                          fallback: true,
                        };
                        httpStatus = 200;

                        console.log('✅ Obliczenia OZC zakończone z danymi rozszerzonymi');
                        console.log('📊 Wynik w formacie cieplo.app:', cieploFormat);

                        // Ostrzeżenie dla użytkownika
                        const warningMsg = `Uwaga: Wynik obliczony lokalnym silnikiem OZC (confidence: ${cieploFormat.confidence.toFixed(
                          2
                        )}). API cieplo.app nie jest dostępne.`;
                        console.warn('⚠️', warningMsg);
                      } catch (ozcError) {
                        console.error('❌ Błąd silnika OZC:', ozcError);
                        throw new Error(`Błąd API i silnika OZC: ${ozcError.message}`);
                      }
                    } else {
                      console.error('❌ Silnik OZC nie jest dostępny');
                      throw new Error(`Błąd API i brak silnika OZC: ${apiError.message}`);
                    }
                  } else {
                    // Nieznany błąd - nie używaj fallback
                    throw apiError;
                  }
                }
              }

              if (typeof window.showTab === 'function') {
                window.showTab(resultTabIndex);
                console.log(`🚀 Przejście do zakładki wyników ${resultTabIndex}`);
              }

              if (data.errors && Object.keys(data.errors).length > 0) {
                // Loguj szczegóły błędów do konsoli
                console.error('❌ Szczegóły błędów walidacji API:', data.errors);
                console.error('📋 Pełna odpowiedź API:', JSON.stringify(data, null, 2));

                let errorMessage = '❌ Błędy walidacji API:\n\n';

                // Obsługa różnych formatów błędów
                if (typeof data.errors === 'object' && !Array.isArray(data.errors)) {
                  // Sprawdź czy errors ma zagnieżdżoną strukturę (np. errors.errors)
                  const errorsObj = data.errors.errors || data.errors;

                  Object.entries(errorsObj).forEach(([field, message]) => {
                    // message może być stringiem, tablicą stringów, lub obiektem
                    let messageText;
                    if (Array.isArray(message)) {
                      messageText = message.join(', ');
                    } else if (typeof message === 'object' && message !== null) {
                      messageText = JSON.stringify(message);
                    } else {
                      messageText = String(message);
                    }
                    errorMessage += `• ${field}: ${messageText}\n`;
                  });
                } else {
                  // Jeśli errors jest tablicą lub innym formatem
                  errorMessage += JSON.stringify(data.errors, null, 2);
                }

                // Wyświetl błędy użytkownikowi w kontenerze
                const errorContainer = document.getElementById('api-error-container');
                if (errorContainer) {
                  errorContainer.innerHTML = `
                                <div class="api-error-box" style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; margin: 16px 0;">
                                    <h4 style="color: #991B1B; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Błędy walidacji</h4>
                                    <p style="color: #7F1D1D; margin: 0; white-space: pre-line; font-size: 14px; line-height: 1.5;">${errorMessage}</p>
                                </div>
                            `;
                  errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                  // Fallback do alertu jeśli kontener nie istnieje
                  ErrorHandler.handleAPIErrors(data.errors);
                }

                // Podświetl pola z błędami
                Object.keys(data.errors).forEach(fieldName => {
                  const field =
                    document.querySelector(`[name="${fieldName}"]`) ||
                    document.querySelector(`[name="${fieldName}[material]"]`) ||
                    document.querySelector(`[name="${fieldName}[size]"]`);
                  if (field) {
                    field.style.border = '2px solid #ff4444';
                    field.style.backgroundColor = '#ffe6e6';
                    // Usuń podświetlenie po 5 sekundach
                    setTimeout(() => {
                      field.style.border = '';
                      field.style.backgroundColor = '';
                    }, 5000);
                  }
                });

                return {
                  success: false,
                  status: httpStatus,
                  errors: data.errors,
                  data: data,
                };
              }

              const resultData =
                data.result || (data.max_heating_power && data.total_area ? data : null);

              if (resultData) {
                console.log('✅ Otrzymano wynik z API (bezpośrednio lub przez ID)');
                window.lastCalculationResult = resultData;
                if (typeof window.updateAppState === 'function') {
                  window.updateAppState({ lastCalculationResult: resultData });
                }

                // Jeśli mamy ID, spróbuj pobrać też dane rozszerzone (opcjonalnie, w tle)
                if (data.id || resultData.id) {
                  const calcId = data.id || resultData.id;
                  console.log('🔄 Próba pobrania danych rozszerzonych dla ID:', calcId);

                  // Pobierz dane rozszerzone asynchronicznie (nie blokuj wyświetlania podstawowych wyników)
                  fetchExtendedData(calcId)
                    .then(extendedResponse => {
                      if (extendedResponse.success && extendedResponse.data) {
                        const extendedData = extendedResponse.data;
                        console.log('✅ Otrzymano dane rozszerzone w tle');

                        // Zaktualizuj wyniki o dane rozszerzone
                        const extendedResult = {
                          ...resultData,
                          extended: {
                            bivalent_points: extendedData.bivalent_points,
                            heating_costs: extendedData.heating_costs,
                            improvements: extendedData.improvements,
                            energy_losses: extendedData.energy_losses || extendedData.energy_loses,
                          },
                        };
                        window.lastCalculationResult = extendedResult;
                        if (typeof window.updateAppState === 'function') {
                          window.updateAppState({ lastCalculationResult: extendedResult });
                        }

                        // Zaktualizuj wyświetlane wyniki jeśli funkcja obsługuje dane rozszerzone
                        if (typeof window.displayResults === 'function') {
                          window.displayResults(window.lastCalculationResult);
                        }
                      }
                    })
                    .catch(err => {
                      console.warn(
                        '⚠️ Nie udało się pobrać danych rozszerzonych (niekrytyczne):',
                        err
                      );
                    });
                }

                setTimeout(() => {
                  if (typeof window.displayResults === 'function') {
                    window.displayResults(resultData);
                  } else {
                    console.error('❌ Funkcja displayResults nie jest dostępna');
                    displayBasicResults(resultData);
                  }
                }, 500);

                return {
                  success: true,
                  status: httpStatus,
                  result: resultData,
                  data: data,
                };
              }

              if (data.id) {
                console.log('🔄 Otrzymano ID, pobieram dane rozszerzone...', data.id);

                // Automatycznie pobierz dane rozszerzone zgodnie z dokumentacją API
                try {
                  const extendedResponse = await fetchExtendedData(data.id);

                  if (extendedResponse.success && extendedResponse.data) {
                    const extendedData = extendedResponse.data;

                    // Połącz wyniki podstawowe z rozszerzonymi
                    const resultData =
                      extendedData.result ||
                      (extendedData.max_heating_power && extendedData.total_area
                        ? extendedData
                        : null);

                    if (resultData) {
                      console.log('✅ Otrzymano dane rozszerzone z API');

                      // Zachowaj pełne dane rozszerzone
                      const extendedResult = {
                        ...resultData,
                        extended: {
                          bivalent_points: extendedData.bivalent_points,
                          heating_costs: extendedData.heating_costs,
                          improvements: extendedData.improvements,
                          energy_losses: extendedData.energy_losses || extendedData.energy_loses,
                        },
                      };
                      window.lastCalculationResult = extendedResult;
                      if (typeof window.updateAppState === 'function') {
                        window.updateAppState({ lastCalculationResult: extendedResult });
                      }

                      setTimeout(() => {
                        if (typeof window.displayResults === 'function') {
                          window.displayResults(window.lastCalculationResult);
                        } else {
                          console.error('❌ Funkcja displayResults nie jest dostępna');
                          displayBasicResults(resultData);
                        }
                      }, 500);

                      return {
                        success: true,
                        status: extendedResponse.status,
                        result: window.lastCalculationResult,
                        data: extendedData,
                      };
                    }
                  }

                  console.warn('⚠️ Nie udało się pobrać danych rozszerzonych');

                  // Fallback - użyj podstawowych danych jeśli są dostępne
                  const fallbackResult =
                    data.result || (data.max_heating_power && data.total_area ? data : null);
                  if (fallbackResult) {
                    window.lastCalculationResult = fallbackResult;
                    if (typeof window.updateAppState === 'function') {
                      window.updateAppState({ lastCalculationResult: fallbackResult });
                    }
                    setTimeout(() => {
                      if (typeof window.displayResults === 'function') {
                        window.displayResults(fallbackResult);
                      } else {
                        displayBasicResults(fallbackResult);
                      }
                    }, 500);

                    return {
                      success: true,
                      status: httpStatus,
                      result: fallbackResult,
                      data: data,
                    };
                  }
                } catch (extendedError) {
                  console.error('❌ Błąd pobierania danych rozszerzonych:', extendedError);
                  // Kontynuuj z podstawowymi danymi jeśli dostępne
                }

                return {
                  success: false,
                  status: response.status,
                  message: 'Otrzymano ID, ale nie udało się pobrać wyników',
                  data: data,
                };
              }

              console.warn('⚠️ API nie zwróciło ani wyników, ani ID:', data);
              return {
                success: false,
                status: httpStatus,
                message: `API nie zwróciło wyniku (status ${httpStatus})`,
                data: data,
              };
            } catch (error) {
              console.error('❌ Błąd zapytania API:', error);

              // Nie wyświetlaj alertu, jeśli błędy walidacji są już obsłużone
              // (błędy walidacji są zwracane jako success: false z errors, nie jako wyjątek)
              if (!error.message.includes('HTTP 400')) {
                if (
                  error.message.includes('Failed to fetch') ||
                  error.message.includes('NetworkError')
                ) {
                  ErrorHandler.showToast(
                    'Błąd połączenia z serwerem. Sprawdź połączenie internetowe.',
                    'error',
                    5000
                  );
                } else if (!error.message.includes('Błędy walidacji')) {
                  ErrorHandler.showToast(
                    `Nie udało się pobrać wyników: ${error.message}`,
                    'error',
                    5000
                  );
                }
              }

              return {
                success: false,
                status: 0,
                error: error.message,
                networkError:
                  error.message.includes('Failed to fetch') ||
                  error.message.includes('NetworkError'),
              };
            } finally {
              isAPICallInProgress = false;
              newBtn.disabled = false;
              newBtn.style.opacity = '1';
            }
          }

          function displayBasicResults(result) {
            const resultElements = {
              'r-total-area': `${result.total_area || result.heated_area || 0} m²`,
              'r-heated-area': `${result.heated_area || 0} m²`,
              'r-temp': `${result.design_outdoor_temperature || -20} °C`,
              'r-max-power': `${result.max_heating_power || 0} kW`,
              'r-cwu': `${result.hot_water_power || 0} kW`,
              'r-bi-power': `${result.bivalent_point_heating_power || 0} kW`,
              'r-avg-power': `${result.avg_heating_power || 0} kW`,
              'r-temp-avg': `${result.avg_outdoor_temperature || 8} °C`,
              'r-energy': `${Math.round(result.annual_energy_consumption || 0)} kWh`,
              'r-factor': `${result.annual_energy_consumption_factor || 0}`,
              'r-power-factor': `${result.heating_power_factor || 0}`,
            };

            Object.entries(resultElements).forEach(([id, value]) => {
              const element = document.getElementById(id);
              if (element) {
                element.textContent = value;
              }
            });

            console.log('✅ Podstawowe wyniki wyświetlone (fallback)');
          }

          callCieplo(jsonData)
            .then(result => {
              if (result.success) {
                console.log('✅ Obliczenia zakończone pomyślnie');
              } else if (result.errors) {
                console.log('⚠️ API zwróciło błędy walidacji - formularz wymaga poprawy');
              } else if (result.networkError) {
                console.error('❌ Błąd sieciowy');
              } else {
                console.warn('⚠️ Nieoczekiwana odpowiedź API:', result);
              }
            })
            .catch(err => {
              console.error('❌ Błąd końcowy:', err);
              const resultsSection = document.getElementById('results-section');
              if (resultsSection) {
                resultsSection.innerHTML = `
                        <div style="text-align: center; color: #dc3545; padding: 20px;">
                            <h3>❌ Wystąpił błąd</h3>
                            <p>Nie udało się pobrać wyników. Spróbuj ponownie.</p>
                        </div>
                    `;
              }
            });
        });
      };

      newBtn.addEventListener('click', clickHandler);
    }

    // Setup first tab navigation
    function setupFirstTabNavigation() {
      const btnNext1 = document.querySelector('.btn-next1');
      if (!btnNext1) {
        console.error('❌ Nie znaleziono przycisku .btn-next1');
        return;
      }

      const newBtn = btnNext1.cloneNode(true);
      btnNext1.parentNode.replaceChild(newBtn, btnNext1);

      const clickHandler = function (e) {
        e.preventDefault();
        e.stopPropagation();

        const requiredFields = ['building_type', 'construction_year', 'location_id'];

        let isValid = true;
        for (const fieldName of requiredFields) {
          const field = document.querySelector(`[name="${fieldName}"]`);
          if (!field || !field.value.trim()) {
            console.warn(`❌ Pole ${fieldName} jest puste`);
            isValid = false;
            break;
          }
        }

        if (!isValid) {
          ErrorHandler.showFormNotification(
            'Uzupełnij wymagane pola',
            'Przed wysłaniem formularza wypełnij wszystkie wymagane pola.',
            [],
            'warning'
          );
          return false;
        }

        newBtn.disabled = true;
        newBtn.style.opacity = '0.6';

        if (!window.sections || !window.sections.length) {
          window.sections = document.querySelectorAll('#top-instal-calc .section');
        }

        try {
          window.showTab(1);

          if (typeof window.activateTooltips === 'function') {
            setTimeout(window.activateTooltips, 100);
          }
        } catch (error) {
          console.error('Błąd przejścia do następnej zakładki:', error);
          ErrorHandler.showToast('Wystąpił błąd. Spróbuj ponownie.', 'error');
        } finally {
          newBtn.disabled = false;
          newBtn.style.opacity = '1';
        }

        return false;
      };

      addCalculatorEventListener(newBtn, 'click', clickHandler);
    }

    setupFirstTabNavigation();

    setupStepButton(
      'btn-next2',
      1,
      [
        { text: 'Odczytuję wymiary budynku…', delay: 1200 },
        { text: 'Uwzględniam obecność balkonów, garażu, piwnicy…', delay: 1600 },
        { text: 'Obliczam kubaturę i wpływ na zapotrzebowanie cieplne…', delay: 1600 },
        { text: 'Parametry zaakceptowane. Przechodzę do konstrukcji.', delay: 900 },
      ],
      2
    );

    setupStepButton(
      'btn-next3',
      2,
      [
        { text: 'Analizuję typ ścian oraz ich grubość…', delay: 1300 },
        { text: 'Oceniam izolacyjność na podstawie materiałów budowlanych…', delay: 1600 },
        { text: 'Konstrukcja spełnia kryteria. Przechodzę do okien i drzwi.', delay: 900 },
      ],
      3
    );

    setupStepButton(
      'btn-next4',
      3,
      [
        { text: 'Zapisuję parametry przeszkleń…', delay: 1000 },
        { text: 'Uwaga na mostki cieplne – oceniam wpływ powierzchni okien i drzwi…', delay: 1400 },
        { text: 'Straty przez stolarkę uwzględnione. Przechodzę dalej.', delay: 1000 },
      ],
      4
    );

    setupStepButton(
      'btn-next5',
      4,
      [
        { text: 'Analizuję izolację dachu/stropodachu oraz podłogi…', delay: 1100 },
        {
          text: 'Współczynnik przenikania ciepła U - szukam odpowiedniej metody obliczeniowej',
          delay: 1100,
        },
        { text: 'Współczynnik strat ciepła zaktualizowany.', delay: 900 },
        { text: 'Za chwilę ostatni krok. Przechodzę dalej…', delay: 900 },
      ],
      5
    );

    setupFinishButtonWithAPI(
      'btn-finish',
      5,
      [
        { text: 'Zapisuję dane końcowe…', delay: 900 },
        { text: 'Rozpoczynam analizę AI budynku…', delay: 1200 },
        { text: 'Obliczam maksymalne zapotrzebowanie na moc grzewczą…', delay: 1100 },
        { text: 'Uwzględniam CWU, jeśli zaznaczono…', delay: 900 },
        { text: 'Dobieram pompę ciepła wg tabel Panasonic…', delay: 1600 },
        { text: 'Dane gotowe. Generuję rekomendację pomp.', delay: 1200 },
      ],
      6
    );

    // TYMCZASOWY PRZYCISK DO TESTÓW API Z HARDCODED DANymi
    // UKRYTY W PRODUKCJI - tylko w trybie debug
    const testApiBtn = document.getElementById('test-api-btn');
    if (testApiBtn && !window.DEBUG_MODE) {
      // Ukryj przycisk testowy w produkcji
      testApiBtn.style.display = 'none';
    }
    if (testApiBtn && window.DEBUG_MODE) {
      testApiBtn.addEventListener('click', async function (e) {
        e.preventDefault();

        if (isAPICallInProgress) {
          console.log('⚠️ Wywołanie API już w toku - pomijam');
          return;
        }

        isAPICallInProgress = true;
        testApiBtn.disabled = true;
        testApiBtn.style.opacity = '0.6';
        testApiBtn.textContent = '⏳ Wysyłam...';

        // Hardcoded dane - dokładnie jak w Twoim przykładzie
        const hardcodedPayload = {
          building_type: 'single_house',
          construction_year: 2025,
          construction_type: 'traditional',
          latitude: 51.1079,
          longitude: 17.0385,
          building_length: 10,
          building_width: 5,
          building_floors: 2,
          building_heated_floors: [1, 2],
          floor_height: 2.6,
          building_roof: 'flat',
          has_basement: false,
          has_balcony: true,
          garage_type: 'single_unheated',
          wall_size: 65,
          primary_wall_material: 84,
          secondary_wall_material: 84,
          external_wall_isolation: {
            material: 88,
            size: 15,
          },
          top_isolation: {
            material: 68,
            size: 35,
          },
          bottom_isolation: {
            material: 68,
            size: 5,
          },
          number_doors: 2,
          number_balcony_doors: 2,
          number_windows: 12,
          number_huge_windows: 0,
          doors_type: 'new_pvc',
          windows_type: '2021_triple_glass',
          indoor_temperature: 21,
          ventilation_type: 'natural',
          heating_type: 'radiators',
          source_type: 'air_to_water_hp',
          include_hot_water: true,
          hot_water_persons: 3,
          hot_water_usage: 'shower_bath',
        };

        console.log('🧪 TEST API - Wysyłam hardcoded dane:', hardcodedPayload);

        // Użyj tej samej funkcji callCieplo, ale z hardcoded danymi
        // Użyj dynamicznego URL z WordPress (HEATPUMP_CONFIG) lub fallback
      const proxyUrl = (window.HEATPUMP_CONFIG && window.HEATPUMP_CONFIG.cieploProxyUrl)
        ? window.HEATPUMP_CONFIG.cieploProxyUrl
        : 'https://topinstal.com.pl/cieplo-proxy.php';

        // Funkcja fetchExtendedData dla przycisku testowego
        async function fetchExtendedData(calculationId) {
          try {
            console.log(`📥 Pobieram dane rozszerzone dla ID: ${calculationId}`);
            const extendedUrl = `${proxyUrl}?id=${calculationId}&extended=1`;

            const response = await fetch(extendedUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            let data = await response.json();
            console.log(`✅ Otrzymano dane rozszerzone (status ${response.status}):`, data);

            return {
              success: true,
              status: response.status,
              data: data,
            };
          } catch (error) {
            console.error('❌ Błąd pobierania danych rozszerzonych:', error);
            return {
              success: false,
              status: 0,
              error: error.message,
            };
          }
        }

        try {
          // Dodaj nonce jeśli dostępny (WordPress security)
          const headers = {
            'Content-Type': 'application/json',
          };

          if (window.HEATPUMP_CONFIG && window.HEATPUMP_CONFIG.nonce) {
            headers['X-WP-Nonce'] = window.HEATPUMP_CONFIG.nonce;
          }

          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(hardcodedPayload),
          });

          // Przejdź do zakładki wyników (jeśli nie jesteśmy już tam)
          if (typeof window.showTab === 'function') {
            window.showTab(6);
            console.log('🚀 Przejście do zakładki wyników 6');
          }

          let data;
          try {
            data = await response.json();
            console.log(`📥 Otrzymano odpowiedź z API (status ${response.status}):`, data);
          } catch (jsonError) {
            console.error('❌ Błąd parsowania JSON odpowiedzi:', jsonError);
            throw new Error(`Serwer zwrócił nieprawidłową odpowiedź (status ${response.status})`);
          }

          // Obsługa błędów walidacji
          if (data.errors && Object.keys(data.errors).length > 0) {
            let errorMessage = '❌ Błędy walidacji:\n\n';
            Object.entries(data.errors).forEach(([field, message]) => {
              errorMessage += `• ${field}: ${message}\n`;
            });
            ErrorHandler.handleAPIErrors(data.errors);

            isAPICallInProgress = false;
            testApiBtn.disabled = false;
            testApiBtn.style.opacity = '1';
            testApiBtn.textContent = '🧪 TEST API (Hardcoded Data)';
            return;
          }

          const resultData =
            data.result || (data.max_heating_power && data.total_area ? data : null);

          if (resultData) {
            console.log('✅ Otrzymano wynik z API');
            window.lastCalculationResult = resultData;

            // Pobierz dane rozszerzone jeśli mamy ID
            if (data.id || resultData.id) {
              const calcId = data.id || resultData.id;
              console.log('🔄 Próba pobrania danych rozszerzonych dla ID:', calcId);

              fetchExtendedData(calcId)
                .then(extendedResponse => {
                  if (extendedResponse.success && extendedResponse.data) {
                    const extendedData = extendedResponse.data;
                    console.log('✅ Otrzymano dane rozszerzone w tle');

                    window.lastCalculationResult = {
                      ...resultData,
                      extended: {
                        bivalent_points: extendedData.bivalent_points,
                        heating_costs: extendedData.heating_costs,
                        improvements: extendedData.improvements,
                        energy_losses: extendedData.energy_losses || extendedData.energy_loses,
                      },
                    };

                    if (typeof window.displayResults === 'function') {
                      window.displayResults(window.lastCalculationResult);
                    }
                  }
                })
                .catch(err => {
                  console.warn('⚠️ Nie udało się pobrać danych rozszerzonych (niekrytyczne):', err);
                });
            }

            // Wyświetl wyniki
            // Wyświetl wyniki
            setTimeout(() => {
              if (typeof window.displayResults === 'function') {
                window.displayResults(resultData);
              } else {
                console.error('❌ Funkcja displayResults nie jest dostępna');
                // Fallback: wyświetl podstawowe informacje
                const resultContainer = document.getElementById('results-container');
                if (resultContainer) {
                  resultContainer.innerHTML = `
                                        <div class="results-fallback">
                                            <h3>Wyniki obliczeń</h3>
                                            <p>Moc grzewcza: ${resultData.max_heating_power} kW</p>
                                            <p>Moc CWU: ${resultData.hot_water_power || 0} kW</p>
                                        </div>
                                    `;
                }
              }
            }, 500);

            console.log('✅ Obliczenia zakończone pomyślnie');
          }

          isAPICallInProgress = false;
          testApiBtn.disabled = false;
          testApiBtn.style.opacity = '1';
          testApiBtn.textContent = '🧪 TEST API (Hardcoded Data)';
        } catch (error) {
          console.error('❌ Błąd podczas wywołania API:', error);
          ErrorHandler.showToast('Błąd podczas wywołania API: ' + error.message, 'error', 5000);

          isAPICallInProgress = false;
          testApiBtn.disabled = false;
          testApiBtn.style.opacity = '1';
          testApiBtn.textContent = '🧪 TEST API (Hardcoded Data)';
        }
      });

      console.log('✅ Tymczasowy przycisk testowy API zainicjalizowany');
    }

    // Obsługa przycisków "Wstecz"
    const backButtons = document.querySelectorAll('#top-instal-calc .btn-prev');
    backButtons.forEach(btn => {
      if (!btn) return;

      const backHandler = e => {
        e.preventDefault();
        e.stopPropagation();

        if (window.currentTab > 0) {
          try {
            window.showTab(window.currentTab - 1);
          } catch (error) {
            console.error('Błąd powrotu do poprzedniej zakładki:', error);
          }
        }
      };

      addCalculatorEventListener(btn, 'click', backHandler);
    });

    // Inicjalizacja modułów - Promise-based bez race conditions
    async function initializeModules() {
      try {
        // Krok 1: Floor Rendering (musi być pierwszy)
        if (typeof window.initFloorRenderingListeners === 'function') {
          await new Promise(resolve => {
            window.initFloorRenderingListeners();
            setTimeout(resolve, 100);
          });
        } else if (typeof window.renderHeatedFloors === 'function') {
          window.renderHeatedFloors();
        }

        // Krok 2: Dynamic Fields - USUNIĘTE (formEngine.refresh obsługuje to)

        // Krok 3: Tooltips
        if (typeof window.activateTooltips === 'function') {
          window.activateTooltips();
        }

        // Krok 4: Progressive Disclosure (KRYTYCZNE - bez timeoutów!)
        if (
          typeof window.progressiveDisclosure !== 'undefined' &&
          window.progressiveDisclosure.init
        ) {
          console.log('🔄 Inicjalizacja progressive disclosure...');
          window.progressiveDisclosure.init();
        }

        // Krok 5: AI Watchers (na końcu, nie blokuje)
        if (typeof window.initAIWatchers === 'function') {
          setTimeout(() => window.initAIWatchers(), 500);
        }

        console.log('✅ Wszystkie moduły zainicjalizowane poprawnie');
      } catch (error) {
        console.error('❌ Błąd podczas inicjalizacji modułów:', error);
      }
    }

    initializeModules();

    console.log('✅ Kalkulator zainicjalizowany pomyślnie');
  }

  /**
   * Główna inicjalizacja - zgodnie z architekturą WordPress/Elementor
   *
   * ZASADY:
   * 1. JS jest idempotentny (można wywołać wielokrotnie)
   * 2. Sprawdza czy kontener istnieje przed inicjalizacją
   * 3. NIE używa DOMContentLoaded (Elementor może renderować asynchronicznie)
   * 4. Reset session storage przy każdym załadowaniu (zawsze zaczyna od początku)
   */
  function initCalculatorApp() {
    // GUARD: Sprawdź czy kontener istnieje (zgodnie z dokumentacją)
    const root = document.querySelector('#wycena-calculator-app, .heatpump-calculator-wrapper');
    if (!root) {
      console.warn('[Calculator] ❌ Kontener aplikacji nie znaleziony - wyjście');
      return;
    }

    // GUARD: Sprawdź czy już zainicjalizowano (idempotentność)
    if (root.dataset.initialized === 'true') {
      console.log('[Calculator] ✅ Aplikacja już zainicjalizowana - pomijam');
      return;
    }

    console.log('🚀 Uruchamiam TOP-INSTAL Calculator v4.1');

      // KROK 1: Inicjalizuj kalkulator (stan z sessionStorage zostaje zachowany w obrębie karty)
      // KROK 2: Inicjalizuj kalkulator
      initTopInstalCalculator();

    // Oznacz jako zainicjalizowany (idempotentność)
    root.dataset.initialized = 'true';
  }

  // Inicjalizacja: próbuj wielokrotnie (dla Elementora i asynchronicznego renderowania)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculatorApp);
  } else {
    // DOM już załadowany - wywołaj natychmiast
    initCalculatorApp();
  }

  // Fallback dla Elementora: próbuj ponownie po krótkim opóźnieniu
  setTimeout(initCalculatorApp, 500);

  // Fallback dla Elementora: próbuj gdy Elementor zakończy renderowanie
  if (typeof window.elementorFrontend !== 'undefined') {
    window.elementorFrontend.hooks.addAction('frontend/element_ready/global', function() {
      setTimeout(initCalculatorApp, 100);
    });
  }

  // Export funkcji
  window.initTopInstalCalculator = initTopInstalCalculator;
})();
