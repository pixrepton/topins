(function () {
  'use strict';

  // Tabela doboru pomp ciepła - tylko modele ze starego kodu (SDC→WC, ADC)
  // Zakresy min/max to zakresy mocy przy -20°C (dane doborowe Panasonic), NIE zakresy modulacji
  const pumpMatchingTable = {
    // HIGH PERFORMANCE - SPLIT - 1~ (230V) - Seria K
    'KIT-WC03K3E5': {
      min: { surface: 3.0, mixed: 3.0, radiators: 2.5 },
      max: { surface: 4.2, mixed: 4.2, radiators: 3.5 },
      power: 3,
      series: 'K',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC05K3E5': {
      min: { surface: 4.3, mixed: 4.3, radiators: 3.5 },
      max: { surface: 6.5, mixed: 6.4, radiators: 6.0 },
      power: 5,
      series: 'K',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC07K3E5': {
      min: { surface: 5.5, mixed: 5.0, radiators: 4.5 },
      max: { surface: 7.0, mixed: 6.5, radiators: 6.5 },
      power: 7,
      series: 'K',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC09K3E5': {
      min: { surface: 6.7, mixed: 6.5, radiators: 5.5 },
      max: { surface: 8.0, mixed: 8.0, radiators: 7.5 },
      power: 9,
      series: 'K',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    // HIGH PERFORMANCE - SPLIT - 3~ (400V) - Seria K
    'KIT-WC09K3E8': {
      min: { surface: 8.0, mixed: 8.1, radiators: 7.5 },
      max: { surface: 11.0, mixed: 10.5, radiators: 10.0 },
      power: 9,
      series: 'K',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    'KIT-WC12K9E8': {
      min: { surface: 10.5, mixed: 9.5, radiators: 8.5 },
      max: { surface: 14.5, mixed: 13.5, radiators: 13.0 },
      power: 12,
      series: 'K',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    'KIT-WC16K9E8': {
      min: { surface: 12.5, mixed: 11.0, radiators: 10.0 },
      max: { surface: 17.5, mixed: 16.0, radiators: 14.5 },
      power: 16,
      series: 'K',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    // HIGH PERFORMANCE - ALL IN ONE 185L - 1~ (230V) - Seria K
    'KIT-ADC03K3E5': {
      min: { surface: 3.0, mixed: 3.0, radiators: 2.5 },
      max: { surface: 4.2, mixed: 4.2, radiators: 3.5 },
      power: 3,
      series: 'K',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC05K3E5': {
      min: { surface: 4.3, mixed: 4.3, radiators: 3.5 },
      max: { surface: 6.5, mixed: 6.4, radiators: 6.0 },
      power: 5,
      series: 'K',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC07K3E5': {
      min: { surface: 5.5, mixed: 5.0, radiators: 4.5 },
      max: { surface: 7.0, mixed: 6.5, radiators: 6.5 },
      power: 7,
      series: 'K',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC09K3E5': {
      min: { surface: 6.7, mixed: 6.5, radiators: 5.5 },
      max: { surface: 8.0, mixed: 8.0, radiators: 7.5 },
      power: 9,
      series: 'K',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    // HIGH PERFORMANCE - ALL IN ONE 185L - 3~ (400V) - Seria K
    'KIT-ADC09K9E8': {
      min: { surface: 8.0, mixed: 8.1, radiators: 7.5 },
      max: { surface: 11.0, mixed: 10.5, radiators: 10.0 },
      power: 9,
      series: 'K',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
    'KIT-ADC12K9E8': {
      min: { surface: 10.5, mixed: 9.5, radiators: 8.5 },
      max: { surface: 14.5, mixed: 13.5, radiators: 13.0 },
      power: 12,
      series: 'K',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
    'KIT-ADC16K9E8': {
      min: { surface: 12.5, mixed: 11.0, radiators: 10.0 },
      max: { surface: 17.5, mixed: 16.0, radiators: 14.5 },
      power: 16,
      series: 'K',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
  };

  // Baza danych pomp ciepła - generowana z pumpMatchingTable (ceny szacunkowe)
  const pumpCardsData = Object.keys(pumpMatchingTable).map(model => {
    const data = pumpMatchingTable[model];
    // Użyj dynamicznego URL z konfiguracji WordPress
    const imgUrl = window.HEATPUMP_CONFIG?.imgUrl || '../img';
    const image = data.type === 'split' ? `${imgUrl}/split-k.png` : `${imgUrl}/allinone.png`;
    // Szacunkowe ceny na podstawie mocy i typu (można później uzupełnić z bazy cen)
    const basePrice = data.type === 'split' ? 15000 : 17000;
    const powerMultiplier = data.power * 1000;
    const phaseMultiplier = data.phase === 3 ? 1.1 : 1.0;
    const price = Math.round(basePrice + powerMultiplier * phaseMultiplier);
    return {
      model: model,
      power: data.power,
      series: data.series,
      type: data.type,
      image: image,
      price: price,
      phase: data.phase,
      requires3F: data.requires3F,
    };
  });

  /**
   * Waliduje i normalizuje dane wyników z API
   */
  function validateAndNormalizeResult(result) {
    if (!result || typeof result !== 'object') {
      throw new Error('Brak danych wyników lub nieprawidłowy format');
    }

    // Mapowanie pól z API na wymagane pola
    const normalized = {
      total_area: parseFloat(result.total_area || result.totalArea || result.floor_area || 0),
      heated_area: parseFloat(result.heated_area || result.heatedArea || result.floor_area || 0),
      design_outdoor_temperature: parseFloat(
        result.design_outdoor_temperature || result.designOutdoorTemperature || -20
      ),
      max_heating_power: parseFloat(
        result.max_heating_power || result.maxHeatingPower || result.heating_power || 0
      ),
      hot_water_power: parseFloat(
        result.hot_water_power || result.hotWaterPower || result.cwu_power || 0
      ),
      bivalent_point_heating_power: parseFloat(
        result.bivalent_point_heating_power ||
          result.bivalentPointHeatingPower ||
          result.bi_power ||
          0
      ),
      avg_heating_power: parseFloat(
        result.avg_heating_power || result.avgHeatingPower || result.average_power || 0
      ),
      avg_outdoor_temperature: parseFloat(
        result.avg_outdoor_temperature || result.avgOutdoorTemperature || 8
      ),
      annual_energy_consumption: parseFloat(
        result.annual_energy_consumption ||
          result.annualEnergyConsumption ||
          result.energy_consumption ||
          0
      ),
      annual_energy_consumption_factor: parseFloat(
        result.annual_energy_consumption_factor ||
          result.annualEnergyConsumptionFactor ||
          result.energy_factor ||
          0
      ),
      heating_power_factor: parseFloat(
        result.heating_power_factor || result.heatingPowerFactor || result.power_factor || 0
      ),
      cop: parseFloat(result.cop || result.COP || 4.0),
      scop: parseFloat(result.scop || result.SCOP || 4.0),
    };

    // Sprawdź czy mamy podstawowe dane
    if (normalized.max_heating_power <= 0) {
      throw new Error('Brak wymaganej mocy grzewczej w wynikach API');
    }

    if (normalized.heated_area <= 0) {
      throw new Error('Brak powierzchni ogrzewanej w wynikach API');
    }

    // Logowanie usunięte dla produkcji
    return normalized;
  }

  /**
   * Dobiera pompy ciepła na podstawie wyników
   */
  function selectHeatPumps(result, heatingType = 'radiators') {
    const powerDemand = result.max_heating_power + (result.hot_water_power || 0);
    // Logowanie usunięte dla produkcji

    const matchingPumps = Object.entries(pumpMatchingTable)
      .filter(([model, data]) => {
        const min = data.min[heatingType];
        const max = data.max[heatingType];
        return powerDemand >= min && powerDemand <= max;
      })
      .map(([model, data]) => {
        const pumpData = pumpCardsData.find(p => p.model === model);
        // Użyj dynamicznego URL z konfiguracji WordPress
        const imgUrl = window.HEATPUMP_CONFIG?.imgUrl || '../img';
        return {
          model: model,
          power: data.power,
          series: data.series,
          type: data.type,
          image: pumpData?.image || `${imgUrl}/default-pump.png`,
          price: pumpData?.price || 0,
        };
      });

    // Logowanie usunięte dla produkcji
    return matchingPumps;
  }

  function displayResults(result) {
    const setText = (id, val, unit = '') => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null) el.textContent = `${val}${unit}`;
    };

    // Podstawowe wyniki
    setText('r-total-area', result.total_area, ' m²');
    setText('r-heated-area', result.heated_area, ' m²');
    setText('r-max-power', result.max_heating_power, ' kW');
    setText('r-cwu', result.hot_water_power || 0, ' kW');
    setText('r-energy', Math.round(result.annual_energy_consumption), ' kWh');
    setText('r-temp', result.design_outdoor_temperature, '°C');
    setText('r-bi-power', result.bivalent_point_heating_power, ' kW');
    setText('r-avg-power', result.avg_heating_power, ' kW');
    setText('r-temp-avg', result.avg_outdoor_temperature, '°C');
    setText('r-avg-daily-energy', Math.round(result.avg_daily_energy_consumption || 0), ' kWh');
    setText('r-factor', result.annual_energy_consumption_factor, ' kWh/m²');
    setText('r-power-factor', result.heating_power_factor, ' W/m²');

    // ═══════════════════════════════════════════════════════════════════════════
    // SPECJALNE KOMUNIKATY W PROFILU ENERGETYCZNYM
    // ═══════════════════════════════════════════════════════════════════════════

    // Komunikat dla budynków >25kW
    const systemComment = document.getElementById('system-comment-text');
    if (systemComment && (result.max_heating_power >= 25 || result.recommended_power_kw >= 25)) {
      systemComment.textContent =
        'Obsługa budynków o mocy w temp. projektowej większej niż 25kW niedostępna. Zalecamy termomodernizację budynku przed doborem pompy ciepła.';
      systemComment.style.color = '#ef4444';
      systemComment.style.fontWeight = 'bold';
    }

    // Komunikat dla budynków 16-25kW
    if (systemComment && result.max_heating_power >= 16 && result.max_heating_power < 25) {
      systemComment.textContent =
        'System wykrył prądożerne połączenie. Budynek najprawdopodobniej wymaga termomodernizacji. Rekomendujemy ocieplenie budynku lub wymianę stolarki przed doborem pompy ciepła.';
      systemComment.style.color = '#f59e0b';
      systemComment.style.fontWeight = 'bold';
    }

    // === DANE ROZSZERZONE ===
    if (result.extended) {
      // Logowanie usunięte dla produkcji

      // Pokaż sekcje rozszerzone
      const extendedSections = document.getElementById('extended-results-sections');
      if (extendedSections) {
        extendedSections.style.display = 'block';
      }

      // 1. Straty ciepła (Energy Losses)
      if (result.extended.energy_losses && result.extended.energy_losses.length > 0) {
        displayEnergyLosses(result.extended.energy_losses);
      }

      // 2. Propozycje modernizacji (Improvements)
      if (result.extended.improvements && result.extended.improvements.length > 0) {
        displayImprovements(result.extended.improvements);
      }

      // 3. Koszty ogrzewania (Heating Costs)
      if (result.extended.heating_costs && result.extended.heating_costs.length > 0) {
        displayHeatingCosts(result.extended.heating_costs);
      }

      // 4. Punkty biwalentne (Bivalent Points)
      if (result.extended.bivalent_points) {
        displayBivalentPoints(result.extended.bivalent_points);
      }
    }

    // === INTEGRACJA Z KONFIGURATOREM MASZYNOWNI ===
    // Zbierz podstawowe dane z formularza PRZED blokiem try (używane też poza try)
    let formSnapshot = {};
    if (window.formEngine && typeof window.formEngine.getState === 'function') {
      formSnapshot = window.formEngine.getState() || {};
    }

    try {
      // 1) Wywołaj DobierzPompe() aby dobrać pompy z zaktualizowanej pumpMatchingTable (48 zestawów)
      let pumpSelectionResult = null;
      try {
        const pumpGroups = DobierzPompe(result);
        const recommendedGroup = pumpGroups && pumpGroups[0];
        if (recommendedGroup) {
          // Mapuj wyniki z DobierzPompe() na format dla konfiguratora (hp, aio)
          // WC = HP Split (hp) - Seria K
          // ADC = HP All-in-One (aio) - Seria K
          const hpPump = recommendedGroup.wc || recommendedGroup.sdc || null;
          const aioPump = recommendedGroup.adc || null;

          pumpSelectionResult = {
            recommended_power_kw: recommendedGroup.power,
            pump_selection: {
              hp: hpPump
                ? {
                    model: hpPump.model,
                    power: hpPump.power,
                    series: hpPump.series,
                    type: 'split',
                    phase: hpPump.phase,
                    requires3F: hpPump.requires3F,
                  }
                : null,
              aio: aioPump
                ? {
                    model: aioPump.model,
                    power: aioPump.power,
                    series: aioPump.series,
                    type: 'all-in-one',
                    phase: aioPump.phase,
                    requires3F: aioPump.requires3F,
                  }
                : null,
              minPower: recommendedGroup.power,
              totalPower:
                parseFloat(result.max_heating_power || 0) + parseFloat(result.hot_water_power || 0),
            },
            // Kompatybilność wsteczna - stary format recommended_models
            recommended_models: [
              ...(hpPump
                ? [
                    {
                      name: hpPump.model,
                      type: hpPump.type,
                      power_kw: hpPump.power,
                    },
                  ]
                : []),
              ...(aioPump
                ? [
                    {
                      name: aioPump.model,
                      type: aioPump.type,
                      power_kw: aioPump.power,
                    },
                  ]
                : []),
            ],
          };

          // Logowanie usunięte dla produkcji
        }
      } catch (e) {
        // Błąd doboru pomp - cichy fallback
      }

      // ═══════════════════════════════════════════════════════════════════════════
      // 📊 LOGOWANIE WYNIKÓW Z SILNIKÓW (przed przekazaniem do konfiguratora)
      // ═══════════════════════════════════════════════════════════════════════════
      console.group('📊 WYNIKI Z SILNIKÓW — Przełączenie na konfigurator');
      console.log('═'.repeat(80));

      // 1. Zapotrzebowanie budynku (OZC)
      const designHeatLoss = result.max_heating_power || result.designHeatLoss_kW || null;
      if (designHeatLoss) {
        console.log('✅ Zapotrzebowanie budynku (OZC):', {
          'max_heating_power (kW)': designHeatLoss,
          'heated_area (m²)': result.heated_area || '—',
          'total_area (m²)': result.total_area || '—',
          'design_temp (°C)': result.design_outdoor_temperature || '—',
        });
      } else {
        console.warn('⚠️ BRAK WYNIKU: Zapotrzebowanie budynku nie zostało obliczone');
        console.warn('   Przyczyna: max_heating_power i designHeatLoss_kW są null/undefined');
      }

      // 2. Zarekomendowana pompa
      if (pumpSelectionResult && pumpSelectionResult.pump_selection) {
        const ps = pumpSelectionResult.pump_selection;
        console.log('✅ Zarekomendowana pompa:', {
          recommended_power_kw: pumpSelectionResult.recommended_power_kw || '—',
          'HP Split': ps.hp
            ? `${ps.hp.model} (${ps.hp.power} kW, ${ps.hp.series}, ${
                ps.hp.phase === 3 ? '3-fazowa' : '1-fazowa'
              })`
            : '—',
          'All-in-One': ps.aio
            ? `${ps.aio.model} (${ps.aio.power} kW, ${ps.aio.series}, ${
                ps.aio.phase === 3 ? '3-fazowa' : '1-fazowa'
              })`
            : '—',
          'minPower (kW)': ps.minPower || '—',
          'totalPower (kW)': ps.totalPower || '—',
        });
      } else {
        console.warn('⚠️ BRAK WYNIKU: Nie udało się dobrać pompy');
        console.warn('   Przyczyna: pumpSelectionResult jest null lub pump_selection jest puste');
        if (pumpSelectionResult) {
          console.warn('   Szczegóły pumpSelectionResult:', pumpSelectionResult);
        }
      }

      // 3. CWU (będzie obliczone w konfiguratorze, ale logujemy dane wejściowe)
      // Sprawdź zarówno formSnapshot jak i result (result może mieć zaktualizowaną wartość z API)
      const cwuFromForm =
        formSnapshot.include_hot_water === true || formSnapshot.include_hot_water === 'yes';
      const cwuFromResult = result.include_hot_water === true || result.include_hot_water === 'yes';
      const cwuEnabled = cwuFromForm || cwuFromResult;
      const cwuPower = result.hot_water_power || null;
      console.log('💧 Dane wejściowe dla CWU:', {
        'CWU włączone': cwuEnabled ? 'TAK' : 'NIE',
        'hot_water_power (kW)': cwuPower || '—',
        hot_water_persons: formSnapshot.hot_water_persons || '—',
        hot_water_usage: formSnapshot.hot_water_usage || '—',
        'formSnapshot.include_hot_water': formSnapshot.include_hot_water || '—',
        'result.include_hot_water':
          result.include_hot_water !== undefined ? result.include_hot_water : '—',
      });
      if (!cwuEnabled) {
        console.info('ℹ️ CWU wyłączone — zasobnik nie będzie dobierany');
      } else if (!cwuPower && !formSnapshot.hot_water_persons) {
        console.warn(
          '⚠️ CWU włączone, ale brak danych do doboru (hot_water_power i hot_water_persons są puste)'
        );
      }

      // 4. Bufor (będzie obliczony w konfiguratorze, ale logujemy dane wejściowe)
      console.log('🔧 Dane wejściowe dla bufora:', {
        heating_type: formSnapshot.heating_type || '—',
        'max_heating_power (kW)': designHeatLoss || '—',
        'heated_area (m²)': result.heated_area || '—',
      });
      if (!designHeatLoss) {
        console.warn('⚠️ BRAK WYNIKU: max_heating_power jest wymagane do doboru bufora');
      }

      console.log('═'.repeat(80));
      console.groupEnd();

      // 3) Zbuduj obiekt danych wejściowych dla konfiguratora – na bazie wyników + doboru pomp
      // Uwaga: result może nie zawierać include_hot_water (to jest pole z formularza, nie z API)
      // Więc używamy formSnapshot, ale sprawdzamy też czy w result jest (dla pewności)
      const includeHotWaterValue =
        result.include_hot_water !== undefined
          ? result.include_hot_water
          : formSnapshot.include_hot_water;
      const includeHotWaterBool =
        includeHotWaterValue === true ||
        includeHotWaterValue === 'yes' ||
        includeHotWaterValue === 1 ||
        includeHotWaterValue === '1';

      const configuratorInput = {
        ...result,
        climate_zone: formSnapshot.location_id || formSnapshot.climate_zone || null,
        construction_year: formSnapshot.construction_year || null,
        insulation: formSnapshot.wall_size || null,
        heating_type: formSnapshot.heating_type || null,
        installation_type: formSnapshot.heating_type || null,
        source_type: formSnapshot.source_type || null,
        hot_water_persons: formSnapshot.hot_water_persons || null,
        hot_water_usage: formSnapshot.hot_water_usage || null,
        include_hot_water: includeHotWaterBool,
        has_three_phase: !!formSnapshot.has_three_phase,
        building_type: formSnapshot.building_type || null,
        // ═══════════════════════════════════════════════════════════════════════════
        // OZC SINGLE SOURCE OF TRUTH — DO NOT DERIVE POWER ELSEWHERE
        // ═══════════════════════════════════════════════════════════════════════════
        // ARCHITECTURAL: recommended_power_kw MUST equal max_heating_power from OZC
        // max_heating_power comes from OZCEngine.designHeatLoss_kW (canonical)
        // Fallback chain is for backward compatibility only
        // ═══════════════════════════════════════════════════════════════════════════
        recommended_power_kw:
          result.max_heating_power || // PRIMARY: OZC canonical output
          pumpSelectionResult?.recommended_power_kw || // FALLBACK: pump selection
          window.lastCalculationResult?.recommended_power_kw || // FALLBACK: cached
          null,
        recommended_models:
          pumpSelectionResult?.recommended_models ||
          window.lastCalculationResult?.recommended_models ||
          [],
        // NOWY FORMAT: przekaż wyniki doboru pomp do konfiguratora
        pump_selection: pumpSelectionResult?.pump_selection || null,
      };

      window.lastCalculationResult = configuratorInput;

      // ═══════════════════════════════════════════════════════════════════════════
      // APP STATE PERSISTENCE — zapisz wynik obliczeń
      // ═══════════════════════════════════════════════════════════════════════════
      if (typeof window.updateAppState === 'function') {
        window.updateAppState({ lastCalculationResult: configuratorInput });
      }

      // === INICJALIZACJA KONFIGURATORA (configurator-unified.js) ===
      // ✅ NOWY KONTRAKT: window.HP_CONFIGURATOR.init(root, options)
      const configuratorApp = document.getElementById('configurator-app');
      if (!configuratorApp) {
        console.error('❌ BRAK ELEMENTU: #configurator-app nie został znaleziony w DOM');
        console.error('   Przyczyna: HTML konfiguratora nie został wstrzyknięty poprawnie');
        console.error('   Rozwiązanie: Sprawdź czy konfigurator.html został załadowany');
      } else {
        // Wywołaj inicjalizację przez nowy kontrakt
        if (
          typeof window.HP_CONFIGURATOR === 'undefined' ||
          typeof window.HP_CONFIGURATOR.init !== 'function'
        ) {
          console.error('❌ BRAK FUNKCJI: window.HP_CONFIGURATOR.init nie jest dostępna');
          console.error('   Przyczyna: configurator-unified.js nie został załadowany');
          console.error('   Rozwiązanie: Sprawdź kolejność ładowania skryptów');
          setTimeout(() => {
            if (
              typeof window.HP_CONFIGURATOR !== 'undefined' &&
              typeof window.HP_CONFIGURATOR.init === 'function'
            ) {
              console.log('✅ Funkcja HP_CONFIGURATOR.init dostępna po opóźnieniu');
              window.HP_CONFIGURATOR.init(configuratorApp, {
                building: configuratorInput,
                system: {
                  heatPumpModel: configuratorInput.pump_selection?.hp?.model || null,
                  mode: 'mono',
                },
                defaults: {
                  buffer: 'auto',
                  cwu: 'standard',
                },
                callbacks: {
                  onChange: configState => {
                    console.log('[Configurator] State changed:', configState);
                  },
                  onReady: () => {
                    console.log('[Configurator] Ready');
                  },
                },
                rootElement: configuratorApp,
              });
            }
          }, 500);
        } else {
          const initResult = window.HP_CONFIGURATOR.init(configuratorApp, {
            building: configuratorInput,
            system: {
              heatPumpModel: configuratorInput.pump_selection?.hp?.model || null,
              mode: 'mono',
            },
            defaults: {
              buffer: 'auto',
              cwu: 'standard',
            },
            callbacks: {
              onChange: configState => {
                console.log('[Configurator] State changed:', configState);
              },
              onReady: () => {
                console.log('[Configurator] Ready');
              },
            },
            rootElement: configuratorApp,
          });
          if (!initResult) {
            console.error('❌ INICJALIZACJA: HP_CONFIGURATOR.init() zwróciła false');
            console.error('   Przyczyna: Konfigurator nie mógł się zainicjalizować');
          } else {
            console.log('✅ Konfigurator zainicjalizowany — dane przekazane przez kontrakt');
          }
        }
      }
    } catch (e) {
      console.error('❌ BŁĄD: Nie udało się przekazać danych do konfiguratora maszynowni');
      console.error('   Błąd:', e);
      console.error('   Stack:', e.stack);
    }

    // === ONBOARDING MODAL DLA KONFIGURATORA ===
    // Modal konfiguratora wyłączony - zastąpiony animacją typewriter w WorkflowController
    // WorkflowController obsługuje finalizację i pokazanie konfiguratora

    // === AKTUALIZACJA KOMENTARZA SYSTEMOWEGO ===
    // Pobierz dane z formularza, jeśli dostępne
    let formDataForComment = formSnapshot;
    if (
      !formDataForComment &&
      window.formEngine &&
      typeof window.formEngine.getState === 'function'
    ) {
      formDataForComment = window.formEngine.getState() || {};
    }
    updateSystemComment(result, formDataForComment);
  }

  /**
   * Aktualizuje komentarz systemowy na podstawie wyników obliczeń
   * @param {Object} result - Wyniki obliczeń z API
   * @param {Object} formSnapshot - Dane z formularza (opcjonalne)
   */
  function updateSystemComment(result, formSnapshot = {}) {
    const commentElement = document.getElementById('system-comment-text');
    if (!commentElement) return;

    // Pobierz dane z formularza, jeśli dostępne
    let formData = formSnapshot;
    if (!formData && window.formEngine && typeof window.formEngine.getState === 'function') {
      formData = window.formEngine.getState() || {};
    }

    // Wykryj scenariusz na podstawie danych
    const constructionYear = formData.construction_year || null;
    const hasExternalIsolation =
      formData.has_external_isolation === 'yes' || formData.has_external_isolation === true;
    const hasTopIsolation = formData.top_isolation === 'yes' || formData.top_isolation === true;
    const hasBottomIsolation =
      formData.bottom_isolation === 'yes' || formData.bottom_isolation === true;
    const buildingType = formData.building_type || null;

    // Sprawdź czy są podstawowe dane
    const hasBasicData = result.max_heating_power && result.total_area;

    // Sprawdź czy są niespójności (stary budynek bez izolacji)
    const isOldBuilding = constructionYear && parseInt(constructionYear) < 2015;
    const hasPoorIsolation = !hasExternalIsolation && !hasTopIsolation && !hasBottomIsolation;
    const isHighRisk = isOldBuilding && hasPoorIsolation;

    // SCENARIUSZ C - niespójność danych / ryzyko
    if (!hasBasicData || isHighRisk || (isOldBuilding && !hasExternalIsolation)) {
      commentElement.textContent =
        'Część danych ma charakter orientacyjny. Rekomendujemy weryfikację podczas audytu technicznego przed montażem.';
      return;
    }

    // SCENARIUSZ B - podwyższone zapotrzebowanie / niepewność
    if (isOldBuilding || hasPoorIsolation || !hasExternalIsolation) {
      commentElement.textContent =
        'Parametry budynku wskazują na podwyższone zapotrzebowanie na ciepło. Zaproponowana konfiguracja uwzględnia ten fakt, aby zapewnić stabilną pracę systemu.';
      return;
    }

    // SCENARIUSZ A - wszystko spójne (domyślny)
    commentElement.textContent =
      'Parametry budynku są spójne i pozwalają na bezpieczną pracę pompy ciepła w oparciu o wprowadzone dane. ' +
      'System nie wykrył ryzyk przewymiarowania ani niedoboru mocy.';
  }

  function resetResultsSection() {
    const loadingElements = document.querySelectorAll('[id^="r-"]');
    loadingElements.forEach(el => {
      if (el) el.textContent = '...';
    });

    // Logowanie usunięte dla produkcji
  }

  function displayRecommendedPumps(pumps, result) {
    const zone = document.getElementById('pump-recommendation-zone');
    if (!zone || !Array.isArray(pumps)) return;

    // Funkcja tworząca pojedynczą kartę pompy
    function createPumpCard(pump, badgeClass) {
      const typeLabel =
        pump.type === 'split' ? 'SPLIT (zewn. + wewn.)' : 'ALL-IN-ONE (1 jednostka)';
      const typeClass = pump.type === 'split' ? 'split' : 'all-in-one';

      const imagePath =
        pump.type === 'split'
          ? ((window.HEATPUMP_CONFIG && window.HEATPUMP_CONFIG.uploadsUrl)
              ? window.HEATPUMP_CONFIG.uploadsUrl + 'split-k.png'
              : 'https://topinstal.com.pl/wp-content/uploads/2024/split-k.png')
          : ((window.HEATPUMP_CONFIG && window.HEATPUMP_CONFIG.uploadsUrl)
              ? window.HEATPUMP_CONFIG.uploadsUrl + 'aio-k.png'
              : 'https://topinstal.com.pl/wp-content/uploads/2024/aio-k.png');

      const card = document.createElement('div');
      card.className = `pump-recommendation-card recommended-${badgeClass} animate-fade-in animate-hover-lift`;
      card.setAttribute('data-pump', pump.model);

      card.innerHTML = `
                <div class="pump-image-container">
                    <img src="${imagePath}" alt="Pompa ciepła ${pump.type}" class="pump-image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="pump-image-fallback" style="display:none; align-items:center; justify-content:center; height:100%; color:#6B7280; font-family:'Titillium Web', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size:clamp(12px, 2.5vw, 14px); font-weight:500;">
                        📷 Zdjęcie pompy ${pump.type.toUpperCase()}
                    </div>
                    <div class="pump-image-overlay">${
                      pump.type === 'split' ? 'SPLIT' : 'ALL-IN-ONE'
                    }</div>
                </div>
                <div class="card-badge ${badgeClass}">${
        pump.type === 'split' ? 'REKOMENDOWANA' : 'ALTERNATYWA'
      }</div>
                <div class="card-series">PANASONIC SERIA K</div>
                <div class="card-type-badge ${typeClass}">${typeLabel}</div>
                <div class="card-model">${pump.model}</div>
                <div class="card-power">${pump.power} kW</div>
                <div class="card-price">${new Intl.NumberFormat('pl-PL').format(
                  pump.price
                )} zł</div>
                <div class="card-features">
                    <div class="feature">Moc grzewcza: ${pump.power} kW</div>
                    <div class="feature">COP: 4.2 (wysoka efektywność)</div>
                    <div class="feature">Klasa energetyczna: A+++</div>
                    <div class="feature">Temperatura pracy: -25°C do +35°C</div>
                    <div class="feature">Cicha praca: < 35 dB(A)</div>
                </div>
                <button class="select-pump-btn configure-btn" data-pump="${
                  pump.model
                }">WYBIERZ I KONFIGURUJ</button>
            `;

      const button = card.querySelector('.configure-btn');
      button.addEventListener('click', function () {
        const selectedPump = this.getAttribute('data-pump');
        const configData = {
          from_calculator: true,
          heated_area: result.heated_area,
          max_heating_power: result.max_heating_power,
          bivalent_power: result.bivalent_point_heating_power,
          hot_water_power: result.hot_water_power || 0,
          selected_pump: selectedPump,
          annual_energy_consumption: result.annual_energy_consumption,
          design_outdoor_temperature: result.design_outdoor_temperature,
        };
        try {
          sessionStorage.setItem('config_data', JSON.stringify(configData));
        } catch (e) {
          console.warn('[ResultsRenderer] Nie można zapisać config_data w sessionStorage:', e);
        }
        ErrorHandler.showToast(`Wybrano pompę: ${selectedPump}`, 'success');
      });

      return card;
    }

    // Funkcja renderowania kart pomp w sliderze
    function renderPumpCards(pumps, containerId, sliderTitle) {
      const container = document.getElementById(containerId);
      if (!container) return;

      // Sprawdź czy są pompy do wyświetlenia
      if (!pumps || pumps.length === 0) {
        container.style.display = 'none';
        return;
      }

      container.style.display = 'block';

      // Znajdź slider header i ustaw tytuł
      const sliderHeader = container.querySelector('.slider-header h3');
      if (sliderHeader) {
        sliderHeader.textContent = sliderTitle;
      }

      // Znajdź kontener na karty
      const cardsContainer = container.querySelector('.pump-cards-slider');
      if (!cardsContainer) return;

      // Wyczyść istniejące karty
      cardsContainer.innerHTML = '';

      // Utwórz slider track
      const sliderTrack = document.createElement('div');
      sliderTrack.className = 'slider-track';

      // Renderuj karty pomp
      pumps.forEach((pump, index) => {
        const pumpCard = createPumpCard(pump, index === 0 ? 'recommended' : 'alternative');
        sliderTrack.appendChild(pumpCard);
      });

      cardsContainer.appendChild(sliderTrack);

      // Dodaj nawigację slidera jeśli jest więcej niż jedna karta
      if (pumps.length > 1) {
        addSliderNavigation(cardsContainer, pumps.length);
      }

      // Inicjalizuj slider
      initializeSlider(cardsContainer, pumps.length);
    }

    // Funkcja dodawania nawigacji slidera
    function addSliderNavigation(container, totalSlides) {
      const navigation = document.createElement('div');
      navigation.className = 'slider-navigation';

      // Przycisk poprzedni
      const prevBtn = document.createElement('button');
      prevBtn.className = 'slider-btn slider-prev';
      prevBtn.innerHTML = '‹';
      prevBtn.setAttribute('aria-label', 'Poprzednia pompa');

      // Dots (kropki nawigacyjne)
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'slider-dots';

      for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('data-slide', i);
        dot.setAttribute('aria-label', `Przejdź do pompy ${i + 1}`);
        dotsContainer.appendChild(dot);
      }

      // Przycisk następny
      const nextBtn = document.createElement('button');
      nextBtn.className = 'slider-btn slider-next';
      nextBtn.innerHTML = '›';
      nextBtn.setAttribute('aria-label', 'Następna pompa');

      navigation.appendChild(prevBtn);
      navigation.appendChild(dotsContainer);
      navigation.appendChild(nextBtn);

      container.appendChild(navigation);
    }

    // Funkcja inicjalizacji slidera
    function initializeSlider(container, totalSlides) {
      if (totalSlides <= 1) return;

      const track = container.querySelector('.slider-track');
      const prevBtn = container.querySelector('.slider-prev');
      const nextBtn = container.querySelector('.slider-next');
      const dots = container.querySelectorAll('.slider-dot');

      let currentSlide = 0;

      // Funkcja aktualizacji slidera
      function updateSlider(slideIndex) {
        currentSlide = slideIndex;

        // Animacja przesunięcia
        track.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Aktualizacja dots
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentSlide);
        });

        // Aktualizacja przycisków
        prevBtn.disabled = currentSlide === 0;
        nextBtn.disabled = currentSlide === totalSlides - 1;

        // Aktualizacja aria-labels
        prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
        nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.5' : '1';
      }

      // Event listenery dla przycisków
      prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
          updateSlider(currentSlide - 1);
        }
      });

      nextBtn.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
          updateSlider(currentSlide + 1);
        }
      });

      // Event listenery dla dots
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          updateSlider(index);
        });
      });

      // Obsługa klawiatury
      container.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft' && currentSlide > 0) {
          updateSlider(currentSlide - 1);
        } else if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
          updateSlider(currentSlide + 1);
        }
      });

      // Inicjalna aktualizacja
      updateSlider(0);

      // Auto-play (opcjonalnie)
      if (totalSlides > 1) {
        let autoplayInterval = setInterval(() => {
          const nextSlide = (currentSlide + 1) % totalSlides;
          updateSlider(nextSlide);
        }, 5000); // 5 sekund

        // Zatrzymaj autoplay przy hover
        container.addEventListener('mouseenter', () => {
          clearInterval(autoplayInterval);
        });

        container.addEventListener('mouseleave', () => {
          autoplayInterval = setInterval(() => {
            const nextSlide = (currentSlide + 1) % totalSlides;
            updateSlider(nextSlide);
          }, 5000);
        });
      }
    }

    // TYLKO SLIDERY - bez dodatkowych kart lub elementów
    zone.innerHTML = `
            <div class="pump-slider-wrapper">
              <div class="slider-header">
                <h3>💎 Rekomendowane pompy ciepła PANASONIC</h3>
                <p>Zapotrzebowanie całkowite: <strong>${(
                  parseFloat(result.max_heating_power) + parseFloat(result.hot_water_power || 0)
                ).toFixed(1)} kW</strong></p>
              </div>
              <div class="pump-cards-slider">

              </div>
            </div>
        `;

    const totalPowerDemand = (
      parseFloat(result.max_heating_power) + parseFloat(result.hot_water_power || 0)
    ).toFixed(1);
    renderPumpCards(
      pumps,
      'pump-recommendation-zone',
      `💎 Rekomendowane pompy ciepła PANASONIC (zapotrzebowanie: ${totalPowerDemand} kW)`
    );

    const cards = zone.querySelectorAll('.pump-recommendation-card');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.15}s`;
    });
  }

  function DobierzPompe(result) {
    // ARCHITECTURAL: Pompy są dobierane na podstawie mocy CO (max_heating_power), nie totalPower (CO + CWU)
    // This ensures consistency with configurator which uses only max_heating_power for pump selection
    const heatingPower = parseFloat(result.max_heating_power || 0);

    // Walidacja mocy
    if (isNaN(heatingPower) || heatingPower <= 0) {
      // Nieprawidłowa moc grzewcza - cichy fallback
      return [];
    }

    // Logowanie usunięte dla produkcji

    // Użyj pumpMatchingTable do doboru pomp na podstawie zakresów min/max
    const heatingType = result.heating_type || 'mixed';
    const normalizedType =
      heatingType === 'radiators'
        ? 'radiators'
        : heatingType === 'underfloor' || heatingType === 'surface'
        ? 'surface'
        : 'mixed';

    // Logowanie usunięte dla produkcji

    const hasThreePhase = result.has_three_phase || false;

    // KRYTYCZNA POPRAWKA: Filtruj pompy i sortuj po mocy ROSNĄCO, aby wybrać najmniejszą pasującą
    const matching = Object.entries(pumpMatchingTable)
      .filter(([model, data]) => {
        // Sprawdź zakres mocy dla danego typu instalacji
        const min = data.min[normalizedType] || data.min.mixed;
        const max = data.max[normalizedType] || data.max.mixed;
        const powerMatch = heatingPower >= min && heatingPower <= max;

        // Sprawdź wymagania zasilania
        const phaseMatch = !data.requires3F || hasThreePhase;

        if (powerMatch && phaseMatch) {
          // Logowanie usunięte dla produkcji
        }

        return powerMatch && phaseMatch;
      })
      .map(([model, data]) => {
        // Użyj dynamicznego URL z konfiguracji WordPress
        const imgUrl = window.HEATPUMP_CONFIG?.imgUrl || '../img';
        const image = data.type === 'split' ? `${imgUrl}/split-k.png` : `${imgUrl}/allinone.png`;
        return {
          model: model,
          power: data.power,
          series: data.series,
          type: data.type,
          image: image,
          phase: data.phase,
          requires3F: data.requires3F,
        };
      })
      // WAŻNE: Sortuj po mocy ROSNĄCO, aby wybrać najmniejszą pasującą pompę
      .sort((a, b) => a.power - b.power);

    // Logowanie usunięte dla produkcji

    // Jeśli nie znaleziono, wybierz najmniejszą pompę która ma max >= heatingPower
    if (matching.length === 0) {
      // Brak dopasowanych pomp w zakresie, szukam najmniejszej pompy z max >= heatingPower
      const allPumpsFlat = Object.keys(pumpMatchingTable)
        .map(model => {
          const data = pumpMatchingTable[model];
          const min = data.min[normalizedType] || data.min.mixed;
          const max = data.max[normalizedType] || data.max.mixed;
          const phaseMatch = !data.requires3F || hasThreePhase;

          // Wybierz pompy które mogą pokryć zapotrzebowanie (max >= heatingPower)
          if (max >= heatingPower && phaseMatch) {
            // Użyj dynamicznego URL z konfiguracji WordPress
            const imgUrl = window.HEATPUMP_CONFIG?.imgUrl || '../img';
            return {
              model: model,
              power: data.power,
              series: data.series,
              type: data.type,
              image: data.type === 'split' ? `${imgUrl}/split-k.png` : `${imgUrl}/allinone.png`,
              phase: data.phase,
              requires3F: data.requires3F,
              max: max,
            };
          }
          return null;
        })
        .filter(p => p !== null)
        .sort((a, b) => a.power - b.power); // Sortuj po mocy rosnąco

      if (allPumpsFlat.length > 0) {
        const smallest = allPumpsFlat[0];
        // Wybrano najmniejszą pompę pokrywającą zapotrzebowanie
        matching.push(smallest);
      } else {
        // Nie znaleziono pompy - cichy fallback
      }
    }

    // Grupuj pompy po mocy i typie (split/all-in-one)
    // Wszystkie pompy mają series: 'K', więc rozróżniamy po typie
    const grouped = {};
    matching.forEach(pump => {
      if (!grouped[pump.power]) grouped[pump.power] = {};
      // Rozróżnij po typie: split (WC) vs all-in-one (ADC)
      if (pump.type === 'split') {
        grouped[pump.power]['wc'] = pump;
        grouped[pump.power]['sdc'] = pump; // Kompatybilność wsteczna
      } else if (pump.type === 'all-in-one') {
        grouped[pump.power]['adc'] = pump;
      }
    });

    const pumpGroups = Object.entries(grouped)
      .map(([power, typeMap]) => ({
        power: Number(power),
        sdc: typeMap.sdc || typeMap.wc || null, // Kompatybilność wsteczna
        adc: typeMap.adc || null,
        wc: typeMap.wc || null, // HP Split
      }))
      .sort((a, b) => a.power - b.power);

    // Logowanie usunięte dla produkcji
    return pumpGroups;
  }

  function renderHaierStyleSliders(pumpGroups, container) {
    if (!container) {
      // Kontener pump-recommendation-zone nie istnieje - cichy fallback
      return;
    }

    if (!Array.isArray(pumpGroups)) {
      // pumpGroups nie jest tablicą - cichy fallback
      return;
    }

    if (pumpGroups.length === 0) {
      // Brak grup pomp do wyświetlenia - cichy fallback
      container.innerHTML =
        '<p class="micro-note" style="text-align: center; color: #666;">Nie znaleziono dopasowanych pomp. Skontaktuj się z nami w celu indywidualnego doboru.</p>';
      return;
    }

    // Funkcja pomocnicza do aktualizacji tytułu na podstawie faktycznie wyświetlanych pomp
    function updatePowerTitleFromRenderedPumps(container, titleId, titlePrefix) {
      const titleElement = document.getElementById(titleId);
      if (!titleElement || !container) return;

      // Znajdź wszystkie karty pomp w kontenerze
      const pumpCards = container.querySelectorAll('.heat-pump-card[data-power]');
      if (pumpCards.length === 0) return;

      // Wyciągnij moc z pierwszej pompy (wszystkie pompy w grupie mają tę samą moc)
      const firstCard = pumpCards[0];
      const power = firstCard.getAttribute('data-power');

      if (power) {
        titleElement.textContent = `${titlePrefix}: ${power} kW`;
      }
    }

    // Wyczyść kontener główny
    container.innerHTML = '';

    // Weź pierwszą grupę (rekomendowaną moc)
    const recommendedGroup = pumpGroups[0];
    if (!recommendedGroup) {
      // Brak rekomendowanej grupy pomp - cichy fallback
      container.innerHTML =
        '<p class="micro-note" style="text-align: center; color: #666;">Nie znaleziono rekomendowanej pompy. Skontaktuj się z nami w celu indywidualnego doboru.</p>';
      return;
    }

    // Zapisz rekomendacje do globalnych wyników, aby PDF mógł je odczytać
    try {
      const recModels = [];
      if (recommendedGroup.sdc) {
        recModels.push({
          name: recommendedGroup.sdc.model,
          type: recommendedGroup.sdc.type,
          power_kw: recommendedGroup.sdc.power,
        });
      }
      if (recommendedGroup.adc) {
        recModels.push({
          name: recommendedGroup.adc.model,
          type: recommendedGroup.adc.type,
          power_kw: recommendedGroup.adc.power,
        });
      }
      const updatedResult = Object.assign({}, window.lastCalculationResult || {}, {
        recommended_power_kw: recommendedGroup.power,
        recommended_models: recModels,
      });
      window.lastCalculationResult = updatedResult;
      if (typeof window.updateAppState === 'function') {
        window.updateAppState({ lastCalculationResult: updatedResult });
      }
    } catch (e) {
      // Nie udało się zapisać rekomendowanych modeli do PDF - cichy fallback
    }

    // Generuj karty pomp dla rekomendowanej mocy
    if (recommendedGroup.sdc) {
      const sdcCard = createMinimalCard(recommendedGroup.sdc);
      container.appendChild(sdcCard);
    }
    if (recommendedGroup.adc) {
      const adcCard = createMinimalCard(recommendedGroup.adc);
      container.appendChild(adcCard);
    }

    // Aktualizuj tytuł mocy na podstawie faktycznie wyświetlanych pomp
    updatePowerTitleFromRenderedPumps(container, 'pump-power-title', 'Rekomendowana moc');

    // Sprawdź czy istnieje alternatywna moc
    const alternativeGroup = pumpGroups[1];
    const alternativeSection = document.getElementById('alternative-power-section');
    const alternativeContainer = document.getElementById('alternative-pump-zone');
    const alternativeTitle = document.getElementById('alternative-power-title');

    if (alternativeGroup && alternativeSection && alternativeContainer) {
      // Pokaż sekcję alternatywną
      alternativeSection.style.display = 'block';

      // Wyczyść kontener
      alternativeContainer.innerHTML = '';

      // Generuj karty pomp dla alternatywnej mocy
      if (alternativeGroup.sdc) {
        const sdcCard = createMinimalCard(alternativeGroup.sdc);
        alternativeContainer.appendChild(sdcCard);
      }
      if (alternativeGroup.adc) {
        const adcCard = createMinimalCard(alternativeGroup.adc);
        alternativeContainer.appendChild(adcCard);
      }

      // Aktualizuj tytuł alternatywnej mocy na podstawie faktycznie wyświetlanych pomp
      updatePowerTitleFromRenderedPumps(
        alternativeContainer,
        'alternative-power-title',
        'Alternatywna moc'
      );
    } else if (alternativeSection) {
      // Ukryj sekcję jeśli nie ma alternatywnej mocy
      alternativeSection.style.display = 'none';
    }

    function createMinimalCard(pump) {
      const label = pump.type === 'split' ? 'Split' : 'All-in-One';
      // Użyj dynamicznego URL z konfiguracji WordPress
      const imgUrl = window.HEATPUMP_CONFIG?.imgUrl || '../img';
      const imgPath = pump.type === 'split' ? `${imgUrl}/sdc-k.png` : `${imgUrl}/adc-k.png`;
      const seriesName = 'Panasonic Seria K';
      const typeDesc =
        pump.type === 'split'
          ? 'Split (jednostka zewnętrzna + wewnętrzna)'
          : 'All-in-One (kompaktowa)';

      const card = document.createElement('div');
      card.className = 'heat-pump-card haier-style';
      card.setAttribute('data-pump', pump.model);
      card.setAttribute('data-power', pump.power);

      card.innerHTML = `
                <img src="${imgPath}" alt="Pompa ${label}" class="clean-pump-image">
                <div class="pump-model-name">${seriesName} ${pump.power} kW</div>
                <div class="pump-specs">
                    Model: ${pump.model}<br>
                    Typ: ${typeDesc}<br>
                    Moc: ${pump.power} kW
                </div>
            `;

      return card;
    }
  }

  // Funkcje obsługi przycisków
  let customerDataCollected = false;

  function showPDFContactForm() {
    const pdfFormContainer = document.getElementById('pdf-contact-form');
    if (pdfFormContainer) {
      pdfFormContainer.style.display = 'block';
      pdfFormContainer.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function hidePDFContactForm() {
    const pdfFormContainer = document.getElementById('pdf-contact-form');
    if (pdfFormContainer) {
      pdfFormContainer.style.display = 'none';
    }
  }

  function collectCustomerData() {
    const email = document.getElementById('customer-email').value.trim();
    const postalCode = document.getElementById('customer-postal-code').value.trim();

    if (!email || !postalCode) {
      ErrorHandler.showFormNotification(
        'Uzupełnij dane kontaktowe',
        'Email i kod pocztowy są wymagane do wysłania oferty.',
        [],
        'warning'
      );
      return false;
    }

    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const emailField = document.getElementById('email');
      if (emailField) {
        ErrorHandler.showFieldError(
          emailField,
          'Nieprawidłowy format adresu email',
          'Wprowadź poprawny adres (np. jan@example.com)'
        );
      }
      return false;
    }

    // Walidacja kodu pocztowego (format XX-XXX)
    const postalRegex = /^\d{2}-\d{3}$/;
    if (!postalRegex.test(postalCode)) {
      const postalField = document.getElementById('customer-postal-code');
      if (postalField) {
        ErrorHandler.showFieldError(
          postalField,
          'Nieprawidłowy format kodu pocztowego',
          'Użyj formatu XX-XXX (np. 00-001)'
        );
      }
      return false;
    }

      // Zapisz dane klienta
      const customerData = {
        email: email,
        postalCode: postalCode,
        timestamp: new Date().toISOString(),
        calculationData: window.lastCalcResult || {},
      };

      // Zapisz tylko tymczasowo w sessionStorage (1 rekord) - brak trwałego cache'u
      try {
        sessionStorage.setItem('heatpump_customer', JSON.stringify(customerData));
      } catch (e) {
        console.warn('[ResultsRenderer] Nie można zapisać danych klienta w sessionStorage:', e);
      }

      customerDataCollected = true;
    // Logowanie usunięte dla produkcji

    // Wyślij email z raportem
    sendPDFReportEmail(customerData);

    return true;
  }

  function sendPDFReportEmail(customerData) {
    // Implementacja wysyłania emaila z raportem PDF
    const reportData = {
      email: customerData.email,
      postalCode: customerData.postalCode,
      calculationResults: customerData.calculationData,
      reportType: 'full_energy_report',
    };

    // Tutaj można dodać wywołanie do API wysyłającego email
    // Logowanie usunięte dla produkcji

    // Pokaż komunikat sukcesu
    showSuccessMessage(customerData.email);
  }

  function showSuccessMessage(email) {
    const successDiv = document.createElement('div');
    successDiv.className = 'pdf-success-message';
    successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h4>Raport został wysłany!</h4>
                <p>Pełny raport energetyczny został wysłany na adres:<br><strong>${email}</strong></p>
                <p>Sprawdź swoją skrzynkę odbiorczą (również folder spam).</p>
            </div>
        `;

    const actionsContainer = document.querySelector('.results-actions');
    if (actionsContainer) {
      actionsContainer.appendChild(successDiv);
      successDiv.scrollIntoView({ behavior: 'smooth' });

      // Ukryj formularz kontaktowy
      hidePDFContactForm();

      // Usuń komunikat po 10 sekundach
      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.remove();
        }
      }, 10000);
    }
  }

  function handleEmailSend() {
    // Stara funkcja - pozostawiona dla kompatybilności
    // Funkcja handleEmailSend została zastąpiona
  }

  // === FUNKCJE POMOCNICZE DLA DANYCH ROZSZERZONYCH ===

  function displayEnergyLosses(losses) {
    const container = document.getElementById('energy-losses-container');
    if (!container) return;

    const sortedLosses = [...losses].sort((a, b) => b.percent - a.percent);

    let html = '<table class="results-table results-table--compact">';
    html += `
            <thead>
                <tr>
                    <th>Przegroda</th>
                    <th>Udział strat</th>
                </tr>
            </thead>
            <tbody>
        `;

    sortedLosses.forEach(loss => {
      html += `
                <tr>
                    <td class="results-table__label">${loss.label}</td>
                    <td>${loss.percent.toFixed(1)}%</td>
                </tr>
            `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function displayImprovements(improvements) {
    const container = document.getElementById('improvements-container');
    if (!container) return;

    const sortedImprovements = [...improvements].sort((a, b) => b.energy_saved - a.energy_saved);

    // Responsive width dla kolumny Nr na mobile
    const isMobile = window.matchMedia('(max-width: 480px)').matches;
    const nrWidth = isMobile ? '50px' : '40px';

    let html = '<table class="results-table results-table--compact">';
    html += `
            <thead>
                <tr>
                    <th style="width:${nrWidth}; text-align:right;">Nr</th>
                    <th>Modernizacja</th>
                    <th>Oszczędność</th>
                </tr>
            </thead>
            <tbody>
        `;

    sortedImprovements.forEach((improvement, index) => {
      html += `
                <tr>
                    <td class="results-table__num">${index + 1}</td>
                    <td class="results-table__label">${improvement.label}</td>
                    <td>${improvement.energy_saved.toFixed(1)}%</td>
                </tr>
            `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function displayHeatingCosts(costs) {
    const container = document.getElementById('heating-costs-container');
    if (!container) return;

    // 1) Znormalizuj rekordy (akceptujemy różne nazwy pól)
    const normalized = (Array.isArray(costs) ? costs : [])
      .map(c => ({
        label: c.label || c.variant || c.name || 'Wariant',
        detail: c.detail || '',
        efficiency: c.efficiency != null ? c.efficiency : c.cop != null ? c.cop : '',
        cost: c.cost != null ? c.cost : c.annual_cost_pln != null ? c.annual_cost_pln : null,
      }))
      .filter(c => c.cost != null);

    // 2) Usuń pompę gruntową (case-insensitive)
    const withoutGround = normalized.filter(c => !/grunt/i.test(c.label));

    // 3) Znajdź powietrzną – zawsze na pierwszej pozycji i z wyróżnieniem
    const airIndex = withoutGround.findIndex(c => /powietrzn/i.test(c.label));
    let ordered = [...withoutGround].sort((a, b) => a.cost - b.cost);
    if (airIndex >= 0) {
      const air = withoutGround[airIndex];
      ordered = [air, ...ordered.filter(i => i !== air)];
    }

    // 4) Ogranicz do maks. 5 pozycji, ale z zachowaniem powietrznej na 1. miejscu
    const top = ordered.slice(0, 5);

    // 5) Render – prosta tabela inżynierska
    let html = '<table class="results-table">';
    html += `
            <thead>
                <tr>
                    <th>Wariant ogrzewania</th>
                    <th>Sprawność</th>
                    <th>Roczny koszt</th>
                </tr>
            </thead>
            <tbody>
        `;

    top.forEach((item, index) => {
      const isAir = /powietrzn/i.test(item.label);
      const rowClass = isAir ? 'results-table__highlight' : '';
      const detail = item.detail
        ? `<span class="results-table__secondary">${item.detail}</span>`
        : '';
      const badge = isAir
        ? '<span class="results-table__secondary">Najbardziej opłacalne</span>'
        : '';

      html += `
                <tr class="${rowClass}">
                    <td>
                        <span class="results-table__label">${item.label}</span>
                        ${detail}
                        ${badge}
                    </td>
                    <td>${item.efficiency !== '' ? item.efficiency + '%' : '—'}</td>
                    <td>${formatCurrency(item.cost)}</td>
                </tr>
            `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  function displayBivalentPoints(bivalentPoints) {
    const container = document.getElementById('bivalent-points-container');
    if (!container) return;

    // Wybierz tylko temperatury -5, -7, -9, -11
    const keyPoints = bivalentPoints.parallel
      ? bivalentPoints.parallel.filter(p => [-5, -7, -9, -11].includes(p.temperature))
      : bivalentPoints
      ? bivalentPoints.filter(p => [-5, -7, -9, -11].includes(p.temperature))
      : [];

    if (keyPoints.length === 0) return;

    let html = '<table class="results-table results-table--compact">';
    html += `
            <thead>
                <tr>
                    <th>Temperatura zewnętrzna</th>
                    <th>Potrzebna moc</th>
                </tr>
            </thead>
            <tbody>
        `;

    keyPoints.forEach(point => {
      html += `
                <tr>
                    <td>${point.temperature}°C</td>
                    <td>${(point.power / 1000).toFixed(1)} kW</td>
                </tr>
            `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  }

  // Funkcje pomocnicze
  function getColorForLoss(percent) {
    if (percent > 40) return '#c23e32';
    if (percent > 20) return '#b78a2f';
    if (percent > 10) return '#d9b84c';
    return '#d4a574';
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function goBackToForm() {
    // ═══════════════════════════════════════════════════════════════════════════
    // POWRÓT DO FORMULARZA — przejdź do pierwszej zakładki (nie ostatniej!)
    // ═══════════════════════════════════════════════════════════════════════════
    if (typeof showTab === 'function') {
      // Przejdź do pierwszej zakładki (0), nie ostatniej (5)
      showTab(0);

      // Scroll do góry formularza
      setTimeout(() => {
        const firstSection = document.querySelector('#top-instal-calc .section[data-tab="0"]');
        if (firstSection) {
          firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      // Fallback - przewiń do góry strony
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const targetScrollTop = Math.max(0, currentScrollTop / 2);

      window.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    }
  }

  function startNewCalculation() {
    // ═══════════════════════════════════════════════════════════════════════════
    // NOWE OBLICZENIE — resetuj stan i przejdź do pierwszej zakładki
    // ═══════════════════════════════════════════════════════════════════════════
    // Resetuj flagę animacji completion (użytkownik zaczyna od nowa)
    if (typeof window.updateAppState === 'function') {
      window.updateAppState({
        completionAnimationShown: false,
        formData: {},
        currentTab: 0,
        lastCalculationResult: null,
      });
    }

    // Resetuj flagę w WorkflowController
    if (window.WorkflowController) {
      window.WorkflowController.typewriterCompleted = false;
      window.WorkflowController.typewriterActive = false;
    }

    if (typeof showTab === 'function') {
      showTab(0);
    } else {
      // Fallback - przeładuj stronę
      window.location.reload();
    }
  }

  window.displayResults = displayResults;
  window.displayRecommendedPumps = displayRecommendedPumps;
  window.DobierzPompe = DobierzPompe;
  window.resetResultsSection = resetResultsSection;
  window.lastCalcResult = window.lastCalcResult || {};
  window.handleEmailSend = handleEmailSend;
  window.goBackToForm = goBackToForm;
  window.startNewCalculation = startNewCalculation;
  window.showPDFContactForm = showPDFContactForm;
  window.collectCustomerData = collectCustomerData;
  // Nie nadpisujemy window.downloadPDF - funkcja z downloadPDF.js powinna być używana

  // Results Renderer Module v4.2 - ZORDON 3.0 loaded successfully

  // ═══════════════════════════════════════════════════════════════════════════
  // RESULTS SWITCHER LOGIC
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    'use strict';

    function initResultsSwitcher() {
      const switcher = document.getElementById('results-switcher');
      if (!switcher) {
        // Element #results-switcher nie znaleziony - ponów próbę dla Elementora (asynchroniczny render)
        console.log(
          '[ResultsSwitcher] ⏳ Switcher nie znaleziony - ponawiam próbę (Elementor async render)'
        );
        setTimeout(initResultsSwitcher, 200);
        return;
      }

      // Sprawdź czy jesteśmy w sekcji wyników (data-tab="6")
      const resultsSection = switcher.closest('.section[data-tab="6"]');
      if (!resultsSection) {
        // Switcher nie jest w sekcji wyników - ponów próbę dla Elementora
        console.log('[ResultsSwitcher] ⏳ Sekcja wyników nie znaleziona - ponawiam próbę');
        setTimeout(initResultsSwitcher, 200);
        return;
      }

      // ✅ NAPRAWA: W Elementorze sekcja może nie być aktywna od razu - inicjalizuj mimo to
      // Sprawdź czy switcher jest widoczny (nie ukryty przez CSS)
      const switcherStyle = window.getComputedStyle(switcher);
      if (switcherStyle.display === 'none' || switcherStyle.visibility === 'hidden') {
        // Switcher jest ukryty - poczekaj
        setTimeout(initResultsSwitcher, 200);
        return;
      }

      const buttons = switcher.querySelectorAll('.results-switch-btn');
      const views = document.querySelectorAll('.results-view');

      if (buttons.length === 0 || views.length === 0) {
        // Brak przycisków lub widoków - cichy fallback
        return;
      }

      // Sprawdź czy już zainicjalizowano
      if (switcher.dataset.initialized === 'true') {
        // Już zainicjalizowany - pomijam
        return;
      }

      // Inicjalizacja ResultsSwitcher

      // Oznacz jako zainicjalizowany
      switcher.dataset.initialized = 'true';

      // Funkcja przełączania widoków
      function switchView(targetId) {
        console.log('[ResultsSwitcher] 🔄 Przełączanie do widoku:', targetId);

        // ✅ ZAPISZ STAN KONFIGURATORA przed ukryciem widoku
        if (targetId === 'energy-profile-view') {
          // Przechodzimy do profilu energetycznego - zapisz stan konfiguratora
          if (typeof window.configuratorState !== 'undefined' && window.configuratorState) {
            // Wywołaj funkcję zapisu stanu jeśli istnieje
            if (typeof window.saveConfiguratorState === 'function') {
              window.saveConfiguratorState();
              console.log('[ResultsSwitcher] 💾 Zapisano stan konfiguratora przed przełączeniem');
            }
          }
        }

        // Dezaktywuj wszystkie przyciski
        buttons.forEach(btn => {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        });

        // Ukryj wszystkie widoki - usuń inline style.display i użyj tylko klas CSS
        views.forEach(view => {
          view.classList.remove('visible');
          view.classList.add('hidden');
          // Usuń inline style.display jeśli istnieje (zapobiega konfliktom)
          if (view.style.display) {
            view.style.display = '';
          }

          // ✅ NAPRAWA: Znajdź również wewnętrzny configurator-page (jeśli istnieje) i ustaw jego klasy
          // configurator-page jest wstrzykiwany do configurator-view z konfigurator.html
          if (view.id === 'configurator-view') {
            const configuratorPage = view.querySelector('.configurator-page');
            if (configuratorPage) {
              configuratorPage.classList.remove('visible');
              configuratorPage.classList.add('hidden');
              // Wymuś display: none przez inline style (nadpisze wszystko)
              configuratorPage.style.display = 'none';
              console.log(
                '[ResultsSwitcher] 🔒 Ukryto również .configurator-page (z wymuszonym display: none)'
              );
            }
          }
        });

        // Aktywuj wybrany przycisk
        const activeButton = Array.from(buttons).find(btn => btn.dataset.target === targetId);
        if (activeButton) {
          activeButton.classList.add('active');
          activeButton.setAttribute('aria-pressed', 'true');
        } else {
          console.warn('[ResultsSwitcher] ⚠️ Nie znaleziono przycisku dla:', targetId);
        }

        // Pokaż wybrany widok
        const targetView = document.getElementById(targetId);
        if (targetView) {
          // Usuń inline style.display jeśli istnieje (zapobiega konfliktom)
          if (targetView.style.display) {
            targetView.style.display = '';
          }
          targetView.classList.remove('hidden');
          targetView.classList.add('visible');
          console.log('[ResultsSwitcher] ✅ Pokazano widok:', targetId);

          // ✅ NAPRAWA: Znajdź również wewnętrzny configurator-page i ustaw jego klasy
          // configurator-page jest wstrzykiwany z konfigurator.html i ma klasę results-view
          if (targetId === 'configurator-view') {
            const configuratorPage = targetView.querySelector('.configurator-page');
            if (configuratorPage) {
              // Usuń inline style.display jeśli istnieje (zapobiega konfliktom)
              if (configuratorPage.style.display) {
                configuratorPage.style.display = '';
              }
              // Usuń klasę hidden (może mieć !important w configurator.css)
              configuratorPage.classList.remove('hidden');
              // Dodaj klasę visible (results-view.visible ma display: block)
              configuratorPage.classList.add('visible');
              // Wymuś display: block przez inline style (nadpisze !important z .hidden)
              configuratorPage.style.display = 'block';
              console.log(
                '[ResultsSwitcher] ✅ Pokazano również .configurator-page (z wymuszonym display: block)'
              );
            } else {
              console.warn(
                '[ResultsSwitcher] ⚠️ Nie znaleziono .configurator-page w configurator-view - może nie być jeszcze załadowany'
              );
            }
          }

          // ✅ PRZYWRÓĆ STAN KONFIGURATORA jeśli wracamy do widoku konfiguratora
          if (targetId === 'configurator-view') {
            // Sprawdź czy konfigurator jest już załadowany
            const configuratorApp = document.getElementById('configurator-app');
            if (configuratorApp) {
              // Konfigurator jest załadowany - przywróć stan
              setTimeout(() => {
                if (typeof window.restoreConfiguratorState === 'function') {
                  const savedState = window.loadConfiguratorState();
                  if (savedState && Object.keys(savedState.selections || {}).length > 0) {
                    console.log('[ResultsSwitcher] 🔄 Przywracam stan konfiguratora');
                    window.restoreConfiguratorState(savedState);
                  }
                }
              }, 200);
            } else {
              // Konfigurator nie jest jeszcze załadowany - poczekaj
              console.log(
                '[ResultsSwitcher] ⏳ Konfigurator nie jest jeszcze załadowany, czekam...'
              );
              const checkInterval = setInterval(() => {
                const app = document.getElementById('configurator-app');
                if (app) {
                  clearInterval(checkInterval);
                  console.log('[ResultsSwitcher] ✅ Konfigurator załadowany, przywracam stan');
                  setTimeout(() => {
                    if (typeof window.restoreConfiguratorState === 'function') {
                      const savedState = window.loadConfiguratorState();
                      if (savedState && Object.keys(savedState.selections || {}).length > 0) {
                        window.restoreConfiguratorState(savedState);
                      }
                    }
                  }, 200);
                }
              }, 100);
              // Timeout po 5 sekundach
              setTimeout(() => clearInterval(checkInterval), 5000);
            }
          }
        } else {
          console.error('[ResultsSwitcher] ❌ Nie znaleziono widoku:', targetId);
        }

        // Zapisz wybór w sessionStorage (opcjonalnie)
        try {
          sessionStorage.setItem('topinstal_results_view', targetId);
        } catch (e) {
          console.warn('[ResultsSwitcher] Nie można zapisać do sessionStorage:', e);
        }
      }

      // ✅ NAPRAWA: Obsługa kliknięć - usuń stare listenery i dodaj nowe (dla Elementora)
      buttons.forEach(btn => {
        // Klonuj przycisk aby usunąć stare event listenery
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // Dodaj nowy event listener
        newBtn.addEventListener('click', function (e) {
          console.log('[ResultsSwitcher] 🖱️ Kliknięto przycisk:', this.dataset.target);

          e.preventDefault(); // Zapobiegaj submit formularza
          e.stopPropagation(); // Zapobiegaj propagacji eventu

          const target = this.dataset.target;
          if (target) {
            console.log('[ResultsSwitcher] 🎯 Wywołuję switchView dla:', target);
            switchView(target);
          } else {
            console.warn('[ResultsSwitcher] ⚠️ Przycisk nie ma data-target');
          }
        });
      });

      // Przywróć ostatni wybór (opcjonalnie)
      try {
        const savedView = sessionStorage.getItem('topinstal_results_view');
        if (savedView && document.getElementById(savedView)) {
          switchView(savedView);
        }
      } catch (e) {
        console.warn('[ResultsSwitcher] Nie można odczytać z sessionStorage:', e);
      }

      console.log('[ResultsSwitcher] ✅ Zainicjalizowano pomyślnie');
    }

    // NIE inicjalizuj automatycznie po załadowaniu DOM
    // Inicjalizuj TYLKO gdy użytkownik przejdzie do zakładki wyników

    // ✅ Flaga zapobiegająca wielokrotnemu opakowaniu showTab
    let showTabWrapped = false;

    // Czekaj aż showTab będzie dostępny
    function wrapShowTab() {
      // ✅ Zapobiegaj wielokrotnemu opakowaniu
      if (showTabWrapped) {
        return;
      }

      if (typeof window.showTab === 'function') {
        // ✅ Sprawdź czy showTab nie jest już opakowany (ma właściwość _resultsSwitcherWrapper)
        if (window.showTab._resultsSwitcherWrapper) {
          console.log('[ResultsSwitcher] showTab już jest opakowany - pomijam');
          showTabWrapped = true;
          return;
        }

        const originalShowTab = window.showTab;

        window.showTab = function (index) {
          console.log('[ResultsSwitcher] 📍 showTab wywołany z index:', index);

          // Wywołaj oryginalną funkcję
          originalShowTab(index);

          // Jeśli przeszliśmy do zakładki wyników (6), zainicjalizuj switcher
          if (index === 6) {
            setTimeout(() => {
              console.log('[ResultsSwitcher] 🎯 Wykryto przejście do zakładki 6 - inicjalizuję');
              initResultsSwitcher();
            }, 300);
          }
        };

        // ✅ Oznacz jako opakowany
        window.showTab._resultsSwitcherWrapper = true;
        showTabWrapped = true;

        console.log('[ResultsSwitcher] ✅ Zainstalowano wrapper dla showTab');
      } else {
        console.warn('[ResultsSwitcher] ⚠️ window.showTab nie jest jeszcze dostępny');
        setTimeout(wrapShowTab, 100);
      }
    }

    // Zainstaluj wrapper
    wrapShowTab();

    // Alternatywnie - nasłuchuj na custom event
    document.addEventListener('tab-changed', function (e) {
      if (e.detail && e.detail.tab === 6) {
        setTimeout(initResultsSwitcher, 300);
      }
    });

    // ✅ NAPRAWA: Fallback dla Elementora - sprawdź wielokrotnie czy switcher jest dostępny
    function checkAndInitSwitcher() {
      const switcher = document.getElementById('results-switcher');
      const resultsSection = document.querySelector('.section[data-tab="6"]');

      if (switcher && resultsSection) {
        // Switcher i sekcja są dostępne - zainicjalizuj
        initResultsSwitcher();
      } else {
        // Ponów próbę (Elementor renderuje asynchronicznie)
        setTimeout(checkAndInitSwitcher, 300);
      }
    }

    // Sprawdź po załadowaniu DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        setTimeout(checkAndInitSwitcher, 500);
      });
    } else {
      setTimeout(checkAndInitSwitcher, 500);
    }

    // Fallback - jeśli sekcja wyników jest już aktywna przy ładowaniu
    window.addEventListener('load', function () {
      setTimeout(checkAndInitSwitcher, 500);
    });
  })();
})();
