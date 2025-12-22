// configurator-unified.js
// Kompleksowy, zunifikowany konfigurator maszynowni TOP-INSTAL
// Łączy najlepsze cechy configurator-new.js i configurator.js
// Gotowy do produkcji - pełna funkcjonalność: pricing, rules engine, export, advanced summary

(function () {
  'use strict';

  /* ==========================================================================
     PUMP MATCHING & SELECTION (z configurator.js)
     ========================================================================== */

  // Tabela doboru pomp ciepła - wszystkie modele Panasonic HP K i T-CAP K
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
    // T-CAP - SPLIT - 1~ (230V)
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

  // Mapa odpowiedników AIO dla modeli Split
  const aioMap = {
    'KIT-WC03K3E5': 'KIT-ADC03K3E5',
    'KIT-WC05K3E5': 'KIT-ADC05K3E5',
    'KIT-WC07K3E5': 'KIT-ADC07K3E5',
    'KIT-WC09K3E5': 'KIT-ADC09K3E5',
    'KIT-WC09K3E8': 'KIT-ADC09K9E8',
    'KIT-WC12K6E5': 'KIT-ADC12K6E5',
    'KIT-WC12K9E8': 'KIT-ADC12K9E8',
    'KIT-WC16K6E5': 'KIT-ADC16K6E5',
    'KIT-WC16K9E8': 'KIT-ADC16K9E8',
    'KIT-WC03K6E5': 'KIT-ADC03K6E5',
    'KIT-WC05K6E5': 'KIT-ADC05K6E5',
    'KIT-WC07K6E5': 'KIT-ADC07K6E5',
    'KIT-WC09K6E5': 'KIT-ADC09K6E5',
  };

  // Mapa odpowiedników T-CAP dla modeli Split
  const tcapMap = {
    'KIT-WC03K3E5': null,
    'KIT-WC05K3E5': 'KIT-AXC09K6E5',
    'KIT-WC07K3E5': 'KIT-AXC09K6E5',
    'KIT-WC09K3E5': 'KIT-AXC09K6E5',
    'KIT-WC09K3E8': 'KIT-AXC09K9E8',
    'KIT-WC12K6E5': 'KIT-AXC12K6E5',
    'KIT-WC12K9E8': 'KIT-AXC12K9E8',
    'KIT-WC16K6E5': 'KIT-AXC16K9E8',
    'KIT-WC16K9E8': 'KIT-AXC16K9E8',
    'KIT-WC03K6E5': null,
    'KIT-WC05K6E5': 'KIT-AXC09K6E5',
    'KIT-WC07K6E5': 'KIT-AXC09K6E5',
    'KIT-WC09K6E5': 'KIT-AXC09K6E5',
  };

  function findEquivalentAIO(splitModel) {
    if (!splitModel) return null;
    return aioMap[splitModel] || null;
  }

  function findEquivalentTCAP(splitModel) {
    if (!splitModel) return null;
    return tcapMap[splitModel] || null;
  }

  // Funkcja przypisująca obrazy do pomp – dostosowana do aktualnych plików PNG w katalogu img
  function getPumpImage(type, phase, series, power, model = null) {
    const basePath = '../img/';

    // SPLIT – osobna jednostka zewnętrzna
    if (type === 'split') {
      // T-CAP – osobne obrazy outdoorów
      if (series === 'T-CAP') {
        if (phase === 3) {
          return basePath + 'outdoorunitK3f-or-tcap.png';
        }
        return basePath + 'outdoorunitK1f.png';
      }

      // Standardowe split-y
      if (phase === 3) {
        return basePath + 'splitk3f.png';
      }
      return basePath + 'splitK1f.png';
    }

    // ALL‑IN‑ONE – jednostka wewnętrzna z wbudowanym zasobnikiem
    if (type === 'all-in-one') {
      // T-CAP AIO
      if (series === 'T-CAP') {
        return basePath + 'allinoneKtap.png';
      }

      if (phase === 3) {
        return basePath + 'allinoneK3f.png';
      }
      return basePath + 'allinoneK1f.png';
    }

    // Fallback – klasyczna jednostka zewnętrzna
    return basePath + 'splitK1f.png';
  }

  // Dobiera pompy ciepła na podstawie wyników kalkulatora
  function selectHeatPumps(result, heatingType = 'radiators') {
    const powerDemand = result.recommended_power_kw || result.max_heating_power || 0;
    console.log(`🔍 [Pump Matching] Dobór pomp dla mocy ${powerDemand} kW, typ: ${heatingType}`);
    const normalizedType = heatingType === 'underfloor' ? 'surface' : heatingType;
    const matchingPumps = Object.entries(pumpMatchingTable)
      .filter(([model, data]) => {
        const min = data.min[normalizedType] || data.min.mixed;
        const max = data.max[normalizedType] || data.max.mixed;
        const powerMatch = powerDemand >= min && powerDemand <= max;
        const hasThreePhase = !!result.has_three_phase;
        const phaseMatch = !data.requires3F || hasThreePhase;
        return powerMatch && phaseMatch;
      })
      .map(([model, data]) => {
        return {
          model: model,
          power: data.power,
          series: data.series,
          type: data.type,
          image: getPumpImage(data.type, data.phase, data.series, data.power, model),
          phase: data.phase,
          requires3F: data.requires3F,
          cwu_tank: data.cwu_tank || null,
        };
      });
    matchingPumps.sort((a, b) => a.power - b.power);
    console.log(`✅ [Pump Matching] Znaleziono ${matchingPumps.length} dopasowanych pomp`);
    return matchingPumps;
  }

  // Przygotowuje profile pomp (Split + AIO) dla konfiguratora
  function preparePumpProfiles(calcInput) {
    const heatingType = calcInput.heating_type || calcInput.installation_type || 'radiators';
    const matched = selectHeatPumps(calcInput, heatingType);

    if (!matched || matched.length === 0) {
      console.warn('[Configurator] Brak pasujących pomp');
      return [];
    }

    const recommended = matched[0]; // Pierwsza pompa to rekomendowany Split
    const aioModel = findEquivalentAIO(recommended.model);
    const aioData = aioModel ? pumpMatchingTable[aioModel] : null;

    return [
      {
        id: 'hp',
        label: 'Split',
        variant: 'Rekomendowana – split',
        type: 'split',
        isRecommended: true,
        model: recommended.model,
        power_kw: recommended.power,
        series: recommended.series,
        image: recommended.image,
        minPhase: recommended.phase || 1,
        requires3F: recommended.requires3F || false,
      },
      {
        id: 'aio',
        label: 'All-in-One',
        variant: 'All-in-One',
        type: 'all-in-one',
        isRecommended: false,
        model: aioModel,
        power_kw: recommended.power,
        series: aioData?.series || 'ADC',
        image: aioData
          ? getPumpImage(
              'all-in-one',
              aioData.phase || recommended.phase || 1,
              aioData.series,
              aioData.power,
              aioModel
            )
          : '../img/aioK.png',
        minPhase: aioData?.phase || recommended.phase || 1,
        requires3F: aioData?.requires3F || recommended.requires3F || false,
        disabled: !aioModel,
        cwu_tank: aioData?.cwu_tank || null,
      },
    ];
  }

  // Loader panasonic.json
  let panasonicDB = null;
  let panasonicDBPromise = null;

  async function loadPanasonicDB() {
    if (panasonicDBPromise) return panasonicDBPromise;

    panasonicDBPromise = (async () => {
      try {
        const response = await fetch('../konfigurator/panasonic.json');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();

        // panasonic.json to array, więc zwracamy bezpośrednio
        panasonicDB = Array.isArray(data) ? data : [];
        console.log('[Configurator] ✅ Panasonic DB załadowany:', panasonicDB.length, 'modeli');
        return panasonicDB;
      } catch (e) {
        console.warn('[Configurator] ⚠️ Błąd ładowania panasonic.json:', e);
        return [];
      }
    })();

    return panasonicDBPromise;
  }

  // Mapuje model pompy do danych z panasonic.json
  function getPumpDataFromDB(model) {
    if (!panasonicDB || !model) return null;
    return panasonicDB.find(p => p.kit === model) || null;
  }

  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */

  let steps = [];
  let navPrev = null;
  let navNext = null;
  let currentStepNumberEl = null;
  let totalStepsNumberEl = null;
  let summaryBody = null;
  let totalSteps = 0;
  let currentStepIndex = 0;

  // Stan konfiguratora - rozszerzony o pricing i products
  const state = {
    selections: {},
    meta: null, // Dane z kalkulatora
    selectedPump: null,
    selectedCwuProduct: null,
    selectedBufferProduct: null,
    pricing: {
      total_netto_pln: 0,
      total_brutto_pln: 0,
      items: [],
    },
  };

  // Handlery eventów
  let cardClickHandler = null;
  let navClickHandler = null;
  let summaryClickHandler = null;

  // Konfiguracja kroków z ikonami
  const summaryConfig = [
    { stepKey: 'pompa', label: 'Pompa ciepła', icon: 'ri-settings-5-fill' },
    { stepKey: 'cwu', label: 'Zasobnik CWU', icon: 'ri-showers-fill' },
    { stepKey: 'bufor', label: 'Bufor CO', icon: 'ri-drop-fill' },
    { stepKey: 'cyrkulacja', label: 'Cyrkulacja CWU', icon: 'ri-refresh-fill' },
    { stepKey: 'service', label: 'Service Cloud', icon: 'ri-cloud-fill' },
    {
      stepKey: 'posadowienie',
      label: 'Posadowienie jednostki zewnętrznej',
      icon: 'ri-building-fill',
    },
    { stepKey: 'reduktor', label: 'Reduktor ciśnienia', icon: 'ri-scale-fill' },
    { stepKey: 'woda', label: 'Stacja uzdatniania wody', icon: 'ri-drop-fill' },
  ];

  // Eksport stanu na zewnątrz
  window.ConfiguratorSelections = state.selections;
  window.configuratorState = state;

  /* ==========================================================================
     PRICING ENGINE (z configurator.js)
     ========================================================================== */

  const PRICING_CATALOG = {
    pumps: {
      base: {
        '3kW': 25000,
        '5kW': 28000,
        '7kW': 32000,
        '9kW': 36000,
        '12kW': 42000,
        '16kW': 48000,
      },
      aio_premium: 5000,
      tcap_premium: 8000,
    },
    cwu: {
      emalia: {
        150: 2800,
        200: 3200,
        250: 3600,
        300: 4000,
        400: 4800,
        500: 5600,
      },
      inox: {
        150: 4200,
        200: 4800,
        250: 5400,
        300: 6000,
        400: 7200,
        500: 8400,
      },
    },
    buffer: {
      50: 1500,
      80: 1800,
      100: 2000,
      120: 2200,
      150: 2500,
      200: 3000,
      400: 4500,
      500: 5500,
    },
    accessories: {
      service_cloud: 0,
      magnetic_filter_standard: 0,
      magnetic_filter_premium: 1200,
      circulation_pump: 800,
      pressure_reducer: 450,
      water_softener: 4900,
      foundation_concrete: 0,
      foundation_wall: 1200,
      foundation_composite: 1800,
      hydro_safety_standard: 0,
      hydro_safety_extended: 1500,
      flushing_standard: 800,
      flushing_premium: 1200,
    },
  };

  function calculatePumpPrice(pumpData, powerKw) {
    if (!pumpData || !powerKw) return 0;
    const powerRounded = Math.round(powerKw);
    const availablePowers = [3, 5, 7, 9, 12, 16];
    const closestPower = availablePowers.reduce((prev, curr) => {
      return Math.abs(curr - powerRounded) < Math.abs(prev - powerRounded) ? curr : prev;
    }, availablePowers[0]);
    const basePrice =
      PRICING_CATALOG.pumps.base[`${closestPower}kW`] || PRICING_CATALOG.pumps.base['7kW'];

    // Premium za AIO/T-CAP
    const optionId = pumpData.optionId || '';
    if (optionId.includes('aio') || optionId.includes('premium')) {
      return basePrice + PRICING_CATALOG.pumps.aio_premium;
    }
    if (optionId.includes('tcap')) {
      return basePrice + PRICING_CATALOG.pumps.tcap_premium;
    }
    return basePrice;
  }

  function calculateCwuPrice(optionId, capacity) {
    if (!optionId || !capacity) return 0;
    const material = optionId.includes('inox') ? 'inox' : 'emalia';
    const catalog = PRICING_CATALOG.cwu[material];
    if (!catalog) return 0;

    // Wyciągnij pojemność z optionId (np. "cwu-200" -> 200)
    const capacityMatch = optionId.match(/(\d+)/);
    const actualCapacity = capacityMatch ? Number(capacityMatch[1]) : capacity;

    const availableCapacities = Object.keys(catalog)
      .map(Number)
      .sort((a, b) => a - b);
    const closestCapacity = availableCapacities.reduce((prev, curr) => {
      return Math.abs(curr - actualCapacity) < Math.abs(prev - actualCapacity) ? curr : prev;
    }, availableCapacities[0]);
    return catalog[closestCapacity] || 0;
  }

  function calculateBufferPrice(optionId) {
    if (!optionId) return 0;
    const capacityMatch = optionId.match(/(\d+)/);
    if (!capacityMatch) return 0;
    const capacity = Number(capacityMatch[1]);

    const catalog = PRICING_CATALOG.buffer;
    const availableCapacities = Object.keys(catalog)
      .map(Number)
      .sort((a, b) => a - b);
    const closestCapacity = availableCapacities.reduce((prev, curr) => {
      return Math.abs(curr - capacity) < Math.abs(prev - capacity) ? curr : prev;
    }, availableCapacities[0]);
    return catalog[closestCapacity] || 0;
  }

  function calculateAccessoryPrice(optionId) {
    if (!optionId) return 0;

    // Mapowanie optionId na klucze z PRICING_CATALOG
    const mapping = {
      'cyrkulacja-tak': 'circulation_pump',
      'reduktor-tak': 'pressure_reducer',
      'woda-tak': 'water_softener',
      'posadowienie-sciana': 'foundation_wall',
      'posadowienie-eko': 'foundation_composite',
    };

    const catalogKey = mapping[optionId];
    return catalogKey ? PRICING_CATALOG.accessories[catalogKey] || 0 : 0;
  }

  function calculateTotalPrice() {
    let total = 0;

    // Pompa
    if (state.selectedPump && state.meta?.recommended_power_kw) {
      total += calculatePumpPrice(state.selectedPump, state.meta.recommended_power_kw);
    }

    // CWU
    const cwuSelection = state.selections.cwu;
    if (cwuSelection && cwuSelection.optionId) {
      const capacity = extractCapacityFromOptionId(cwuSelection.optionId);
      total += calculateCwuPrice(cwuSelection.optionId, capacity);
    }

    // Bufor
    const bufferSelection = state.selections.bufor;
    if (bufferSelection && bufferSelection.optionId) {
      total += calculateBufferPrice(bufferSelection.optionId);
    }

    // Akcesoria
    if (state.selections.cyrkulacja?.optionId === 'cyrkulacja-tak') {
      total += calculateAccessoryPrice('cyrkulacja-tak');
    }
    if (state.selections.reduktor?.optionId === 'reduktor-tak') {
      total += calculateAccessoryPrice('reduktor-tak');
    }
    if (state.selections.woda?.optionId === 'woda-tak') {
      total += calculateAccessoryPrice('woda-tak');
    }
    if (state.selections.posadowienie?.optionId === 'posadowienie-sciana') {
      total += calculateAccessoryPrice('posadowienie-sciana');
    } else if (state.selections.posadowienie?.optionId === 'posadowienie-eko') {
      total += calculateAccessoryPrice('posadowienie-eko');
    }

    state.pricing.total_netto_pln = total;
    state.pricing.total_brutto_pln = total * 1.23; // VAT 23%

    return total;
  }

  function buildPricingItems() {
    const items = [];

    // Pompa
    if (state.selectedPump && state.meta?.recommended_power_kw) {
      const price = calculatePumpPrice(state.selectedPump, state.meta.recommended_power_kw);
      if (price > 0) {
        items.push({
          name: `Pompa ciepła ${state.selectedPump.label || 'Split'} ${
            state.meta.recommended_power_kw
          } kW`,
          quantity: 1,
          unit_price_pln: price,
          total_pln: price,
        });
      }
    }

    // CWU
    const cwuSelection = state.selections.cwu;
    if (cwuSelection && cwuSelection.optionId) {
      const capacity = extractCapacityFromOptionId(cwuSelection.optionId);
      const price = calculateCwuPrice(cwuSelection.optionId, capacity);
      if (price > 0) {
        items.push({
          name: `Zasobnik CWU ${cwuSelection.label || capacity + 'L'}`,
          quantity: 1,
          unit_price_pln: price,
          total_pln: price,
        });
      }
    }

    // Bufor
    const bufferSelection = state.selections.bufor;
    if (bufferSelection && bufferSelection.optionId) {
      const price = calculateBufferPrice(bufferSelection.optionId);
      if (price > 0) {
        items.push({
          name: `Bufor CO ${bufferSelection.label || bufferSelection.optionId}`,
          quantity: 1,
          unit_price_pln: price,
          total_pln: price,
        });
      }
    }

    // Akcesoria
    if (state.selections.cyrkulacja?.optionId === 'cyrkulacja-tak') {
      items.push({
        name: 'Pompa cyrkulacyjna CWU',
        quantity: 1,
        unit_price_pln: 800,
        total_pln: 800,
      });
    }
    if (state.selections.reduktor?.optionId === 'reduktor-tak') {
      items.push({
        name: 'Reduktor ciśnienia',
        quantity: 1,
        unit_price_pln: 450,
        total_pln: 450,
      });
    }
    if (state.selections.woda?.optionId === 'woda-tak') {
      items.push({
        name: 'Stacja uzdatniania wody',
        quantity: 1,
        unit_price_pln: 4900,
        total_pln: 4900,
      });
    }
    if (state.selections.posadowienie?.optionId === 'posadowienie-sciana') {
      items.push({
        name: 'Konsola ścienna',
        quantity: 1,
        unit_price_pln: 1200,
        total_pln: 1200,
      });
    } else if (state.selections.posadowienie?.optionId === 'posadowienie-eko') {
      items.push({
        name: 'Podstawa kompozytowa',
        quantity: 1,
        unit_price_pln: 1800,
        total_pln: 1800,
      });
    }

    state.pricing.items = items;
    return items;
  }

  function formatPrice(price, showVat = false) {
    if (!price || price === 0) return showVat ? '0,00 zł (netto)' : 'W cenie';
    const netto = price;
    const brutto = price * 1.23;
    if (showVat) {
      return `${netto.toLocaleString('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} zł (netto) / ${brutto.toLocaleString('pl-PL', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} zł (brutto)`;
    }
    return `${netto.toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} zł`;
  }

  function extractCapacityFromOptionId(optionId) {
    const match = optionId.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  }

  /* ==========================================================================
     RULES ENGINE (z configurator.js - pełna wersja)
     ========================================================================== */

  const rulesEngine = {
    // CWU – decyzja o włączeniu + zalecana pojemność
    cwu(state) {
      const includeHot = !!state.meta?.include_hot_water;
      const persons = Number(state.meta?.hot_water_persons || state.meta?.cwu_people || 0);
      const profile = state.meta?.hot_water_usage || state.meta?.cwu_profile || null;
      const isAIO =
        state.selectedPump?.type === 'aio' ||
        state.selectedPump?.type === 'all-in-one' ||
        state.selectedPump?.optionId?.includes('aio');
      const enabled = includeHot && !isAIO;
      const required = includeHot && !isAIO;
      let recommendedCapacity = null;

      if (enabled) {
        if (persons > 0) {
          if (persons <= 2) recommendedCapacity = 150;
          else if (persons <= 4) recommendedCapacity = 200;
          else if (persons <= 6) recommendedCapacity = 250;
          else recommendedCapacity = 300;
        }

        let extra = 0;
        if (profile === 'shower_bath') {
          extra = 50;
        } else if (profile === 'bath') {
          extra = 100;
        }

        if (recommendedCapacity) {
          recommendedCapacity += extra;
          const allowed = [150, 200, 250, 300, 400, 500];
          recommendedCapacity = allowed.reduce((best, candidate) => {
            if (best === null) return candidate;
            return Math.abs(candidate - recommendedCapacity) < Math.abs(best - recommendedCapacity)
              ? candidate
              : best;
          }, null);
        }

        if (profile === 'bath' && persons >= 2) {
          if (!recommendedCapacity || recommendedCapacity < 200) {
            recommendedCapacity = 200;
          }
        }
      }

      return {
        enabled,
        required,
        recommendedCapacity,
      };
    },

    // BUFOR CO – wymagany / zakres (rozszerzona logika)
    buffer(state) {
      const pumpOptionId = state.selectedPump?.optionId;
      const pumpData = pumpOptionId ? pumpMatchingTable[pumpOptionId] : null;
      const pumpPhase = pumpData?.phase || state.selectedPump?.phase || null;
      const pumpPower = Number(
        pumpData?.power ||
          state.selectedPump?.power_kw ||
          state.meta?.recommended_power_kw ||
          state.meta?.power_total_kw ||
          state.meta?.max_heating_power ||
          0
      );
      const generation = state.meta?.generation || 'K';

      if (pumpPhase === 3 && [9, 12, 16].includes(pumpPower) && generation === 'K') {
        return {
          required: true,
          recommendedMin: 200,
          recommendedMax: 200,
          allowZeroBuffer: false,
          recommendedCapacity: 200,
          calculatedCapacity: 200,
        };
      }

      const ht = state.meta?.heating_type || state.meta?.installation_type || 'underfloor';
      const heatedArea = Number(state.meta?.heated_area || state.meta?.total_area || 0);
      const isAIO =
        state.selectedPump?.type === 'aio' ||
        state.selectedPump?.type === 'all-in-one' ||
        state.selectedPump?.optionId?.includes('aio');

      let required = false;
      let recommendedMin = 0;
      let recommendedMax = 200;
      let allowZeroBuffer = false;
      let recommendedCapacity = null;

      const constructionYear = Number(
        state.meta?.building_year || state.meta?.construction_year || 2020
      );
      const hasPreviousHeatSource = !!state.meta?.heat_source_prev;
      let skipKwCalculation = false;

      if (ht === 'underfloor' && constructionYear >= 2015 && !hasPreviousHeatSource) {
        recommendedCapacity = 0;
        allowZeroBuffer = true;
        required = false;
        skipKwCalculation = true;
      } else if (ht === 'mixed') {
        recommendedCapacity = 100;
        required = false;
        skipKwCalculation = true;
      } else if (ht === 'radiators') {
        recommendedCapacity = 100;
        required = true;
        skipKwCalculation = true;
      }

      if (skipKwCalculation) {
        return {
          required,
          recommendedMin: ht === 'underfloor' ? 0 : ht === 'mixed' ? 80 : 100,
          recommendedMax: ht === 'radiators' ? 200 : 120,
          allowZeroBuffer,
          recommendedCapacity,
          calculatedCapacity: recommendedCapacity,
        };
      }

      // Oblicz wymagany minimalny zład wody instalacji [l/kW]
      const capacityPerKw = {
        underfloor: 10,
        mixed: 15,
        radiators: 20,
      };
      const requiredWaterVolume = pumpPower * (capacityPerKw[ht] || capacityPerKw.mixed);

      // Oszacuj zład instalacji na podstawie powierzchni [l/m²]
      const systemVolumePerM2 = {
        underfloor: 1.1,
        mixed: 0.9,
        radiators: 0.65,
      };
      const estimatedSystemVolume = heatedArea * (systemVolumePerM2[ht] || systemVolumePerM2.mixed);

      // Decyzja o buforze: uzupełnienie brakującego zładu
      let bufferNeeded = 0;
      if (estimatedSystemVolume < requiredWaterVolume) {
        bufferNeeded = requiredWaterVolume - estimatedSystemVolume;
      }

      // Zaokrąglenie do dostępnych pojemności
      const availableCapacities = [50, 80, 100, 120, 150, 200, 400, 500];
      recommendedCapacity = availableCapacities.reduce((prev, curr) => {
        return Math.abs(curr - bufferNeeded) < Math.abs(prev - bufferNeeded) ? curr : prev;
      }, 0);

      // Logika wymagalności i zakresów
      if (ht === 'underfloor') {
        allowZeroBuffer = true;
        required = false;
        recommendedMin = 0;
        recommendedMax = Math.max(recommendedCapacity || 80, 120);
        if (isAIO && pumpPower < 7) {
          recommendedCapacity = 0;
          allowZeroBuffer = true;
        }
      } else if (ht === 'mixed') {
        allowZeroBuffer = false;
        required = false;
        recommendedMin = 80;
        recommendedMax = Math.max(recommendedCapacity || 100, 200);
      } else if (ht === 'radiators') {
        allowZeroBuffer = false;
        required = recommendedCapacity > 0;
        recommendedMin = 100;
        recommendedMax = Math.max(recommendedCapacity || 150, 200);
      }

      return {
        required,
        recommendedMin,
        recommendedMax,
        allowZeroBuffer,
        recommendedCapacity: recommendedCapacity || 0,
        calculatedCapacity: Math.round(bufferNeeded),
      };
    },

    // CYRKULACJA CWU
    circulation(state) {
      const includeHot = !!state.meta?.include_hot_water;
      const persons = Number(state.meta?.hot_water_persons || state.meta?.cwu_people || 0);
      const hotWaterUsage = state.meta?.hot_water_usage || state.meta?.cwu_profile || null;
      return {
        enabled: includeHot,
        recommended: persons >= 4 || hotWaterUsage === 'comfort',
      };
    },

    // SERVICE CLOUD
    serviceCloud(state) {
      const generation = state.meta?.generation || 'K';
      return {
        enabled: generation === 'K',
        aiDiagnosticsEnabled: generation === 'K',
      };
    },

    // FILTRY / ZABEZPIECZENIA HYDRAULICZNE
    hydraulics(state) {
      const year = Number(state.meta?.building_year || state.meta?.construction_year || 2020);
      const modernized = !!state.meta?.heat_source_prev;
      const autoSelectMagnet = modernized || year < 1990;
      const requireFlush = modernized || year < 2005;
      const recommendFlush = !requireFlush && year >= 2005 && year < 2015;
      return {
        autoSelectMagnet,
        requireFlush,
        recommendFlush,
      };
    },

    // POSADOWIENIE JEDNOSTKI ZEWNĘTRZNEJ
    mounting(selectedPump, state) {
      const buildingType = state.meta?.building_type || 'single_house';
      const weight = Number(selectedPump?.weight || 70);
      const allowedWall = buildingType !== 'apartment' && weight <= 65;
      const warnWall = weight > 65;
      return {
        allowedWall,
        warnWall,
      };
    },

    // ELEKTRYKA
    electric(selectedPump, state) {
      const totalPower = Number((state.meta?.power_total_kw ?? state.meta?.max_heating_power) || 0);
      const hasThreePhase = !!state.meta?.has_three_phase;
      const requires3F = selectedPump?.requires3F || selectedPump?.minPhase === 3;
      const requiresUpgrade = totalPower > 9;
      const phaseOK = !requires3F || hasThreePhase;
      return {
        requiresUpgrade,
        phaseOK,
      };
    },

    // UZDATNIANIE WODY
    water(state) {
      return { recommendSoftener: true };
    },

    // PŁUKANIE / CHEMIA
    flushing(state) {
      const year = Number(state.meta?.building_year || state.meta?.construction_year || 2020);
      const requireFlush = year < 2005;
      const recommendFlush = year >= 2005 && year < 2015;
      return { requireFlush, recommendFlush };
    },

    // PODSUMOWANIE KOMPLETNOŚCI MASZYNOWNI
    summary(state, derived) {
      const missing = [];
      if (!state.selections.pompa) missing.push('Pompa');
      if (derived.cwuRules.required && !state.selections.cwu) {
        missing.push('Zasobnik CWU');
      }
      if (derived.bufferRules.required && !state.selections.bufor) {
        missing.push('Bufor CO');
      }
      return {
        complete: missing.length === 0,
        missing,
      };
    },
  };

  // UICallbacks - operacje na DOM
  const UICallbacks = {
    setSectionEnabled(sectionKey, isEnabled) {
      const step = document.querySelector(`[data-step-key="${sectionKey}"]`);
      if (!step) return;
      step.classList.toggle('section-disabled', !isEnabled);
      step.querySelectorAll('.option-card').forEach(card => {
        card.classList.toggle('disabled', !isEnabled);
        if (!isEnabled) card.classList.remove('selected');
      });
    },

    setSectionRequired(sectionKey, isRequired) {
      const step = document.querySelector(`[data-step-key="${sectionKey}"]`);
      if (!step) return;
      step.classList.toggle('section-required', !!isRequired);
    },

    markRecommended(sectionKey, recommendedValue) {
      if (!recommendedValue) return;
      const step = document.querySelector(`[data-step-key="${sectionKey}"]`);
      if (!step) return;
      step.querySelectorAll('.option-card').forEach(card => {
        const optionId = card.getAttribute('data-option-id') || '';
        const capacity = extractCapacityFromOptionId(optionId);
        card.classList.toggle('recommended', capacity === Number(recommendedValue));
      });
    },

    autoSelect(optionKey) {
      const card = document.querySelector(`[data-option-id="${optionKey}"]`);
      if (!card) return;
      if (!card.classList.contains('selected')) {
        card.classList.add('selected');
        captureSelectionForCard(card);
      }
    },

    forceSelect(optionKey) {
      const card = document.querySelector(`[data-option-id="${optionKey}"]`);
      if (!card) return;
      card.classList.add('selected', 'forced');
      captureSelectionForCard(card);
    },

    warnOnOption(optionKey, condition) {
      const card = document.querySelector(`[data-option-id="${optionKey}"]`);
      if (!card) return;
      card.classList.toggle('warn', !!condition);
    },
  };

  function evaluateRules() {
    if (!state.meta) return null;

    const cwuRules = rulesEngine.cwu(state);
    const bufferRules = rulesEngine.buffer(state);
    const circulationRules = rulesEngine.circulation(state);
    const scRules = rulesEngine.serviceCloud(state);
    const hydraulicsRules = rulesEngine.hydraulics(state);
    const mountingRules = rulesEngine.mounting(state.selectedPump, state);
    const electricRules = rulesEngine.electric(state.selectedPump, state);
    const waterRules = rulesEngine.water(state);
    const flushingRules = rulesEngine.flushing(state);
    const summary = rulesEngine.summary(state, {
      cwuRules,
      bufferRules,
      hydraulicsRules,
      flushingRules,
    });

    return {
      cwuRules,
      bufferRules,
      circulationRules,
      scRules,
      hydraulicsRules,
      mountingRules,
      electricRules,
      waterRules,
      flushingRules,
      summary,
    };
  }

  function applyRulesToUI(evaluated) {
    if (!evaluated) return;

    // CWU
    UICallbacks.setSectionEnabled('cwu', evaluated.cwuRules.enabled);
    if (evaluated.cwuRules.recommendedCapacity) {
      UICallbacks.markRecommended('cwu', evaluated.cwuRules.recommendedCapacity);
    }

    // Bufor
    UICallbacks.setSectionRequired('bufor', evaluated.bufferRules.required);

    // Cyrkulacja
    UICallbacks.setSectionEnabled('cyrkulacja', evaluated.circulationRules.enabled);

    // Service Cloud
    UICallbacks.setSectionEnabled('service', evaluated.scRules.enabled);

    // Hydraulika - auto-select filtr jeśli wymagane
    if (evaluated.hydraulicsRules.autoSelectMagnet) {
      UICallbacks.autoSelect('filter-basic');
    }

    // Posadowienie - warning dla ściany
    if (evaluated.mountingRules.warnWall) {
      UICallbacks.warnOnOption('posadowienie-sciana', true);
    }
    UICallbacks.setSectionEnabled('posadowienie', evaluated.mountingRules.allowedWall);

    // Uzdatnianie - rekomenduj
    if (evaluated.waterRules.recommendSoftener) {
      UICallbacks.autoSelect('woda-tak');
    }
  }

  // Funkcja recompute do przeliczania reguł (z configurator.js)
  function recompute() {
    window.configuratorState = state;
    const evaluated = evaluateRules();
    applyRulesToUI(evaluated);
    updateSummary();
    exposeSelectionOnWindow();
  }

  // Eksport recompute globalnie
  try {
    window.configuratorRecompute = recompute;
  } catch (e) {
    console.warn('[Configurator] ⚠️ Nie udało się wystawić window.configuratorRecompute', e);
  }

  /* ==========================================================================
     DATA EXPORT (z configurator.js)
     ========================================================================== */

  function exposeSelectionOnWindow() {
    const totalPrice = calculateTotalPrice();
    const pricingItems = buildPricingItems();

    const payload = {
      meta: state.meta,
      selections: state.selections,
      products: {
        pump: state.selectedPump || null,
        cwu: state.selections.cwu || null,
        buffer: state.selections.bufor || null,
      },
      pricing: {
        total_netto_pln: state.pricing.total_netto_pln,
        total_brutto_pln: state.pricing.total_brutto_pln,
        items: pricingItems,
      },
    };

    try {
      window.configuratorSelection = payload;
      if (window.lastCalculationResult && typeof window.lastCalculationResult === 'object') {
        window.lastCalculationResult = {
          ...window.lastCalculationResult,
          configurator: payload,
        };
      }
      console.log('[Configurator] ✅ Dane wyeksportowane do window.configuratorSelection');
    } catch (e) {
      console.warn('[Configurator] ⚠️ Nie udało się zaktualizować window.configuratorSelection', e);
    }
  }

  /* ==========================================================================
     HELPER FUNCTIONS (z configurator.js)
     ========================================================================== */

  function getSummaryIcon(key) {
    const icons = {
      meta: 'ri-bar-chart-fill',
      pump_variant: 'ri-settings-5-fill',
      pompa: 'ri-settings-5-fill',
      cwu: 'ri-showers-fill',
      buffer: 'ri-drop-fill',
      bufor: 'ri-drop-fill',
      circulation: 'ri-refresh-fill',
      cyrkulacja: 'ri-refresh-fill',
      service_cloud: 'ri-cloud-fill',
      service: 'ri-cloud-fill',
      magnetic_filter: 'ri-magnet-fill',
      hydro_safety: 'ri-shield-fill',
      foundation: 'ri-building-fill',
      posadowienie: 'ri-building-fill',
      reducer: 'ri-scale-fill',
      reduktor: 'ri-scale-fill',
      softener: 'ri-drop-fill',
      woda: 'ri-drop-fill',
      flushing: 'ri-sparkling-fill',
      electrical: 'ri-flashlight-fill',
    };
    return icons[key] || 'ri-check-fill';
  }

  function getSummaryKeyFromLabel(label) {
    const map = {
      Pompa: 'pompa',
      'Zasobnik CWU': 'cwu',
      'Bufor CO': 'bufor',
      'Cyrkulacja CWU': 'cyrkulacja',
      'Service Cloud': 'service',
      'Posadowienie jednostki zewnętrznej': 'posadowienie',
      'Reduktor ciśnienia': 'reduktor',
      'Stacja uzdatniania wody': 'woda',
    };
    return map[label] || '';
  }

  // Formatowanie mocy w kW
  function formatPower(v) {
    if (!v || v === 0) return '—';
    return `${v.toFixed(1)} kW`;
  }

  // Rozwiązuje produkt CWU na podstawie typu i pojemności (z configurator.js)
  function resolveCwuProduct(cwuData, typeId, capacity) {
    if (!cwuData || !typeId || capacity === null || typeof capacity === 'undefined') {
      return null;
    }
    // Nowa struktura: types[].products[]
    if (cwuData.types) {
      const type = cwuData.types.find(t => t.id === typeId);
      if (type && type.products) {
        const product = type.products.find(p => p.capacity === Number(capacity));
        if (product)
          return { ...product, typeId, capacity_l: product.capacity_l ?? Number(capacity) };
      }
    }
    // Stara struktura: catalog[typeId][capacity]
    if (cwuData.catalog) {
      const typeCatalog = cwuData.catalog[typeId];
      if (typeCatalog) {
        const key = String(capacity);
        const product = typeCatalog[key];
        if (product) {
          return {
            ...product,
            typeId,
            capacity_l: product.capacity_l ?? Number(capacity),
          };
        }
      }
    }
    return null;
  }

  // Rozwiązuje produkt bufora na podstawie pojemności (z configurator.js)
  function resolveBufferProduct(bufferData, capacity) {
    if (!bufferData || capacity === null || typeof capacity === 'undefined') {
      return null;
    }
    // Nowa struktura: products[]
    if (bufferData.products) {
      const product = bufferData.products.find(p => p.capacity === Number(capacity));
      if (product) return { ...product, capacity_l: product.capacity_l ?? Number(capacity) };
    }
    // Stara struktura: catalog[capacity]
    if (bufferData.catalog) {
      const key = String(capacity);
      const product = bufferData.catalog[key];
      if (product) {
        return {
          ...product,
          capacity_l: product.capacity_l ?? Number(capacity),
        };
      }
    }
    return null;
  }

  // Pełna funkcja budująca wiersze podsumowania (z configurator.js)
  function buildSummaryRows(state) {
    const rows = [];
    if (!state || !state.selections || !state.data || !state.meta) return rows;

    const { selections, data, meta } = state;

    // Pompa – wariant
    if (selections.pompa && selections.pompa.label) {
      rows.push({
        key: 'pump_variant',
        label: 'Pompa ciepła',
        value: selections.pompa.label,
        badge: '',
      });
    } else if (state.selectedPump && state.selectedPump.label) {
      rows.push({
        key: 'pump_variant',
        label: 'Pompa ciepła',
        value: state.selectedPump.label,
        badge: '',
      });
    }

    // CWU - nowa struktura (typ + pojemność)
    let cwuValue = 'Nie wybrano';
    if (selections.cwu) {
      // Unified używa obiektu z optionId i label
      if (selections.cwu.label) {
        cwuValue = selections.cwu.label;
      } else if (typeof selections.cwu === 'string') {
        // Fallback dla starej struktury stringowej
        const cwuData = data.cwuOptions;
        if (cwuData && !cwuData.disabled) {
          const parts = selections.cwu.split('-');
          if (parts.length >= 3) {
            const typeId = parts.slice(0, 2).join('-');
            const capacity = parts[2];
            const type = cwuData.types?.find(t => t.id === typeId);
            const product = resolveCwuProduct(cwuData, typeId, capacity);
            if (product && product.label) {
              cwuValue = product.label;
            } else if (type) {
              cwuValue = `${type.title} ${capacity} l`;
            } else {
              cwuValue = `Zasobnik ${capacity} l`;
            }
          }
        } else if (cwuData && cwuData.disabled) {
          cwuValue = 'Wyłączone (pompa AIO)';
        }
      }
    }
    rows.push({
      key: 'cwu',
      label: 'Zasobnik CWU',
      value: cwuValue,
      badge: '',
    });

    // Bufor
    let bufferValue = 'Nie wybrano';
    if (selections.bufor) {
      if (selections.bufor.label) {
        bufferValue = selections.bufor.label;
      } else if (typeof selections.bufor === 'string') {
        const capacityMatch = selections.bufor.match(/buffer-(\d+)/);
        const capacity = capacityMatch ? Number(capacityMatch[1]) : null;
        if (capacity && data.bufferConfig) {
          const product = resolveBufferProduct(data.bufferConfig, capacity);
          if (product?.label) {
            bufferValue = product.label;
          } else {
            bufferValue = `Bufor ${capacity} l`;
          }
        }
      }
    }
    rows.push({
      key: 'buffer',
      label: 'Bufor / sprzęgło',
      value: bufferValue,
      badge: '',
    });

    // Cyrkulacja
    const cyrOpt = data.circulationOptions?.find(
      o => o.id === selections.cyrkulacja?.optionId || selections.cyrkulacja === o.id
    );
    rows.push({
      key: 'circulation',
      label: 'Cyrkulacja CWU',
      value: cyrOpt ? cyrOpt.label : selections.cyrkulacja?.label || 'Nie wybrano',
      badge: '',
    });

    // Service Cloud
    const svcOpt = data.serviceCloudOptions?.find(
      o => o.id === selections.service?.optionId || selections.service === o.id
    );
    rows.push({
      key: 'service_cloud',
      label: 'Service Cloud',
      value: svcOpt ? svcOpt.label : selections.service?.label || 'Włączone (domyślnie)',
      badge: '',
    });

    // Filtr magnetyczny
    const filtOpt = data.magneticFilterOptions?.find(
      o => o.id === selections.magnetic_filter?.optionId || selections.magnetic_filter === o.id
    );
    rows.push({
      key: 'magnetic_filter',
      label: 'Filtr magnetyczny',
      value: filtOpt ? filtOpt.label : selections.magnetic_filter?.label || 'Nie wybrano',
      badge: '',
    });

    // Zabezpieczenia hydrauliczne
    const hydOpt = data.hydroSafetyOptions?.find(
      o => o.id === selections.hydro_safety?.optionId || selections.hydro_safety === o.id
    );
    rows.push({
      key: 'hydro_safety',
      label: 'Zabezpieczenia hydrauliczne',
      value: hydOpt ? hydOpt.label : selections.hydro_safety?.label || 'Nie wybrano',
      badge: '',
    });

    // Posadowienie
    const fundOpt = data.foundationOptions?.find(
      o => o.id === selections.posadowienie?.optionId || selections.posadowienie === o.id
    );
    rows.push({
      key: 'foundation',
      label: 'Posadowienie jednostki zewnętrznej',
      value: fundOpt ? fundOpt.label : selections.posadowienie?.label || 'Nie wybrano',
      badge: '',
    });

    // Reduktor ciśnienia
    const redOpt = data.reducerOptions?.find(
      o => o.id === selections.reduktor?.optionId || selections.reduktor === o.id
    );
    rows.push({
      key: 'reducer',
      label: 'Reduktor ciśnienia',
      value: redOpt ? redOpt.label : selections.reduktor?.label || 'Nie wybrano',
      badge: '',
    });

    // Stacja uzdatniania
    const softOpt = data.softenerOptions?.find(
      o => o.id === selections.woda?.optionId || selections.woda === o.id
    );
    rows.push({
      key: 'softener',
      label: 'Stacja uzdatniania wody',
      value: softOpt ? softOpt.label : selections.woda?.label || 'Nie wybrano',
      badge: '',
    });

    // Płukanie
    const flushOpt = data.flushingOptions?.find(
      o => o.id === selections.flushing?.optionId || selections.flushing === o.id
    );
    rows.push({
      key: 'flushing',
      label: 'Płukanie instalacji + inhibitor',
      value: flushOpt ? flushOpt.label : selections.flushing?.label || 'Nie wybrano',
      badge: '',
    });

    // Zasilanie elektryczne
    const elOpt = data.electricalOptions?.find(
      o => o.id === selections.electrical?.optionId || selections.electrical === o.id
    );
    rows.push({
      key: 'electrical',
      label: 'Zasilanie elektryczne',
      value: elOpt ? elOpt.label : selections.electrical?.label || 'Informacyjnie',
      badge: '',
    });

    // Dane meta – powierzchnia / moc
    if (meta.heated_area || meta.power_total_kw) {
      rows.unshift({
        key: 'meta',
        label: 'Profil budynku',
        value: [
          meta.heated_area
            ? `${meta.heated_area.toFixed ? meta.heated_area.toFixed(0) : meta.heated_area} m²`
            : null,
          meta.power_total_kw
            ? `${
                meta.power_total_kw.toFixed ? meta.power_total_kw.toFixed(1) : meta.power_total_kw
              } kW`
            : null,
        ]
          .filter(Boolean)
          .join(' · '),
        badge: '',
      });
    }

    return rows;
  }

  // Auto-wybór początkowy (z configurator.js)
  function applyInitialAutoSelection(state, selectCardProgrammatically) {
    if (!state || !state.data || !state.meta) return;
    const { meta, data, selections } = state;

    // Service Cloud – zawsze auto-select (obowiązkowe)
    if (!selections.service || !selections.service.optionId) {
      if (typeof selectCardProgrammatically === 'function') {
        selectCardProgrammatically('service', 'service-cloud');
      }
    }

    // Zasobnik CWU – ustaw rekomendowaną pojemność + typ domyślny
    if (!selections.cwu || !selections.cwu.optionId) {
      const cwuData = data.cwuOptions;
      if (cwuData && !cwuData.disabled) {
        const defaultTypeId = cwuData.defaultTypeId || cwuData.types?.[0]?.id || 'cwu-emalia';
        const defaultCapacity =
          cwuData.recommendedCapacity ||
          (Array.isArray(cwuData.capacities) ? cwuData.capacities[0] : null);
        if (defaultTypeId && defaultCapacity && typeof selectCardProgrammatically === 'function') {
          selectCardProgrammatically('cwu', `${defaultTypeId}-${defaultCapacity}`);
        }
      }
    }

    // Bufor CO – prosty dobór wg typu instalacji
    if (!selections.bufor || !selections.bufor.optionId) {
      const bufferData = data.bufferConfig;
      if (bufferData && typeof selectCardProgrammatically === 'function') {
        const initialCapacity = bufferData.recommendedCapacity || bufferData.capacities?.[0];
        if (initialCapacity) {
          selectCardProgrammatically('bufor', `buffer-${initialCapacity}`);
        }
      }
    }
  }

  /* ==========================================================================
     NAVIGATION & UI HELPERS (z configurator-new.js)
     ========================================================================== */

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* ==========================================================================
     STICKY SELECTIONS BAR - Aktualizacja wybranych komponentów
     ========================================================================== */

  function updateSelectionsBar(stepKey, displayLabel) {
    // Mapowanie stepKey → data-type w sticky pasku
    const typeMapping = {
      pompa: 'pompa',
      cwu: 'cwu',
      bufor: 'bufor',
      cyrkulacja: 'cyrkulacja',
      service: 'service',
      posadowienie: 'posadowienie',
      reduktor: 'reduktor',
      woda: 'uzdatnianie',
    };

    const dataType = typeMapping[stepKey];
    if (!dataType) return;

    const selectionItem = document.querySelector(`.selection-item[data-type="${dataType}"]`);
    if (!selectionItem) return;

    const valueEl = selectionItem.querySelector('.selection-value');
    if (!valueEl) return;

    // Skróć zbyt długie nazwy (max 30 znaków)
    let shortLabel = displayLabel || '—';
    if (shortLabel.length > 30) {
      shortLabel = shortLabel.substring(0, 27) + '...';
    }

    valueEl.textContent = shortLabel;
    valueEl.removeAttribute('data-empty');
  }

  function captureSelectionForCard(card) {
    const stepSection = card.closest('.config-step');
    if (!stepSection) return;

    const stepKey = stepSection.dataset.stepKey;
    if (!stepKey) return;

    const optionId = card.getAttribute('data-option-id') || null;
    // Dla product-card użyj product-title, dla option-card użyj option-title
    const titleEl = card.querySelector('.product-title') || card.querySelector('.option-title');
    const label = titleEl ? titleEl.textContent.trim() : optionId || '';

    // Usuń selekcję z innych kart w tym kroku (obsługuj oba typy kart)
    stepSection.querySelectorAll('.option-card.selected, .product-card.selected').forEach(c => {
      if (c !== card) c.classList.remove('selected');
    });

    card.classList.add('selected');

    // Zapisz w state
    state.selections[stepKey] = {
      optionId,
      label,
    };

    // Aktualizuj sticky pasek z wybranymi komponentami
    updateSelectionsBar(stepKey, label);

    // Aktualizuj selectedPump jeśli to pompa
    if (stepKey === 'pompa') {
      state.selectedPump = {
        optionId,
        label,
        type: optionId?.includes('aio') ? 'all-in-one' : 'split',
        power_kw: state.meta?.recommended_power_kw || null,
      };
    }

    // Przelicz reguły i ceny
    const evaluated = evaluateRules();
    applyRulesToUI(evaluated);
    calculateTotalPrice();
    buildPricingItems();

    // Zaktualizuj podsumowanie
    updateSummary();

    // Eksportuj dane
    exposeSelectionOnWindow();
  }

  function showStep(index, noScroll = false) {
    currentStepIndex = clamp(index, 0, totalSteps - 1);
    console.log('[Configurator] 📍 Krok', currentStepIndex + 1, 'z', totalSteps);

    if (steps.length === 0) {
      console.error('[Configurator] ❌ Brak kroków!');
      return;
    }

    steps.forEach((step, i) => {
      if (i === currentStepIndex) {
        step.classList.add('active');
        step.style.display = 'block';
      } else {
        step.classList.remove('active');
        step.style.display = 'none';
      }
    });

    if (currentStepNumberEl) {
      currentStepNumberEl.textContent = String(currentStepIndex + 1);
    }
    if (totalStepsNumberEl) {
      totalStepsNumberEl.textContent = String(totalSteps);
    }

    updateNavButtons();

    // Scroll TYLKO jeśli faktycznie nawigujemy po krokach (nie przy pierwszym pokazaniu)
    if (!noScroll) {
      const activeStep = steps[currentStepIndex];
      if (activeStep) {
        setTimeout(() => {
          activeStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    }
  }

  function updateNavButtons() {
    if (navPrev) {
      navPrev.disabled = currentStepIndex === 0;
    }
    if (navNext) {
      if (currentStepIndex === totalSteps - 1) {
        navNext.textContent = 'Zakończ';
        navNext.disabled = true;
      } else {
        navNext.textContent = 'Dalej →';
        navNext.disabled = false;
      }
    }
  }

  function updateSummary() {
    if (!summaryBody) return;

    summaryBody.innerHTML = '';

    summaryConfig.forEach(rowCfg => {
      const tr = document.createElement('tr');

      const tdTitle = document.createElement('td');
      tdTitle.className = 'section-title';
      tdTitle.innerHTML = `<i class="${rowCfg.icon}" aria-hidden="true"></i> ${rowCfg.label}`;

      const tdValue = document.createElement('td');
      tdValue.className = 'section-value';

      const tdStatus = document.createElement('td');
      tdStatus.className = 'section-status';

      const sel = state.selections[rowCfg.stepKey];

      if (sel && sel.label) {
        tdValue.textContent = sel.label;
        const statusBadge = document.createElement('span');
        statusBadge.className = 'status-selected';
        statusBadge.textContent = '✓ Wybrano';
        tdStatus.appendChild(statusBadge);
      } else {
        tdValue.textContent = 'Nie wybrano';
        tdStatus.textContent = '—';
      }

      tr.appendChild(tdTitle);
      tr.appendChild(tdValue);
      tr.appendChild(tdStatus);
      summaryBody.appendChild(tr);
    });

    // Dodaj wiersz z ceną całkowitą
    const totalRow = document.createElement('tr');
    totalRow.className = 'summary-total-row';
    const totalTitle = document.createElement('td');
    totalTitle.className = 'section-title';
    totalTitle.colSpan = 2;
    totalTitle.innerHTML = '<strong>Cena całkowita (netto):</strong>';
    const totalValue = document.createElement('td');
    totalValue.className = 'section-value';
    totalValue.innerHTML = `<strong>${formatPrice(state.pricing.total_netto_pln)}</strong>`;
    totalRow.appendChild(totalTitle);
    totalRow.appendChild(totalValue);
    summaryBody.appendChild(totalRow);

    // Dodaj status kompletności (jeśli jest element banner)
    const evaluated = evaluateRules();
    if (evaluated && evaluated.summary) {
      const banner = document.querySelector('#config-summary-status');
      if (banner) {
        if (evaluated.summary.complete) {
          banner.className = 'summary-banner summary-banner--complete';
          banner.innerHTML = `
            <div class="summary-banner-icon">✅</div>
            <div class="summary-banner-content">
              <strong>Maszynownia skompletowana technicznie</strong>
              <p>Możesz wygenerować ofertę PDF i przesłać zapytanie.</p>
            </div>
          `;
        } else {
          banner.className = 'summary-banner summary-banner--incomplete';
          const missingCount = evaluated.summary.missing.length;
          banner.innerHTML = `
            <div class="summary-banner-icon">⚠️</div>
            <div class="summary-banner-content">
              <strong>Brakuje jeszcze ${missingCount} element${
            missingCount === 1 ? '' : missingCount < 5 ? 'y' : 'ów'
          }</strong>
              <p>Uzupełnij je, aby instalacja spełniała standard serwisowy i gwarancyjny.</p>
            </div>
          `;
        }
      }
    }
  }

  /* ==========================================================================
     EVENT BINDING (z configurator-new.js)
     ========================================================================== */

  function bindCardClicks() {
    const stepsContainer = document.getElementById('configurator-steps');
    if (!stepsContainer) {
      console.warn('[Configurator] ⚠️ Brak #configurator-steps');
      return;
    }

    if (cardClickHandler) {
      stepsContainer.removeEventListener('click', cardClickHandler);
    }

    cardClickHandler = function (e) {
      // Obsługuj zarówno option-card jak i product-card
      const card = e.target.closest('.option-card') || e.target.closest('.product-card');
      if (!card || card.classList.contains('disabled')) return;

      console.log('[Configurator] 🖱️ Kliknięcie:', card.dataset.optionId);
      captureSelectionForCard(card);
    };

    stepsContainer.addEventListener('click', cardClickHandler);
    console.log('[Configurator] ✅ Kliknięcia kart podłączone');
  }

  function bindNavigation() {
    const app = document.getElementById('configurator-app');
    if (!app) {
      console.warn('[Configurator] ⚠️ Brak #configurator-app');
      return;
    }

    if (navClickHandler) {
      app.removeEventListener('click', navClickHandler);
    }

    navClickHandler = function (e) {
      // Zapobiegaj domyślnemu zachowaniu (przeładowanie strony)
      if (
        e.target.id === 'nav-prev' ||
        e.target.closest('#nav-prev') ||
        e.target.id === 'nav-next' ||
        e.target.closest('#nav-next')
      ) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (e.target.id === 'nav-prev' || e.target.closest('#nav-prev')) {
        if (currentStepIndex > 0) {
          showStep(currentStepIndex - 1);
        }
      } else if (e.target.id === 'nav-next' || e.target.closest('#nav-next')) {
        if (currentStepIndex < totalSteps - 1) {
          showStep(currentStepIndex + 1);
        }
      }
    };

    app.addEventListener('click', navClickHandler);
    console.log('[Configurator] ✅ Nawigacja podłączona');
  }

  function bindSummaryActions() {
    const app = document.getElementById('configurator-app');
    if (!app) return;

    if (summaryClickHandler) {
      app.removeEventListener('click', summaryClickHandler);
    }

    summaryClickHandler = function (e) {
      const action =
        e.target.getAttribute('data-action') ||
        (e.target.closest('[data-action]') &&
          e.target.closest('[data-action]').getAttribute('data-action'));

      if (!action) return;

      if (action === 'back-to-config') {
        const normalSteps = steps.filter(step => step.dataset.stepKey !== 'summary');
        const lastNormal = normalSteps[normalSteps.length - 1];
        const idx = steps.indexOf(lastNormal);
        if (idx !== -1) showStep(idx);
      } else if (action === 'download-pdf') {
        if (window.downloadPDF && typeof window.downloadPDF === 'function') {
          window.downloadPDF();
        }
      } else if (action === 'send-email') {
        if (window.showPDFContactForm && typeof window.showPDFContactForm === 'function') {
          window.showPDFContactForm();
        }
      } else if (action === 'print') {
        window.print();
      }
    };

    app.addEventListener('click', summaryClickHandler);
  }

  /* ==========================================================================
     PUMP CARD RENDERING (nowa funkcjonalność)
     ========================================================================== */

  // Renderuje kartę pompy z pełnymi danymi z panasonic.json
  function renderPumpCard(pumpProfile, panasonicData, isRecommended = false) {
    if (!pumpProfile) return '';

    const dbData = panasonicData || {};
    const cop = dbData.heating?.A7W35_COP || null;
    const copStr = cop ? `${cop.toFixed(1)} (A7/W35)` : '—';
    const refrigerant = dbData.refrigerant || 'R32';
    const soundDb = dbData.outdoor_unit?.sound_dB || null;
    const dimensions = dbData.outdoor_unit?.dimensions_mm;
    const dimStr = dimensions ? `${dimensions.w}×${dimensions.d}×${dimensions.h}` : '—';

    // Dla AIO - pokaż pojemność CWU
    const cwuTank = pumpProfile.cwu_tank || (pumpProfile.type === 'all-in-one' ? 185 : null);

    const typeLabel =
      pumpProfile.type === 'split'
        ? 'Pompa ciepła typu Split'
        : 'Pompa ciepła ze zintegrowanym zasobnikiem';

    const title =
      pumpProfile.type === 'split'
        ? `Panasonic Aquarea ${pumpProfile.power_kw}kW`
        : `Panasonic Aquarea All-in-One ${pumpProfile.power_kw}kW`;

    const description =
      pumpProfile.type === 'split'
        ? 'System dzielony z jednostką wewnętrzną i zewnętrzną. Elastyczny montaż.'
        : `Kompaktowe rozwiązanie z wbudowanym zasobnikiem CWU ${cwuTank || 185}L.`;

    const price = calculatePumpPrice(pumpProfile, pumpProfile.power_kw);
    const priceStr = price > 0 ? price.toLocaleString('pl-PL') : '—';

    const selectedClass = isRecommended ? 'selected' : '';
    const recommendedBadge = isRecommended
      ? '<div class="badge-recommended">★ Rekomendowane</div>'
      : '';
    const refrigerantBadge = refrigerant
      ? `<div class="refrigerant-badge">${refrigerant} REFRIGERANT</div>`
      : '';

    return `
      <div class="product-card ${selectedClass}" data-option-id="${
      pumpProfile.id
    }" data-pump-model="${pumpProfile.model || ''}">
        <div class="product-image">
          <img src="${pumpProfile.image || '../img/split-k.png'}" alt="${title}" />
          ${recommendedBadge}
          ${refrigerantBadge}
        </div>
        <div class="product-content">
          <div class="product-subtitle">${typeLabel}</div>
          <h4 class="product-title">${title}</h4>
          <p class="product-description">${description}</p>
          <div class="specs-list">
            <div class="spec-row">
              <span class="spec-label">Moc grzewcza</span>
              <span class="spec-value">${pumpProfile.power_kw} kW</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">COP</span>
              <span class="spec-value">${copStr}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Czynnik</span>
              <span class="spec-value">${refrigerant}</span>
            </div>
            ${
              soundDb
                ? `
            <div class="spec-row">
              <span class="spec-label">Poziom hałasu</span>
              <span class="spec-value">${soundDb} dB</span>
            </div>
            `
                : ''
            }
            ${
              cwuTank
                ? `
            <div class="spec-row">
              <span class="spec-label">Zasobnik CWU</span>
              <span class="spec-value">${cwuTank} L</span>
            </div>
            `
                : ''
            }
            ${
              dimensions
                ? `
            <div class="spec-row">
              <span class="spec-label">Wymiary</span>
              <span class="spec-value">${dimStr}</span>
            </div>
            `
                : ''
            }
          </div>
          <div class="product-price">
            <span class="price-value">${priceStr}</span>
            <span class="price-currency">PLN</span>
          </div>
        </div>
      </div>
    `;
  }

  // Renderuje sekcję pompy z 2 kartami (Split + AIO)
  async function renderPumpSection(pumpProfiles) {
    if (!pumpProfiles || pumpProfiles.length === 0) {
      console.warn('[Configurator] Brak profili pomp do renderowania');
      return '';
    }

    // Załaduj panasonic.json jeśli jeszcze nie załadowany
    if (!panasonicDB) {
      await loadPanasonicDB();
    }

    const splitProfile =
      pumpProfiles.find(p => p.type === 'split' && p.id === 'hp') || pumpProfiles[0];
    const aioProfile = pumpProfiles.find(p => p.type === 'all-in-one' && p.id === 'aio');

    if (!splitProfile) {
      console.warn('[Configurator] Brak profilu Split');
      return '';
    }

    // Pobierz dane z panasonic.json
    const splitData = getPumpDataFromDB(splitProfile.model);
    const aioData = aioProfile ? getPumpDataFromDB(aioProfile.model) : null;

    const splitCard = renderPumpCard(splitProfile, splitData, true);
    const aioCard =
      aioProfile && !aioProfile.disabled ? renderPumpCard(aioProfile, aioData, false) : '';

    const recommendedPower = state.meta?.recommended_power_kw || splitProfile.power_kw;

    return `
      <div class="section-container">
        <div class="section-header">
          <div class="section-header-content">
            <div class="section-icon">⚡</div>
            <div>
              <h2 class="section-title">Pompa ciepła</h2>
              <p class="section-description">Na podstawie obliczeń rekomendujemy pompę o mocy ${recommendedPower} kW. Wybierz preferowany model.</p>
            </div>
          </div>
        </div>
        <div class="options-grid">
          ${splitCard}
          ${aioCard}
        </div>
        <div class="recommendation-note">
          <p><strong>Wynik kalkulacji:</strong> Rekomendowana wartość to <strong>${recommendedPower} kW</strong></p>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     CWU CARD RENDERING (nowa funkcjonalność)
     ========================================================================== */

  // Dane o zasobnikach CWU
  const cwuData = {
    emalia: {
      name: 'Galmet SG(S)',
      material: 'Emalia',
      anode: 'Magnezowa',
      warranty: '5 lat',
      description: 'Sprawdzony zbiornik z wewnętrzną powłoką emaliowaną. Ekonomiczne rozwiązanie.',
      image: '../img/cwu-emalia.png',
    },
    inox: {
      name: 'Viqtis',
      material: 'AISI 316L',
      anode: 'Nie wymaga',
      warranty: '10 lat',
      description: 'Premium zbiornik INOX. Maksymalna trwałość, bez konieczności wymiany anody.',
      image: '../img/cwu-nierdzewka.png',
    },
  };

  // Renderuje kartę zasobnika CWU z pełnymi danymi
  function renderCwuCard(type, capacity, isRecommended = false) {
    const data = cwuData[type];
    if (!data) return '';

    const price = calculateCwuPrice(`cwu-${type}`, capacity);
    const priceStr = price > 0 ? price.toLocaleString('pl-PL') : '—';

    const selectedClass = isRecommended ? 'selected' : '';
    const recommendedBadge = isRecommended
      ? '<span class="badge-recommended">★ Rekomendowane</span>'
      : '';

    const subtitle =
      type === 'inox' ? 'Zasobnik ze stali nierdzewnej' : 'Zasobnik z powłoką emaliowaną';

    return `
      <div class="product-card ${selectedClass}" data-option-id="cwu-${type}-${capacity}">
        <div class="product-image">
          <img src="${data.image}" alt="${
      data.name
    } ${capacity}L" onerror="this.src='../img/dom.png';" />
          ${recommendedBadge}
        </div>
        <div class="product-content">
          <span class="product-subtitle">${subtitle}</span>
          <h4 class="product-title">${data.name} ${capacity}L</h4>
          <p class="product-description">${data.description}</p>
          <div class="specs-list">
            <div class="spec-row">
              <span class="spec-label">Pojemność</span>
              <span class="spec-value">${capacity} L</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">${type === 'inox' ? 'Materiał' : 'Powłoka'}</span>
              <span class="spec-value">${data.material}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Anoda</span>
              <span class="spec-value">${data.anode}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Gwarancja</span>
              <span class="spec-value">${data.warranty}</span>
            </div>
          </div>
          <div class="product-price">
            <span class="price-value">${priceStr}</span>
            <span class="price-currency">PLN</span>
          </div>
        </div>
      </div>
    `;
  }

  // Renderuje sekcję CWU z 2 kartami (Emalia + INOX) dla rekomendowanej pojemności
  function renderCwuSection(recommendedCapacity) {
    if (!recommendedCapacity) {
      console.warn('[Configurator] Brak rekomendowanej pojemności CWU');
      return '';
    }

    const emaliaCard = renderCwuCard('emalia', recommendedCapacity, true);
    const inoxCard = renderCwuCard('inox', recommendedCapacity, false);

    return emaliaCard + inoxCard;
  }

  // Renderuje kartę bufora CO
  function renderBufferCard(capacity, isRecommended = false, allowZero = false) {
    const bufferData = {
      50: {
        subtitle: 'Kompaktowy',
        title: 'Bufor 50L',
        description: 'Bufor dla mniejszych instalacji z ograniczoną przestrzenią.',
        dimensions: 'Ø400×600',
        price: 1400,
        image: '../img/bufor50.png',
      },
      100: {
        subtitle: 'Standardowy',
        title: 'Bufor 100L',
        description: 'Optymalny bufor dla większości instalacji domowych.',
        dimensions: 'Ø500×800',
        price: 2100,
        image: '../img/bufor100.png',
      },
      200: {
        subtitle: 'Duży',
        title: 'Bufor 200L',
        description: 'Duży bufor dla większych instalacji i zwiększonego komfortu.',
        dimensions: 'Ø600×1000',
        price: 3000,
        image: '../img/bufor200.png',
      },
    };

    const data = bufferData[capacity];
    if (!data) {
      // Fallback - użyj calculateBufferPrice
      const price = calculateBufferPrice(`buffer-${capacity}`);
      return `
        <div class="product-card ${
          isRecommended ? 'selected' : ''
        }" data-option-id="buffer-${capacity}">
          <div class="product-image">
            <img src="../img/bufor${capacity}.png" alt="Bufor ${capacity}L" onerror="this.src='../img/dom.png';" />
          </div>
          <div class="product-content">
            <span class="product-subtitle">Bufor CO</span>
            <h4 class="product-title">Bufor ${capacity}L</h4>
            <p class="product-description">Bufor centralnego ogrzewania.</p>
            <div class="specs-list">
              <div class="spec-row">
                <span class="spec-label">Pojemność</span>
                <span class="spec-value">${capacity} L</span>
              </div>
            </div>
            <div class="product-price">
              <span class="price-value">${price > 0 ? price.toLocaleString('pl-PL') : '—'}</span>
              <span class="price-currency">PLN</span>
            </div>
          </div>
        </div>
      `;
    }

    const selectedClass = isRecommended ? 'selected' : '';
    const recommendedBadge = isRecommended
      ? '<span class="badge-recommended">★ Rekomendowane</span>'
      : '';

    return `
      <div class="product-card ${selectedClass}" data-option-id="buffer-${capacity}">
        <div class="product-image">
          <img src="${data.image}" alt="${data.title}" onerror="this.src='../img/dom.png';" />
          ${recommendedBadge}
        </div>
        <div class="product-content">
          <span class="product-subtitle">${data.subtitle}</span>
          <h4 class="product-title">${data.title}</h4>
          <p class="product-description">${data.description}</p>
          <div class="specs-list">
            <div class="spec-row">
              <span class="spec-label">Pojemność</span>
              <span class="spec-value">${capacity} L</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Wymiary</span>
              <span class="spec-value">${data.dimensions}</span>
            </div>
          </div>
          <div class="product-price">
            <span class="price-value">${data.price.toLocaleString('pl-PL')}</span>
            <span class="price-currency">PLN</span>
          </div>
        </div>
      </div>
    `;
  }

  // Renderuje sekcję bufora CO z kartami
  function renderBufferSection(recommendedCapacity, allowZero = false) {
    const capacities = [50, 100, 200];
    let cards = '';

    capacities.forEach(capacity => {
      const isRecommended = capacity === recommendedCapacity;
      cards += renderBufferCard(capacity, isRecommended, allowZero);
    });

    // Opcja "Bez bufora" tylko jeśli allowZero
    if (allowZero && recommendedCapacity === 0) {
      cards += `
        <div class="product-card selected" data-option-id="buffer-0">
          <div class="product-content">
            <span class="product-subtitle">Opcja specjalna</span>
            <h4 class="product-title">Bez bufora</h4>
            <p class="product-description">Tylko dla specyficznych instalacji po konsultacji.</p>
            <div class="specs-list">
              <div class="spec-row">
                <span class="spec-label">Uwaga</span>
                <span class="spec-value">Wymaga konsultacji</span>
              </div>
            </div>
            <div class="product-price">
              <span class="price-value">0</span>
              <span class="price-currency">PLN</span>
            </div>
          </div>
        </div>
      `;
    }

    return cards;
  }

  // Renderuje kartę cyrkulacji CWU
  function renderCirculationCard(type, isRecommended = false) {
    const data = {
      tak: {
        subtitle: 'Komfort',
        title: 'Z cyrkulacją CWU',
        description: 'Ciepła woda natychmiast w każdym punkcie poboru.',
        specs: [
          { label: 'Czas oczekiwania', value: '< 3 sek' },
          { label: 'Pobór mocy', value: '5-8 W' },
        ],
        price: 1800,
        optionId: 'cyrkulacja-tak',
      },
      nie: {
        subtitle: 'Standard',
        title: 'Bez cyrkulacji',
        description: 'Klasyczna instalacja bez dodatkowej cyrkulacji.',
        specs: [{ label: 'Czas oczekiwania', value: 'Zależny od odległości' }],
        price: 0,
        optionId: 'cyrkulacja-nie',
      },
    };

    const cardData = data[type];
    if (!cardData) return '';

    const selectedClass = isRecommended ? 'selected' : '';
    const recommendedBadge = isRecommended
      ? '<span class="badge-recommended">★ Rekomendowane</span>'
      : '';
    const priceStr = cardData.price > 0 ? cardData.price.toLocaleString('pl-PL') : '0';

    return `
      <div class="product-card ${selectedClass}" data-option-id="${cardData.optionId}">
        <div class="product-content">
          ${recommendedBadge}
          <span class="product-subtitle">${cardData.subtitle}</span>
          <h4 class="product-title">${cardData.title}</h4>
          <p class="product-description">${cardData.description}</p>
          <div class="specs-list">
            ${cardData.specs
              .map(
                spec => `
              <div class="spec-row">
                <span class="spec-label">${spec.label}</span>
                <span class="spec-value">${spec.value}</span>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="product-price">
            <span class="price-value">${priceStr}</span>
            <span class="price-currency">PLN</span>
          </div>
        </div>
      </div>
    `;
  }

  // Renderuje sekcję cyrkulacji CWU
  function renderCirculationSection() {
    const withCard = renderCirculationCard('tak', false);
    const withoutCard = renderCirculationCard('nie', true);
    return withCard + withoutCard;
  }

  // Renderuje kartę Service Cloud (Premium)
  function renderServiceCard() {
    return `
      <div class="product-card selected" data-option-id="service-cloud">
        <div class="product-content">
          <span class="badge-recommended">★ Rekomendowane</span>
          <span class="product-subtitle">Pełna obsługa 24/7</span>
          <h4 class="product-title">Service Cloud Premium</h4>
          <p class="product-description">Monitoring, diagnostyka i priorytetowy serwis.</p>
          <div class="specs-list">
            <div class="spec-row">
              <span class="spec-label">Monitoring</span>
              <span class="spec-value">24/7</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Reakcja serwisu</span>
              <span class="spec-value">< 24h</span>
            </div>
          </div>
          <div class="product-price">
            <span class="price-value">1 200/rok</span>
            <span class="price-currency">PLN</span>
          </div>
        </div>
      </div>
    `;
  }

  // Renderuje kartę posadowienia
  function renderFoundationCard(type, isRecommended = false) {
    const data = {
      grunt: {
        subtitle: 'Montaż naziemny',
        title: 'Stopa betonowa',
        description: 'Klasyczne posadowienie na przygotowanej stopie betonowej.',
        specs: [{ label: 'Wymiary stopy', value: '80×80 cm' }],
        price: 1200,
        optionId: 'posadowienie-grunt',
      },
      sciana: {
        subtitle: 'Montaż na ścianie',
        title: 'Konsola ścienna',
        description: 'Oszczędność miejsca, montaż na elewacji budynku.',
        specs: [{ label: 'Izolacja', value: 'Akustyczna' }],
        price: 1600,
        optionId: 'posadowienie-sciana',
      },
      dach: {
        subtitle: 'Montaż na dachu',
        title: 'Konstrukcja dachowa',
        description: 'Dla dachów płaskich, rama stalowa z matami.',
        specs: [{ label: 'Konstrukcja', value: 'Stalowa' }],
        price: 2400,
        optionId: 'posadowienie-dach',
      },
    };

    const cardData = data[type];
    if (!cardData) return '';

    const selectedClass = isRecommended ? 'selected' : '';
    const recommendedBadge = isRecommended
      ? '<span class="badge-recommended">★ Rekomendowane</span>'
      : '';

    return `
      <div class="product-card ${selectedClass}" data-option-id="${cardData.optionId}">
        <div class="product-content">
          ${recommendedBadge}
          <span class="product-subtitle">${cardData.subtitle}</span>
          <h4 class="product-title">${cardData.title}</h4>
          <p class="product-description">${cardData.description}</p>
          <div class="specs-list">
            ${cardData.specs
              .map(
                spec => `
              <div class="spec-row">
                <span class="spec-label">${spec.label}</span>
                <span class="spec-value">${spec.value}</span>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="product-price">
            <span class="price-value">${cardData.price.toLocaleString('pl-PL')}</span>
            <span class="price-currency">PLN</span>
          </div>
        </div>
      </div>
    `;
  }

  // Renderuje sekcję posadowienia
  function renderFoundationSection() {
    const gruntCard = renderFoundationCard('grunt', true);
    const scianaCard = renderFoundationCard('sciana', false);
    const dachCard = renderFoundationCard('dach', false);
    return gruntCard + scianaCard + dachCard;
  }

  // Renderuje kartę reduktora ciśnienia
  function renderReducerCard(isRecommended = false) {
    const selectedClass = isRecommended ? 'selected' : '';
    const recommendedBadge = isRecommended
      ? '<span class="badge-recommended">★ Rekomendowane</span>'
      : '';

    return `
      <div class="product-card ${selectedClass}" data-option-id="reduktor-tak">
        <div class="product-content">
          ${recommendedBadge}
          <span class="product-subtitle">Zalecane przy >4 bar</span>
          <h4 class="product-title">Z reduktorem ciśnienia</h4>
          <p class="product-description">Reduktor nastawny z manometrem i filtrem.</p>
          <div class="specs-list">
            <div class="spec-row">
              <span class="spec-label">Zakres</span>
              <span class="spec-value">1-6 bar</span>
            </div>
          </div>
          <div class="product-price">
            <span class="price-value">380</span>
            <span class="price-currency">PLN</span>
          </div>
        </div>
      </div>
    `;
  }

  // Renderuje sekcję reduktora ciśnienia
  function renderReducerSection() {
    return renderReducerCard(false);
  }

  // Renderuje kartę stacji uzdatniania wody
  function renderWaterStationCard(type, isRecommended = false) {
    const data = {
      kompleksowa: {
        subtitle: 'Filtracja + zmiękczanie',
        title: 'Stacja kompleksowa',
        description: 'Pełne uzdatnianie wody dla maksymalnej ochrony.',
        specs: [{ label: 'Funkcje', value: 'Zmiękczanie + filtracja' }],
        price: 4200,
        optionId: 'woda-tak',
      },
      podstawowa: {
        subtitle: 'Filtr mechaniczny',
        title: 'Filtracja podstawowa',
        description: 'Podstawowa ochrona przed zanieczyszczeniami.',
        specs: [{ label: 'Filtracja', value: '50 μm' }],
        price: 320,
        optionId: 'woda-filtr',
      },
      brak: {
        subtitle: 'Przy dobrej jakości wody',
        title: 'Bez uzdatniania',
        description: 'Gdy woda miejska nie wymaga uzdatniania.',
        specs: [{ label: 'Wymaga', value: 'Analizy wody' }],
        price: 0,
        optionId: 'woda-nie',
      },
    };

    const cardData = data[type];
    if (!cardData) return '';

    const selectedClass = isRecommended ? 'selected' : '';
    const recommendedBadge = isRecommended
      ? '<span class="badge-recommended">★ Rekomendowane</span>'
      : '';

    return `
      <div class="product-card ${selectedClass}" data-option-id="${cardData.optionId}">
        <div class="product-content">
          ${recommendedBadge}
          <span class="product-subtitle">${cardData.subtitle}</span>
          <h4 class="product-title">${cardData.title}</h4>
          <p class="product-description">${cardData.description}</p>
          <div class="specs-list">
            ${cardData.specs
              .map(
                spec => `
              <div class="spec-row">
                <span class="spec-label">${spec.label}</span>
                <span class="spec-value">${spec.value}</span>
              </div>
            `
              )
              .join('')}
          </div>
          <div class="product-price">
            <span class="price-value">${
              cardData.price > 0 ? cardData.price.toLocaleString('pl-PL') : '0'
            }</span>
            <span class="price-currency">PLN</span>
          </div>
        </div>
      </div>
    `;
  }

  // Renderuje sekcję stacji uzdatniania wody
  function renderWaterStationSection() {
    const kompleksowaCard = renderWaterStationCard('kompleksowa', false);
    const podstawowaCard = renderWaterStationCard('podstawowa', true);
    const brakCard = renderWaterStationCard('brak', false);
    return kompleksowaCard + podstawowaCard + brakCard;
  }

  /* ==========================================================================
     POPULATE WITH CALCULATOR DATA (z configurator-new.js + rozszerzone)
     ========================================================================== */

  async function populateConfiguratorWithCalculatorData() {
    const calcData = window.lastCalculationResult;
    if (!calcData) {
      console.log('[Configurator] Brak danych z kalkulatora');
      return;
    }

    console.log('[Configurator] Wypełniam danymi z kalkulatora:', calcData);

    // Zapisz meta w state
    state.meta = {
      max_heating_power: calcData.max_heating_power,
      hot_water_power: calcData.hot_water_power,
      recommended_power_kw: calcData.recommended_power_kw || calcData.max_heating_power,
      power_total_kw: (calcData.max_heating_power || 0) + (calcData.hot_water_power || 0),
      heated_area: calcData.heated_area,
      total_area: calcData.total_area,
      heating_type: calcData.heating_type || calcData.installation_type,
      installation_type: calcData.heating_type || calcData.installation_type,
      include_hot_water: calcData.include_hot_water !== false,
      hot_water_persons: calcData.hot_water_persons,
      cwu_people: calcData.hot_water_persons,
      hot_water_usage: calcData.hot_water_usage,
      cwu_profile: calcData.hot_water_usage,
      has_three_phase: !!calcData.has_three_phase,
      building_type: calcData.building_type,
      building_year: calcData.building_year || calcData.construction_year,
      construction_year: calcData.building_year || calcData.construction_year,
      heat_source_prev: calcData.heat_source_prev || calcData.source_type,
      generation: 'K',
    };

    // Przygotuj profile pomp
    const pumpProfiles = preparePumpProfiles(state.meta);
    if (pumpProfiles.length === 0) {
      console.warn('[Configurator] Brak profili pomp - używam fallback');
      return;
    }

    // Renderuj sekcję pompy z pełnymi kartami
    const pumpStep = document.querySelector('[data-step-key="pompa"]');
    if (pumpStep) {
      const optionsGrid = pumpStep.querySelector('.options-grid');
      if (optionsGrid) {
        // Renderuj karty dynamicznie
        const splitProfile =
          pumpProfiles.find(p => p.type === 'split' && p.id === 'hp') || pumpProfiles[0];
        const aioProfile = pumpProfiles.find(p => p.type === 'all-in-one' && p.id === 'aio');

        // Załaduj panasonic.json jeśli jeszcze nie załadowany
        if (!panasonicDB) {
          await loadPanasonicDB();
        }

        const splitData = getPumpDataFromDB(splitProfile.model);
        const aioData = aioProfile ? getPumpDataFromDB(aioProfile.model) : null;

        const splitCard = renderPumpCard(splitProfile, splitData, true);
        const aioCard =
          aioProfile && !aioProfile.disabled ? renderPumpCard(aioProfile, aioData, false) : '';

        optionsGrid.innerHTML = splitCard + aioCard;

        // Auto-wybierz rekomendowaną kartę Split
        const recommendedCard = optionsGrid.querySelector('[data-option-id="hp"]');
        if (recommendedCard && !recommendedCard.classList.contains('selected')) {
          recommendedCard.classList.add('selected');
          captureSelectionForCard(recommendedCard);
        }

        // Zaktualizuj selectedPump
        state.selectedPump = {
          ...splitProfile,
          panasonicData: splitData,
        };

        // Aktualizuj treści dla KROKU 1 - POMPA CIEPŁA
        const recommendedPower =
          state.meta?.recommended_power_kw || state.meta?.max_heating_power || null;
        const sectionDescription = pumpStep.querySelector('.section-description');
        let recommendationNote = pumpStep.querySelector('.recommendation-note');

        if (!recommendationNote) {
          recommendationNote = document.createElement('div');
          recommendationNote.className = 'recommendation-note';
          pumpStep.appendChild(recommendationNote);
        }

        if (recommendedPower) {
          // Jest recommended_power_kw
          if (sectionDescription) {
            sectionDescription.textContent = `Na podstawie obliczeń zapotrzebowania cieplnego budynku rekomendujemy pompę o mocy ${recommendedPower} kW. Prawidłowy dobór mocy wpływa na komfort, koszty i żywotność urządzenia.`;
          }
          recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Rekomendowana moc pompy to <strong>${recommendedPower} kW</strong>. Zbyt mała pompa może nie dogrzać budynku, a przewymiarowana będzie pracować drożej i nieefektywnie.</p>`;

          // Dodatkowe informacje w zależności od typu pompy
          const selectedPumpType = state.selectedPump?.type || splitProfile?.type || 'split';
          if (selectedPumpType === 'split' || selectedPumpType === 'Split') {
            const additionalNote = document.createElement('p');
            additionalNote.style.marginTop = '8px';
            additionalNote.style.fontSize = '14px';
            additionalNote.textContent =
              'System Split zapewnia większą elastyczność montażu i łatwiejszy serwis.';
            recommendationNote.appendChild(additionalNote);
          } else if (
            selectedPumpType === 'aio' ||
            selectedPumpType === 'all-in-one' ||
            selectedPumpType === 'All-in-One'
          ) {
            const additionalNote = document.createElement('p');
            additionalNote.style.marginTop = '8px';
            additionalNote.style.fontSize = '14px';
            additionalNote.textContent =
              'System All-in-One zawiera wbudowany zasobnik CWU i oszczędza miejsce w maszynowni.';
            recommendationNote.appendChild(additionalNote);
          }
        } else {
          // Brak danych
          if (sectionDescription) {
            sectionDescription.textContent =
              'Na podstawie obliczeń rekomendujemy pompę o odpowiedniej mocy. Wybierz preferowany model.';
          }
          recommendationNote.innerHTML =
            '<p><strong>Wynik kalkulacji:</strong> Rekomendowana wartość zostanie wyświetlona po obliczeniach.</p>';
        }
      }
    }

    // Przelicz reguły przed auto-wyborem
    const evaluated = evaluateRules();

    // Renderuj karty CWU dynamicznie
    if (evaluated && evaluated.cwuRules.enabled && evaluated.cwuRules.recommendedCapacity) {
      const cwuStep = document.querySelector('[data-step-key="cwu"]');
      if (cwuStep) {
        const recommendedCapacity = evaluated.cwuRules.recommendedCapacity;
        const optionsGrid = cwuStep.querySelector('.options-grid');

        if (optionsGrid) {
          // Renderuj karty dynamicznie
          const cards = renderCwuSection(recommendedCapacity);
          optionsGrid.innerHTML = cards;

          // Auto-wybierz rekomendowaną kartę (Emalia)
          const recommendedCard = optionsGrid.querySelector('[data-option-id*="emalia"]');
          if (recommendedCard && !recommendedCard.classList.contains('selected')) {
            recommendedCard.classList.add('selected');
            captureSelectionForCard(recommendedCard);
          }

          // Zaktualizuj recommendation-note
          let recommendationNote = cwuStep.querySelector('.recommendation-note');
          if (!recommendationNote) {
            recommendationNote = document.createElement('div');
            recommendationNote.className = 'recommendation-note';
            cwuStep.appendChild(recommendationNote);
          }
          // Zaktualizuj opis w headerze zgodnie z tabelą WARUNEK → TEKST
          const sectionDescription = cwuStep.querySelector('.section-description');
          if (sectionDescription) {
            sectionDescription.textContent = `Rekomendowana pojemność zasobnika to ${recommendedCapacity} L. Pojemność została dobrana do liczby domowników i stylu użytkowania.`;
          }

          // Zaktualizuj recommendation-note zgodnie z tabelą WARUNEK → TEKST
          const people = state.meta?.hot_water_persons || state.meta?.cwu_people || null;
          const profile = state.meta?.hot_water_usage || state.meta?.cwu_profile || null;
          let profileLabel = '';
          if (profile === 'bath') {
            profileLabel = 'podwyższone zużycie';
          } else if (profile === 'shower_bath') {
            profileLabel = 'standardowe zużycie';
          } else {
            profileLabel = 'małe zużycie';
          }

          let peopleText = '';
          if (people) {
            if (people === 1) {
              peopleText = '1 osoba';
            } else if (people < 5) {
              peopleText = `${people} osoby`;
            } else {
              peopleText = `${people} osób`;
            }
          }

          let noteContent = `<strong>Wynik kalkulacji:</strong> Rekomendowana pojemność to <strong>${recommendedCapacity} L</strong>`;
          if (people && profile) {
            noteContent += ` (${peopleText}, ${profileLabel})`;
          }
          noteContent += '. Zapewnia komfort korzystania z ciepłej wody bez ryzyka jej braku.';

          recommendationNote.innerHTML = `<p>${noteContent}</p>`;
        }
      }
    }

    // Renderuj karty bufora CO dynamicznie
    if (evaluated && evaluated.bufferRules) {
      const bufferStep = document.querySelector('[data-step-key="bufor"]');
      if (bufferStep) {
        const recommendedCapacity = evaluated.bufferRules.recommendedCapacity || 100;
        const allowZero = evaluated.bufferRules.allowZeroBuffer || false;
        const optionsGrid = bufferStep.querySelector('.options-grid');

        if (optionsGrid) {
          const cards = renderBufferSection(recommendedCapacity, allowZero);
          optionsGrid.innerHTML = cards;

          // Dodaj klasę grid-3-col dla 3 kart (50L, 100L, 200L)
          optionsGrid.classList.add('grid-3-col');

          // Auto-wybierz rekomendowaną kartę
          const recommendedCard = optionsGrid.querySelector(
            `[data-option-id="buffer-${recommendedCapacity}"]`
          );
          if (recommendedCard && !recommendedCard.classList.contains('selected')) {
            recommendedCard.classList.add('selected');
            captureSelectionForCard(recommendedCard);
          }

          // Zaktualizuj recommendation-note
          let recommendationNote = bufferStep.querySelector('.recommendation-note');
          if (!recommendationNote) {
            recommendationNote = document.createElement('div');
            recommendationNote.className = 'recommendation-note';
            bufferStep.appendChild(recommendationNote);
          }
          if (recommendedCapacity > 0) {
            recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Rekomendowana pojemność bufora to <strong>${recommendedCapacity}L</strong>. Bufor uzupełnia zład wody i zapewnia cichą, prawidłową pracę pompy.</p>`;
          } else {
            recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Bufor nie jest wymagany. Instalacja posiada wystarczający zład wody, aby pompa mogła pracować stabilnie bez dodatkowego zbiornika.</p>`;
          }

          // Zaktualizuj opis w headerze zgodnie z tabelą WARUNEK → TEKST
          const sectionDescription = bufferStep.querySelector('.section-description');
          if (sectionDescription) {
            if (recommendedCapacity === 0) {
              sectionDescription.textContent =
                'Bufor stabilizuje pracę instalacji i chroni pompę przed zbyt częstym załączaniem.';
            } else {
              sectionDescription.textContent =
                'Bufor pełni rolę stabilizatora pracy instalacji grzewczej i zabezpiecza sprężarkę pompy ciepła.';
            }
          }
        }
      }
    }

    // Renderuj karty cyrkulacji CWU dynamicznie
    if (evaluated && evaluated.circulationRules) {
      const circulationStep = document.querySelector('[data-step-key="cyrkulacja"]');
      if (circulationStep) {
        const isEnabled = evaluated.circulationRules.enabled === true;
        const isRecommended = evaluated.circulationRules.recommended === true;

        if (isEnabled) {
          const optionsGrid = circulationStep.querySelector('.options-grid');
          if (optionsGrid) {
            const cards = renderCirculationSection();
            optionsGrid.innerHTML = cards;

            // Auto-wybierz "Bez cyrkulacji" jako domyślne
            const defaultCard = optionsGrid.querySelector('[data-option-id="cyrkulacja-nie"]');
            if (defaultCard && !defaultCard.classList.contains('selected')) {
              defaultCard.classList.add('selected');
              captureSelectionForCard(defaultCard);
            }
          }
        }

        // Aktualizuj treści dla KROKU 4 - CYRKULACJA CWU
        const sectionDescription = circulationStep.querySelector('.section-description');
        let recommendationNote = circulationStep.querySelector('.recommendation-note');

        if (!recommendationNote) {
          recommendationNote = document.createElement('div');
          recommendationNote.className = 'recommendation-note';
          circulationStep.appendChild(recommendationNote);
        }

        if (!isEnabled) {
          // enabled = false
          if (sectionDescription) {
            sectionDescription.textContent =
              'Sekcja wyłączona — wybrana konfiguracja zawiera wbudowany zasobnik CWU.';
          }
          recommendationNote.innerHTML =
            '<p><strong>Wynik kalkulacji:</strong> Cyrkulacja CWU nie dotyczy tej konfiguracji.</p>';
        } else if (isRecommended) {
          // recommended = true
          if (sectionDescription) {
            sectionDescription.textContent =
              'Cyrkulacja CWU zapewnia niemal natychmiastowy dostęp do ciepłej wody. Rekomendowana w większych domach lub gdy komfort jest priorytetem.';
          }
          recommendationNote.innerHTML =
            '<p><strong>Wynik kalkulacji:</strong> Rekomendujemy cyrkulację CWU. Skraca czas oczekiwania na ciepłą wodę i ogranicza jej marnowanie w długiej instalacji.</p>';
        } else {
          // recommended = false
          if (sectionDescription) {
            sectionDescription.textContent =
              'Cyrkulacja CWU zapewnia wygodę użytkowania ciepłej wody.';
          }
          recommendationNote.innerHTML =
            '<p><strong>Wynik kalkulacji:</strong> Cyrkulacja jest opcjonalna. W tej instalacji czas oczekiwania na ciepłą wodę będzie krótki nawet bez niej.</p>';
        }
      }
    }

    // Renderuj kartę Service Cloud dynamicznie (tylko 1 karta - Basic)
    const serviceStep = document.querySelector('[data-step-key="service"]');
    if (serviceStep) {
      const optionsGrid = serviceStep.querySelector('.options-grid');
      if (optionsGrid) {
        const card = renderServiceCard();
        optionsGrid.innerHTML = card;

        // Auto-wybierz Service Cloud
        const serviceCard = optionsGrid.querySelector('[data-option-id="service-cloud"]');
        if (serviceCard && !serviceCard.classList.contains('selected')) {
          serviceCard.classList.add('selected');
          captureSelectionForCard(serviceCard);
        }
      }

      // Aktualizuj treści dla KROKU 5 - SERVICE CLOUD
      const isEnabled = evaluated?.serviceCloudRules?.enabled === true;
      const sectionDescription = serviceStep.querySelector('.section-description');
      let recommendationNote = serviceStep.querySelector('.recommendation-note');

      if (!recommendationNote) {
        recommendationNote = document.createElement('div');
        recommendationNote.className = 'recommendation-note';
        serviceStep.appendChild(recommendationNote);
      }

      if (isEnabled) {
        // Dostępny
        if (sectionDescription) {
          sectionDescription.textContent =
            'Zdalne monitorowanie i opieka serwisowa instalacji przez specjalistów TOP-INSTAL.';
        }
        recommendationNote.innerHTML =
          '<p><strong>Wynik kalkulacji:</strong> Service Cloud jest <strong>w standardzie TOP-INSTAL — bez dopłat</strong>. Umożliwia zdalną diagnostykę, optymalizację ustawień i szybszą reakcję serwisową.</p>';
      } else {
        // Niedostępny
        if (sectionDescription) {
          sectionDescription.textContent = 'Service Cloud dostępny tylko dla wybranych serii pomp.';
        }
        recommendationNote.innerHTML =
          '<p><strong>Wynik kalkulacji:</strong> Funkcja niedostępna dla wybranej konfiguracji pompy.</p>';
      }
    }

    // Renderuj karty posadowienia dynamicznie
    const foundationStep = document.querySelector('[data-step-key="posadowienie"]');
    if (foundationStep) {
      const optionsGrid = foundationStep.querySelector('.options-grid');
      if (optionsGrid) {
        const cards = renderFoundationSection();
        optionsGrid.innerHTML = cards;

        // Auto-wybierz "Stopa betonowa" jako rekomendowaną
        const recommendedCard = optionsGrid.querySelector('[data-option-id="posadowienie-grunt"]');
        if (recommendedCard && !recommendedCard.classList.contains('selected')) {
          recommendedCard.classList.add('selected');
          captureSelectionForCard(recommendedCard);
        }
      }

      // Aktualizuj treści dla KROKU 6 - POSADOWIENIE
      const pumpWeight =
        state.selectedPump?.weight || state.selectedPump?.panasonicData?.weight || 70;
      const isHeavy = pumpWeight > 65;
      const sectionDescription = foundationStep.querySelector('.section-description');
      let recommendationNote = foundationStep.querySelector('.recommendation-note');

      if (!recommendationNote) {
        recommendationNote = document.createElement('div');
        recommendationNote.className = 'recommendation-note';
        foundationStep.appendChild(recommendationNote);
      }

      // Zawsze
      if (sectionDescription) {
        sectionDescription.textContent =
          'Sposób montażu jednostki zewnętrznej wpływa na stabilność pracy, hałas i trwałość instalacji.';
      }

      let noteText =
        '<strong>Wynik kalkulacji:</strong> Rekomendujemy montaż na fundamencie betonowym (w cenie). Zapewnia stabilność, redukcję drgań i prawidłowe odprowadzenie kondensatu.';

      if (isHeavy) {
        noteText +=
          ' Uwaga: masa pompy przekracza 65 kg — montaż na konsoli ściennej wymaga dodatkowej analizy konstrukcyjnej.';
      }

      recommendationNote.innerHTML = `<p>${noteText}</p>`;
    }

    // Renderuj kartę reduktora ciśnienia dynamicznie
    const reducerStep = document.querySelector('[data-step-key="reduktor"]');
    if (reducerStep) {
      const optionsGrid = reducerStep.querySelector('.options-grid');
      if (optionsGrid) {
        const card = renderReducerSection();
        optionsGrid.innerHTML = card;
      }

      // Aktualizuj treści dla KROKU 7 - REDUKTOR CIŚNIENIA
      const waterPressure = state.meta?.water_pressure || null;
      const sectionDescription = reducerStep.querySelector('.section-description');
      let recommendationNote = reducerStep.querySelector('.recommendation-note');

      if (!recommendationNote) {
        recommendationNote = document.createElement('div');
        recommendationNote.className = 'recommendation-note';
        reducerStep.appendChild(recommendationNote);
      }

      let descText = '';
      let noteText = '';

      if (waterPressure === null) {
        // Brak danych
        descText = 'Reduktor chroni instalację przed zbyt wysokim ciśnieniem wody.';
        noteText =
          '<strong>Wynik kalkulacji:</strong> Rekomendujemy reduktor dla większości instalacji — zapewnia poprawność montażu i komfort użytkowania.';
      } else if (waterPressure > 5) {
        // > 5 bar
        descText = 'Reduktor chroni instalację przed zbyt wysokim ciśnieniem wody.';
        noteText =
          '<strong>Wynik kalkulacji:</strong> Reduktor ciśnienia jest <strong>wymagany</strong>. Zbyt wysokie ciśnienie może prowadzić do uszkodzeń armatury i zbiornika CWU.';
      } else if (waterPressure >= 3) {
        // 3-5 bar
        descText = 'Reduktor chroni instalację przed skokami ciśnienia.';
        noteText =
          '<strong>Wynik kalkulacji:</strong> Rekomendujemy reduktor ciśnienia dla stabilnej pracy instalacji i komfortu użytkowania.';
      } else {
        // < 3 bar
        descText = 'Reduktor chroni instalację przed nadmiernym ciśnieniem.';
        noteText =
          '<strong>Wynik kalkulacji:</strong> Reduktor nie jest wymagany, ale można go dodać opcjonalnie jako dodatkowe zabezpieczenie.';
      }

      if (sectionDescription) {
        sectionDescription.textContent = descText;
      }
      recommendationNote.innerHTML = `<p>${noteText}</p>`;
    }

    // Renderuj karty stacji uzdatniania wody dynamicznie
    const waterStep = document.querySelector('[data-step-key="woda"]');
    if (waterStep) {
      const optionsGrid = waterStep.querySelector('.options-grid');
      if (optionsGrid) {
        const cards = renderWaterStationSection();
        optionsGrid.innerHTML = cards;

        // Auto-wybierz "Filtracja podstawowa" jako rekomendowaną
        const recommendedCard = optionsGrid.querySelector('[data-option-id="woda-filtr"]');
        if (recommendedCard && !recommendedCard.classList.contains('selected')) {
          recommendedCard.classList.add('selected');
          captureSelectionForCard(recommendedCard);
        }
      }

      // Aktualizuj treści dla KROKU 8 - UZDATNIANIE WODY
      const waterHardness = state.meta?.water_hardness || null;
      const sectionDescription = waterStep.querySelector('.section-description');
      let recommendationNote = waterStep.querySelector('.recommendation-note');

      if (!recommendationNote) {
        recommendationNote = document.createElement('div');
        recommendationNote.className = 'recommendation-note';
        waterStep.appendChild(recommendationNote);
      }

      // Zawsze
      if (sectionDescription) {
        sectionDescription.textContent =
          'Jakość wody ma bezpośredni wpływ na trwałość pompy ciepła i zasobnika CWU.';
      }

      let noteText =
        '<strong>Wynik kalkulacji:</strong> Rekomendujemy uzdatnianie wody w celu ochrony instalacji przed kamieniem i korozją.';

      if (waterHardness && waterHardness > 15) {
        // Twarda woda (przykładowa wartość > 15)
        noteText +=
          ' Dla twardej wody zalecana jest stacja kompleksowa (filtracja + zmiękczanie), aby wydłużyć żywotność instalacji.';
      }

      recommendationNote.innerHTML = `<p>${noteText}</p>`;
    }

    // Zastosuj reguły do UI
    applyRulesToUI(evaluated);

    // Przelicz ceny
    calculateTotalPrice();
    buildPricingItems();

    updateSummary();
    exposeSelectionOnWindow();
    console.log('[Configurator] ✅ Dane z kalkulatora wypełnione');
  }

  function readInitialSelections() {
    steps.forEach(step => {
      const stepKey = step.dataset.stepKey;
      if (!stepKey || stepKey === 'summary') return;

      const preselected = step.querySelector('.option-card.selected');
      if (preselected) {
        captureSelectionForCard(preselected);
      }
    });

    updateSummary();
  }

  /* ==========================================================================
     STICKY SELECTIONS BAR CONTROLLER (jak progress bar w kalkulatorze)
     ========================================================================== */

  const SelectionsBarController = {
    selectionsBar: null,
    placeholder: null,
    header: null,
    triggerOffset: 0,

    init() {
      this.selectionsBar = document.getElementById('configurator-selections-bar');
      this.placeholder = document.getElementById('selections-sticky-placeholder');
      this.header = document.querySelector('.top-preview-header');

      if (!this.selectionsBar) {
        console.warn('[SelectionsBar] Nie znaleziono paska komponentów');
        return;
      }

      // Ustaw początkową pozycję triggera
      this.updateTriggerOffset();

      // Setup sticky behavior
      this.setupSticky();

      // Recalculate trigger po załadowaniu obrazów
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.updateTriggerOffset();
        }, 100);
      });

      // Recalculate on window resize
      window.addEventListener('resize', () => {
        this.updateTriggerOffset();
      });

      console.log('[SelectionsBar] ✅ Sticky controller zainicjalizowany');
    },

    updateTriggerOffset() {
      if (this.selectionsBar && this.header) {
        const headerHeight = this.header.offsetHeight || 60;
        const barTop = this.selectionsBar.offsetTop;

        // Trigger: gdy pasek zjedzie za dolną krawędź headera
        this.triggerOffset = barTop - headerHeight;

        // Ustaw CSS variable dla sticky top position
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

        console.log(
          `[SelectionsBar] Trigger offset: ${this.triggerOffset}px, Header height: ${headerHeight}px`
        );
      }
    },

    setupSticky() {
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (this.selectionsBar) {
              if (scrollTop > this.triggerOffset) {
                this.selectionsBar.classList.add('sticky');
                if (this.placeholder) {
                  // Ustaw wysokość placeholder na wysokość paska
                  const barHeight = this.selectionsBar.offsetHeight;
                  this.placeholder.style.height = `${barHeight}px`;
                  this.placeholder.style.display = 'block';
                }
              } else {
                this.selectionsBar.classList.remove('sticky');
                if (this.placeholder) {
                  this.placeholder.style.display = 'none';
                }
              }
            }

            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener('scroll', handleScroll);
    },
  };

  /* ==========================================================================
     INITIALIZATION (z configurator-new.js)
     ========================================================================== */

  function initConfigurator() {
    console.log('[Configurator] 🔍 Inicjalizacja...');

    const app = document.getElementById('configurator-app');
    if (!app) {
      console.warn('[Configurator] ⚠️ Brak #configurator-app');
      return false;
    }

    if (app.dataset.initialized === 'true') {
      console.log('[Configurator] ℹ️ Już zainicjalizowany');
      return true;
    }

    const stepsContainer = document.getElementById('configurator-steps');
    if (!stepsContainer) {
      console.error('[Configurator] ❌ Brak #configurator-steps');
      return false;
    }

    steps = Array.from(stepsContainer.querySelectorAll('.config-step'));
    if (!steps.length) {
      console.error('[Configurator] ❌ Brak kroków');
      return false;
    }

    navPrev = document.getElementById('nav-prev');
    navNext = document.getElementById('nav-next');
    currentStepNumberEl = document.getElementById('current-step-number');
    totalStepsNumberEl = document.getElementById('total-steps-number');
    summaryBody = document.getElementById('summary-rows');

    totalSteps = steps.length;
    currentStepIndex = 0;

    if (totalStepsNumberEl) {
      totalStepsNumberEl.textContent = String(totalSteps);
    }

    bindCardClicks();
    bindNavigation();
    bindSummaryActions();

    readInitialSelections();
    showStep(0, true); // noScroll = true przy pierwszym pokazaniu

    // Przelicz reguły i ceny po inicjalizacji
    const evaluated = evaluateRules();
    if (evaluated) {
      applyRulesToUI(evaluated);
    }
    calculateTotalPrice();
    buildPricingItems();
    exposeSelectionOnWindow();

    // Inicjalizuj sticky selections bar controller
    SelectionsBarController.init();

    app.dataset.initialized = 'true';
    console.log('[Configurator] ✅ Inicjalizacja zakończona');
    return true;
  }

  // Eksport funkcji globalnie
  window.initNewConfigurator = function () {
    return initConfigurator();
  };

  window.populateConfiguratorWithCalculatorData = populateConfiguratorWithCalculatorData;

  // Auto-inicjalizacja
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initConfigurator, 100);
    });
  } else {
    setTimeout(initConfigurator, 100);
  }

  // MutationObserver dla dynamicznego HTML
  let initTimeout = null;
  const observer = new MutationObserver(() => {
    if (initTimeout) clearTimeout(initTimeout);
    initTimeout = setTimeout(() => {
      const app = document.getElementById('configurator-app');
      if (app && app.dataset.initialized !== 'true') {
        const result = initConfigurator();
        if (result && window.lastCalculationResult) {
          setTimeout(() => {
            if (typeof window.populateConfiguratorWithCalculatorData === 'function') {
              window.populateConfiguratorWithCalculatorData();
            }
          }, 100);
        }
      }
    }, 200);
  });

  function startObserving() {
    const root =
      document.getElementById('configurator-root') || document.getElementById('configurator-view');
    if (root) {
      observer.observe(root, { childList: true, subtree: true });
      console.log('[Configurator] MutationObserver uruchomiony');
    } else {
      setTimeout(startObserving, 200);
    }
  }

  startObserving();
})();
