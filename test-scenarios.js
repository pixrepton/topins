/**
 * test-scenarios.js
 *
 * Testy scenariuszy dla silnika OZC
 * Sanity bounds + testy metamorfizmu
 */

(function () {
  'use strict';

  if (typeof window.OZCEngine === 'undefined') {
    console.error('❌ Silnik OZC nie jest załadowany');
    return;
  }

  /**
   * Test sanity bounds - sprawdza czy wyniki są w realistycznym zakresie
   */
  async function testSanityBounds() {
    console.log('\n🧪 Test sanity bounds');

    const testCases = [
      {
        name: 'Nowy dom z rekuperacją',
        input: {
          building_type: 'single_house',
          construction_year: 2022,
          construction_type: 'traditional',
          latitude: 52.2297,
          longitude: 21.0122,
          building_length: 12,
          building_width: 8,
          building_floors: 1,
          building_heated_floors: [1],
          floor_height: 2.6,
          building_roof: 'steep',
          has_basement: false,
          has_balcony: true,
          number_windows: 12,
          number_doors: 1,
          number_balcony_doors: 1,
          windows_type: '2021_triple_glass',
          doors_type: 'new_pvc',
          indoor_temperature: 21,
          ventilation_type: 'mechanical_recovery',
        },
        expectedRange: { min: 20, max: 50 }, // W/m²
      },
      {
        name: 'Stary dom bez izolacji',
        input: {
          building_type: 'single_house',
          construction_year: 1970,
          construction_type: 'traditional',
          latitude: 52.2297,
          longitude: 21.0122,
          building_length: 10,
          building_width: 6,
          building_floors: 1,
          building_heated_floors: [1],
          floor_height: 2.5,
          building_roof: 'steep',
          has_basement: true,
          has_balcony: false,
          number_windows: 8,
          number_doors: 1,
          windows_type: 'old_double_glass',
          doors_type: 'old_wooden',
          indoor_temperature: 20,
          ventilation_type: 'natural',
        },
        expectedRange: { min: 80, max: 150 }, // W/m²
      },
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      try {
        const result = await window.OZCEngine.calculate(testCase.input);
        const wPerM2 = result.heatLossPerM2;

        console.log(`\n  ${testCase.name}:`);
        console.log(`    Wynik: ${wPerM2.toFixed(2)} W/m²`);
        console.log(
          `    Oczekiwany zakres: ${testCase.expectedRange.min}-${testCase.expectedRange.max} W/m²`
        );

        if (wPerM2 >= testCase.expectedRange.min && wPerM2 <= testCase.expectedRange.max) {
          console.log(`    ✅ PASS`);
          passed++;
        } else {
          console.log(`    ❌ FAIL - poza zakresem`);
          failed++;
        }
      } catch (error) {
        console.error(`    ❌ ERROR: ${error.message}`);
        failed++;
      }
    }

    console.log(`\n  Podsumowanie: ${passed} passed, ${failed} failed`);
    return { passed, failed };
  }

  /**
   * Test metamorfizmu - sprawdza czy zmiany parametrów wpływają na wynik zgodnie z oczekiwaniami
   */
  async function testMetamorphism() {
    console.log('\n🧪 Test metamorfizmu');

    const baseInput = {
      building_type: 'single_house',
      construction_year: 2000,
      construction_type: 'traditional',
      latitude: 52.2297,
      longitude: 21.0122,
      building_length: 10,
      building_width: 7,
      building_floors: 1,
      building_heated_floors: [1],
      floor_height: 2.6,
      building_roof: 'steep',
      has_basement: false,
      has_balcony: false,
      number_windows: 10,
      number_doors: 1,
      windows_type: 'new_double_glass',
      doors_type: 'new_wooden',
      indoor_temperature: 21,
      ventilation_type: 'mechanical',
    };

    let passed = 0;
    let failed = 0;

    // Test 1: Więcej okien → większe straty
    console.log('\n  Test 1: Więcej okien → większe straty');
    try {
      const base = await window.OZCEngine.calculate(baseInput);
      const moreWindows = await window.OZCEngine.calculate({
        ...baseInput,
        number_windows: 20,
      });

      if (moreWindows.designHeatLoss_W > base.designHeatLoss_W) {
        console.log(`    ✅ PASS: ${base.designHeatLoss_W}W → ${moreWindows.designHeatLoss_W}W`);
        passed++;
      } else {
        console.log(`    ❌ FAIL: straty nie wzrosły`);
        failed++;
      }
    } catch (error) {
      console.error(`    ❌ ERROR: ${error.message}`);
      failed++;
    }

    // Test 2: Rekuperacja → mniejsze straty wentylacyjne
    console.log('\n  Test 2: Rekuperacja → mniejsze Φ_V');
    try {
      const natural = await window.OZCEngine.calculate({
        ...baseInput,
        ventilation_type: 'natural',
      });
      const recovery = await window.OZCEngine.calculate({
        ...baseInput,
        ventilation_type: 'mechanical_recovery',
      });

      if (recovery.breakdown.ventilation < natural.breakdown.ventilation) {
        console.log(
          `    ✅ PASS: ${natural.breakdown.ventilation}W → ${recovery.breakdown.ventilation}W`
        );
        passed++;
      } else {
        console.log(`    ❌ FAIL: straty wentylacyjne nie zmalały`);
        failed++;
      }
    } catch (error) {
      console.error(`    ❌ ERROR: ${error.message}`);
      failed++;
    }

    // Test 3: Mniejsze ΔT → mniejszy wynik
    console.log('\n  Test 3: Mniejsze ΔT → mniejszy wynik');
    try {
      const cold = await window.OZCEngine.calculate({
        ...baseInput,
        indoor_temperature: 21,
        latitude: 52.0, // Strefa III, -20°C
      });
      const warm = await window.OZCEngine.calculate({
        ...baseInput,
        indoor_temperature: 21,
        latitude: 54.0, // Strefa I, -16°C
      });

      if (warm.designHeatLoss_W < cold.designHeatLoss_W) {
        console.log(`    ✅ PASS: ${cold.designHeatLoss_W}W → ${warm.designHeatLoss_W}W`);
        passed++;
      } else {
        console.log(`    ❌ FAIL: wynik nie zmalał przy mniejszym ΔT`);
        failed++;
      }
    } catch (error) {
      console.error(`    ❌ ERROR: ${error.message}`);
      failed++;
    }

    // Test 4: Większa powierzchnia → większe straty (ale mniejsze W/m² dla większych budynków)
    console.log('\n  Test 4: Większa powierzchnia → większe straty całkowite');
    try {
      const small = await window.OZCEngine.calculate({
        ...baseInput,
        building_length: 8,
        building_width: 6,
      });
      const large = await window.OZCEngine.calculate({
        ...baseInput,
        building_length: 12,
        building_width: 10,
      });

      if (large.designHeatLoss_W > small.designHeatLoss_W) {
        console.log(`    ✅ PASS: ${small.designHeatLoss_W}W → ${large.designHeatLoss_W}W`);
        passed++;
      } else {
        console.log(`    ❌ FAIL: straty nie wzrosły`);
        failed++;
      }
    } catch (error) {
      console.error(`    ❌ ERROR: ${error.message}`);
      failed++;
    }

    // Test 5: Confidence jest w zakresie 0-1
    console.log('\n  Test 5: Confidence w zakresie 0-1');
    try {
      const result = await window.OZCEngine.calculate(baseInput);
      if (result.confidence >= 0 && result.confidence <= 1) {
        console.log(`    ✅ PASS: confidence = ${result.confidence.toFixed(2)}`);
        passed++;
      } else {
        console.log(`    ❌ FAIL: confidence poza zakresem`);
        failed++;
      }
    } catch (error) {
      console.error(`    ❌ ERROR: ${error.message}`);
      failed++;
    }

    console.log(`\n  Podsumowanie: ${passed} passed, ${failed} failed`);
    return { passed, failed };
  }

  /**
   * Uruchom wszystkie testy
   */
  async function runAllTests() {
    console.log('🚀 Uruchamianie testów silnika OZC...\n');

    const sanity = await testSanityBounds();
    const meta = await testMetamorphism();

    const totalPassed = sanity.passed + meta.passed;
    const totalFailed = sanity.failed + meta.failed;

    console.log('\n' + '='.repeat(50));
    console.log('📊 PODSUMOWANIE WSZYSTKICH TESTÓW:');
    console.log(`   ✅ Passed: ${totalPassed}`);
    console.log(`   ❌ Failed: ${totalFailed}`);
    console.log(
      `   📈 Success rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`
    );
    console.log('='.repeat(50));

    return {
      sanity,
      meta,
      total: { passed: totalPassed, failed: totalFailed },
    };
  }

  // Eksport
  window.OZCTests = {
    runAll: runAllTests,
    testSanityBounds: testSanityBounds,
    testMetamorphism: testMetamorphism,
  };

  console.log('✅ Moduł testów OZC załadowany. Użyj: window.OZCTests.runAll()');
})();
