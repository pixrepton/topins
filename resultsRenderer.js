(function () {
  'use strict';

  // Tabela doboru pomp ciepła - ZAKTUALIZOWANA z wszystkimi 48 zestawami z heatpump-kits-k.js
  // Zawiera wszystkie modele Panasonic HP K i T-CAP K
  const pumpMatchingTable = {
    // HIGH PERFORMANCE - SPLIT - 1~ (230V)
    'KIT-WC03K3E5': {
      min: { surface: 1.8, mixed: 1.8, radiators: 1.6 },
      max: { surface: 4.0, mixed: 4.0, radiators: 4.2 },
      power: 3,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC05K3E5': {
      min: { surface: 3.0, mixed: 3.0, radiators: 2.7 },
      max: { surface: 6.5, mixed: 6.5, radiators: 6.8 },
      power: 5,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC07K3E5': {
      min: { surface: 4.0, mixed: 4.0, radiators: 3.6 },
      max: { surface: 8.5, mixed: 8.5, radiators: 8.9 },
      power: 7,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC09K3E5': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 10.5, mixed: 10.5, radiators: 11.0 },
      power: 9,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC03K6E5': {
      min: { surface: 1.8, mixed: 1.8, radiators: 1.6 },
      max: { surface: 4.0, mixed: 4.0, radiators: 4.2 },
      power: 3,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC05K6E5': {
      min: { surface: 3.0, mixed: 3.0, radiators: 2.7 },
      max: { surface: 6.5, mixed: 6.5, radiators: 6.8 },
      power: 5,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC07K6E5': {
      min: { surface: 4.0, mixed: 4.0, radiators: 3.6 },
      max: { surface: 8.5, mixed: 8.5, radiators: 8.9 },
      power: 7,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC09K6E5': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 10.5, mixed: 10.5, radiators: 11.0 },
      power: 9,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC12K6E5': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 13.5, mixed: 13.5, radiators: 14.0 },
      power: 12,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WC16K6E5': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'WC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    // HIGH PERFORMANCE - SPLIT - 3~ (400V)
    'KIT-WC09K3E8': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 10.5, mixed: 10.5, radiators: 11.0 },
      power: 9,
      series: 'WC',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    'KIT-WC12K9E8': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 13.5, mixed: 13.5, radiators: 14.0 },
      power: 12,
      series: 'WC',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    'KIT-WC16K9E8': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'WC',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    // HIGH PERFORMANCE - ALL IN ONE 185L - 1~ (230V)
    'KIT-ADC03K3E5': {
      min: { surface: 1.8, mixed: 1.8, radiators: 1.6 },
      max: { surface: 4.0, mixed: 4.0, radiators: 4.2 },
      power: 3,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC05K3E5': {
      min: { surface: 3.0, mixed: 3.0, radiators: 2.7 },
      max: { surface: 6.5, mixed: 6.5, radiators: 6.8 },
      power: 5,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC07K3E5': {
      min: { surface: 4.0, mixed: 4.0, radiators: 3.6 },
      max: { surface: 8.5, mixed: 8.5, radiators: 8.9 },
      power: 7,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC09K3E5': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 10.5, mixed: 10.5, radiators: 11.0 },
      power: 9,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC03K6E5': {
      min: { surface: 1.8, mixed: 1.8, radiators: 1.6 },
      max: { surface: 4.0, mixed: 4.0, radiators: 4.2 },
      power: 3,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC05K6E5': {
      min: { surface: 3.0, mixed: 3.0, radiators: 2.7 },
      max: { surface: 6.5, mixed: 6.5, radiators: 6.8 },
      power: 5,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC07K6E5': {
      min: { surface: 4.0, mixed: 4.0, radiators: 3.6 },
      max: { surface: 8.5, mixed: 8.5, radiators: 8.9 },
      power: 7,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC09K6E5': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 10.5, mixed: 10.5, radiators: 11.0 },
      power: 9,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC12K6E5': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 13.5, mixed: 13.5, radiators: 14.0 },
      power: 12,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-ADC16K6E5': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    // HIGH PERFORMANCE - ALL IN ONE 185L - 3~ (400V)
    'KIT-ADC09K9E8': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 10.5, mixed: 10.5, radiators: 11.0 },
      power: 9,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
    'KIT-ADC12K9E8': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 13.5, mixed: 13.5, radiators: 14.0 },
      power: 12,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
    'KIT-ADC16K9E8': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
    // HIGH PERFORMANCE - ALL IN ONE 260L - 1~ (230V)
    'KIT-ADC12K6E53': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 13.5, mixed: 13.5, radiators: 14.0 },
      power: 12,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 260,
    },
    'KIT-ADC16K6E53': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 260,
    },
    // HIGH PERFORMANCE - ALL IN ONE 260L - 3~ (400V)
    'KIT-ADC09K9E83': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 10.5, mixed: 10.5, radiators: 11.0 },
      power: 9,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 260,
    },
    'KIT-ADC12K9E83': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 13.5, mixed: 13.5, radiators: 14.0 },
      power: 12,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 260,
    },
    'KIT-ADC16K9E83': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'ADC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 260,
    },
    // T-CAP - SPLIT - 1~ (230V) - zakresy szacunkowe na podstawie nominal_kw (T-CAP ma percent_max zamiast min_kw/max_kw)
    'KIT-WXC09K3E5': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 11.0, mixed: 11.0, radiators: 11.5 },
      power: 9,
      series: 'WXC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WXC09K6E5': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 11.0, mixed: 11.0, radiators: 11.5 },
      power: 9,
      series: 'WXC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    'KIT-WXC12K6E5': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 14.0, mixed: 14.0, radiators: 14.5 },
      power: 12,
      series: 'WXC',
      type: 'split',
      requires3F: false,
      phase: 1,
    },
    // T-CAP - SPLIT - 3~ (400V)
    'KIT-WXC09K3E8': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 11.0, mixed: 11.0, radiators: 11.5 },
      power: 9,
      series: 'WXC',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    'KIT-WXC09K9E8': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 11.0, mixed: 11.0, radiators: 11.5 },
      power: 9,
      series: 'WXC',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    'KIT-WXC12K9E8': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 14.0, mixed: 14.0, radiators: 14.5 },
      power: 12,
      series: 'WXC',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    'KIT-WXC16K9E8': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'WXC',
      type: 'split',
      requires3F: true,
      phase: 3,
    },
    // T-CAP - ALL IN ONE 185L - 1~ (230V)
    'KIT-AXC09K6E5': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 11.0, mixed: 11.0, radiators: 11.5 },
      power: 9,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    'KIT-AXC12K6E5': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 14.0, mixed: 14.0, radiators: 14.5 },
      power: 12,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 185,
    },
    // T-CAP - ALL IN ONE 185L - 3~ (400V)
    'KIT-AXC09K9E8': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 11.0, mixed: 11.0, radiators: 11.5 },
      power: 9,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
    'KIT-AXC12K9E8': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 14.0, mixed: 14.0, radiators: 14.5 },
      power: 12,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
    'KIT-AXC16K9E8': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 185,
    },
    // T-CAP - ALL IN ONE 260L - 1~ (230V)
    'KIT-AXC09K6E53': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 11.0, mixed: 11.0, radiators: 11.5 },
      power: 9,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 260,
    },
    'KIT-AXC12K6E53': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 14.0, mixed: 14.0, radiators: 14.5 },
      power: 12,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: false,
      phase: 1,
      cwu_tank: 260,
    },
    // T-CAP - ALL IN ONE 260L - 3~ (400V)
    'KIT-AXC09K9E83': {
      min: { surface: 5.0, mixed: 5.0, radiators: 4.5 },
      max: { surface: 11.0, mixed: 11.0, radiators: 11.5 },
      power: 9,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 260,
    },
    'KIT-AXC12K9E83': {
      min: { surface: 7.0, mixed: 7.0, radiators: 6.5 },
      max: { surface: 14.0, mixed: 14.0, radiators: 14.5 },
      power: 12,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 260,
    },
    'KIT-AXC16K9E83': {
      min: { surface: 9.0, mixed: 9.0, radiators: 8.5 },
      max: { surface: 18.0, mixed: 18.0, radiators: 18.5 },
      power: 16,
      series: 'AXC',
      type: 'all-in-one',
      requires3F: true,
      phase: 3,
      cwu_tank: 260,
    },
  };

  // Baza danych pomp ciepła - generowana z pumpMatchingTable (ceny szacunkowe)
  const pumpCardsData = Object.keys(pumpMatchingTable).map(model => {
    const data = pumpMatchingTable[model];
    const image = data.type === 'split' ? '../img/split-k.png' : '../img/allinone.png';
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

    console.log('✅ Znormalizowane wyniki API:', normalized);
    return normalized;
  }

  /**
   * Dobiera pompy ciepła na podstawie wyników
   */
  function selectHeatPumps(result, heatingType = 'radiators') {
    const powerDemand = result.max_heating_power + (result.hot_water_power || 0);
    console.log(`🔍 Dobór pomp dla mocy ${powerDemand} kW, typ: ${heatingType}`);

    const matchingPumps = Object.entries(pumpMatchingTable)
      .filter(([model, data]) => {
        const min = data.min[heatingType];
        const max = data.max[heatingType];
        return powerDemand >= min && powerDemand <= max;
      })
      .map(([model, data]) => {
        const pumpData = pumpCardsData.find(p => p.model === model);
        return {
          model: model,
          power: data.power,
          series: data.series,
          type: data.type,
          image: pumpData?.image || '../img/default-pump.png',
          price: pumpData?.price || 0,
        };
      });

    console.log(`✅ Znaleziono ${matchingPumps.length} dopasowanych pomp`);
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
    setText('r-factor', result.annual_energy_consumption_factor, ' kWh/m²');
    setText('r-power-factor', result.heating_power_factor, ' W/m²');

    // === DANE ROZSZERZONE ===
    if (result.extended) {
      console.log('📊 Wyświetlam dane rozszerzone');

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
    try {
      // 1) Wywołaj DobierzPompe() aby dobrać pompy z zaktualizowanej pumpMatchingTable (48 zestawów)
      let pumpSelectionResult = null;
      try {
        const pumpGroups = DobierzPompe(result);
        const recommendedGroup = pumpGroups && pumpGroups[0];
        if (recommendedGroup) {
          // Mapuj wyniki z DobierzPompe() na format dla konfiguratora (hp, aio, tcap)
          // WC/WXC = HP Split (hp)
          // ADC = HP All-in-One (aio)
          // AXC = T-CAP All-in-One (tcap)
          const hpPump =
            recommendedGroup.wc || recommendedGroup.wxc || recommendedGroup.sdc || null;
          const aioPump = recommendedGroup.adc || null;
          const tcapPump = recommendedGroup.axc || null;

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
              tcap: tcapPump
                ? {
                    model: tcapPump.model,
                    power: tcapPump.power,
                    series: tcapPump.series,
                    type: 'all-in-one',
                    phase: tcapPump.phase,
                    requires3F: tcapPump.requires3F,
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

          console.log('✅ Dobrano pompy dla konfiguratora:', pumpSelectionResult);
        }
      } catch (e) {
        console.warn('⚠️ Nie udało się wyliczyć rekomendowanej mocy pomp (DobierzPompe):', e);
      }

      // 2) Zbierz podstawowe dane z formularza, jeśli dostępny jest formEngine
      let formSnapshot = {};
      if (window.formEngine && typeof window.formEngine.getState === 'function') {
        formSnapshot = window.formEngine.getState() || {};
      }

      // 3) Zbuduj obiekt danych wejściowych dla konfiguratora – na bazie wyników + doboru pomp
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
        include_hot_water:
          formSnapshot.include_hot_water === true || formSnapshot.include_hot_water === 'yes',
        has_three_phase: !!formSnapshot.has_three_phase,
        building_type: formSnapshot.building_type || null,
        // Użyj wyników z DobierzPompe() jeśli dostępne
        recommended_power_kw:
          pumpSelectionResult?.recommended_power_kw ||
          window.lastCalculationResult?.recommended_power_kw ||
          result.max_heating_power ||
          null,
        recommended_models:
          pumpSelectionResult?.recommended_models ||
          window.lastCalculationResult?.recommended_models ||
          [],
        // NOWY FORMAT: przekaż wyniki doboru pomp do konfiguratora
        pump_selection: pumpSelectionResult?.pump_selection || null,
      };

      window.lastCalculationResult = configuratorInput;

      // === INICJALIZACJA KONFIGURATORA (configurator-unified.js) ===
      const mount = document.getElementById('configurator-root');
      if (mount) {
        console.log('🔍 [Configurator] Sprawdzam konfigurator...');

        // ✅ ZUNIFIKOWANY KONFIGURATOR (configurator-unified.js)
        const configuratorApp = document.getElementById('configurator-app');
        if (configuratorApp) {
          console.log('✅ [Configurator] #configurator-app znaleziony');

          // Wywołaj inicjalizację
          if (typeof window.initNewConfigurator === 'function') {
            const initResult = window.initNewConfigurator();
            if (initResult) {
              console.log('✅ [Configurator] Zainicjalizowany pomyślnie');

              // Wypełnij danymi z kalkulatora
              if (typeof window.populateConfiguratorWithCalculatorData === 'function') {
                setTimeout(() => {
                  window.populateConfiguratorWithCalculatorData();
                }, 100);
              }
            } else {
              console.warn('⚠️ [Configurator] Inicjalizacja zwróciła false');
            }
          } else {
            console.log('ℹ️ [Configurator] Czekam na configurator-unified.js...');
            setTimeout(() => {
              if (typeof window.initNewConfigurator === 'function') {
                window.initNewConfigurator();
                if (typeof window.populateConfiguratorWithCalculatorData === 'function') {
                  setTimeout(() => {
                    window.populateConfiguratorWithCalculatorData();
                  }, 100);
                }
              }
            }, 500);
          }
        } else {
          console.log('ℹ️ [Configurator] #configurator-app jeszcze nie istnieje - HTML się ładuje');
          console.log(
            '[Configurator] Dane w window.lastCalculationResult - będą użyte po załadowaniu'
          );
        }
      } else {
        console.warn('⚠️ [Configurator] Brak #configurator-root');
      }
    } catch (e) {
      console.warn('⚠️ Nie udało się przekazać danych do konfiguratora maszynowni:', e);
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

    console.log('🔄 Sekcja wyników zresetowana');
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
          ? 'https://topinstal.com.pl/wp-content/uploads/2024/split-k.png'
          : 'https://topinstal.com.pl/wp-content/uploads/2024/aio-k.png';

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
        pump.series === 'SDC' ? 'REKOMENDOWANA' : 'ALTERNATYWA'
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
        localStorage.setItem('config_data', JSON.stringify(configData));
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
    const totalPower =
      parseFloat(result.max_heating_power || 0) + parseFloat(result.hot_water_power || 0);

    // Walidacja mocy
    if (isNaN(totalPower) || totalPower <= 0) {
      console.error('❌ Nieprawidłowa moc całkowita:', totalPower);
      return [];
    }

    console.log('🔍 Szukam pomp dla mocy:', totalPower, 'kW');
    console.log('📊 Szczegóły:', {
      max_heating_power: result.max_heating_power,
      hot_water_power: result.hot_water_power,
      totalPower: totalPower,
    });

    // Użyj pumpMatchingTable do doboru pomp na podstawie zakresów min/max
    const heatingType = result.heating_type || 'mixed';
    const normalizedType =
      heatingType === 'radiators'
        ? 'radiators'
        : heatingType === 'underfloor' || heatingType === 'surface'
        ? 'surface'
        : 'mixed';

    console.log('🏠 Typ instalacji:', heatingType, '→ znormalizowany:', normalizedType);

    const hasThreePhase = result.has_three_phase || false;

    // KRYTYCZNA POPRAWKA: Filtruj pompy i sortuj po mocy ROSNĄCO, aby wybrać najmniejszą pasującą
    const matching = Object.entries(pumpMatchingTable)
      .filter(([model, data]) => {
        // Sprawdź zakres mocy dla danego typu instalacji
        const min = data.min[normalizedType] || data.min.mixed;
        const max = data.max[normalizedType] || data.max.mixed;
        const powerMatch = totalPower >= min && totalPower <= max;

        // Sprawdź wymagania zasilania
        const phaseMatch = !data.requires3F || hasThreePhase;

        if (powerMatch && phaseMatch) {
          console.log(`✅ Pompa ${model} pasuje: ${totalPower} kW w zakresie [${min}, ${max}] kW`);
        }

        return powerMatch && phaseMatch;
      })
      .map(([model, data]) => {
        const image = data.type === 'split' ? '../img/split-k.png' : '../img/allinone.png';
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

    console.log('🔍 Znaleziono dopasowanych pomp:', matching.length);
    if (matching.length > 0) {
      console.log('📋 Pasujące pompy:', matching.map(p => `${p.model} (${p.power} kW)`).join(', '));
      console.log('⭐ Najmniejsza pasująca pompa:', matching[0].model, `(${matching[0].power} kW)`);
    }

    // Jeśli nie znaleziono, wybierz najmniejszą pompę która ma max >= totalPower
    if (matching.length === 0) {
      console.warn(
        '⚠️ Brak dopasowanych pomp w zakresie, szukam najmniejszej pompy z max >= totalPower'
      );
      const allPumpsFlat = Object.keys(pumpMatchingTable)
        .map(model => {
          const data = pumpMatchingTable[model];
          const min = data.min[normalizedType] || data.min.mixed;
          const max = data.max[normalizedType] || data.max.mixed;
          const phaseMatch = !data.requires3F || hasThreePhase;

          // Wybierz pompy które mogą pokryć zapotrzebowanie (max >= totalPower)
          if (max >= totalPower && phaseMatch) {
            return {
              model: model,
              power: data.power,
              series: data.series,
              type: data.type,
              image: data.type === 'split' ? '../img/split-k.png' : '../img/allinone.png',
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
        console.log(
          `✅ Wybrano najmniejszą pompę pokrywającą zapotrzebowanie: ${smallest.model} (${smallest.power} kW, max: ${smallest.max} kW)`
        );
        matching.push(smallest);
      } else {
        console.error('❌ Nie znaleziono żadnej pompy pokrywającej zapotrzebowanie!');
      }
    }

    // Grupuj pompy po mocy i serii
    const grouped = {};
    matching.forEach(pump => {
      if (!grouped[pump.power]) grouped[pump.power] = {};
      // Zachowaj kompatybilność ze starym kodem (sdc/adc) + dodaj nowe serie
      const seriesKey = pump.series.toLowerCase();
      grouped[pump.power][seriesKey] = pump;
      // Mapowanie dla kompatybilności wstecznej
      if (seriesKey === 'wc') grouped[pump.power]['sdc'] = pump; // WC to nowa nazwa dla SDC
      if (seriesKey === 'adc') grouped[pump.power]['adc'] = pump; // ADC bez zmian
      if (seriesKey === 'wxc') grouped[pump.power]['wxc'] = pump; // T-CAP split
      if (seriesKey === 'axc') grouped[pump.power]['axc'] = pump; // T-CAP all-in-one
    });

    const pumpGroups = Object.entries(grouped)
      .map(([power, seriesMap]) => ({
        power: Number(power),
        sdc: seriesMap.sdc || seriesMap.wc || null, // Kompatybilność wsteczna
        adc: seriesMap.adc || null,
        wc: seriesMap.wc || null, // HP Split
        wxc: seriesMap.wxc || null, // T-CAP Split
        axc: seriesMap.axc || null, // T-CAP All-in-One
      }))
      .sort((a, b) => a.power - b.power);

    console.log('✅ Zwracam pogrupowane pompy:', pumpGroups);
    return pumpGroups;
  }

  function renderHaierStyleSliders(pumpGroups, container) {
    if (!container) {
      console.error('❌ Kontener pump-recommendation-zone nie istnieje');
      return;
    }

    if (!Array.isArray(pumpGroups)) {
      console.error('❌ pumpGroups nie jest tablicą:', pumpGroups);
      return;
    }

    if (pumpGroups.length === 0) {
      console.warn('⚠️ Brak grup pomp do wyświetlenia');
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
      console.warn('⚠️ Brak rekomendowanej grupy pomp');
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
      window.lastCalculationResult = Object.assign({}, window.lastCalculationResult || {}, {
        recommended_power_kw: recommendedGroup.power,
        recommended_models: recModels,
      });
    } catch (e) {
      console.warn('Nie udało się zapisać rekomendowanych modeli do PDF:', e);
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
      const imgPath = pump.type === 'split' ? '../img/sdc-k.png' : '../img/adc-k.png';
      const seriesName = pump.series === 'SDC' ? 'Panasonic SDC' : 'Panasonic ADC';
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

    // Zapisz w localStorage (można zastąpić wywołaniem API)
    let customers = JSON.parse(localStorage.getItem('customerDatabase') || '[]');
    customers.push(customerData);
    localStorage.setItem('customerDatabase', JSON.stringify(customers));

    customerDataCollected = true;
    console.log('Dane klienta zapisane:', customerData);

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
    console.log('Wysyłanie raportu PDF na email:', reportData);

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
    console.log('Funkcja handleEmailSend została zastąpiona');
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
      : [];

    if (keyPoints.length === 0) return;

    let html = '<table class="results-table results-table--compact">';
    html += `
            <thead>
                <tr>
                    <th>Temperatura zewnętrzna</th>
                    <th>Moc dostępna</th>
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
    if (typeof showTab === 'function') {
      showTab(5);
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

  console.log('✅ Results Renderer Module v4.2 - ZORDON 3.0 loaded successfully');
})();
