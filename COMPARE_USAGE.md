# 🔍 Adapter Porównawczy - Użycie

Adapter porównawczy pozwala na jednoczesne uruchomienie API cieplo.app i naszego fallbacku, z automatycznym raportem różnic.

## 📦 Instalacja / Import

```typescript
import { compareOZC, compareOZCBatch, logComparison } from './engine/ozc/src';
```

## 🚀 Podstawowe użycie

```typescript
const payload: CieploApiPayload = {
  building_type: 'single_house',
  latitude: 50.27,
  longitude: 19.03,
  building_length: 10.0,
  building_width: 10.0,
  building_floors: 1,
  building_heated_floors: [1],
  floor_height: 2.6,
  building_roof: 'steep',
  has_basement: false,
  has_balcony: false,
  wall_size: 40,
  primary_wall_material: 57,
  external_wall_isolation: { material: 88, size: 10 },
  top_isolation: { material: 68, size: 25 },
  bottom_isolation: { material: 71, size: 15 },
  number_doors: 2,
  number_balcony_doors: 0,
  number_windows: 12,
  number_huge_windows: 0,
  doors_type: 'new_metal',
  windows_type: 'new_double_glass',
  indoor_temperature: 21,
  ventilation_type: 'natural',
};

const report = await compareOZC(payload, {
  endpointUrl: 'https://api.cieplo.app/calculation',
  apiKey: 'YOUR_API_KEY', // opcjonalne
  timeoutMs: 4500,
});

console.log('Delta:', report.delta);
console.log('Headline:', report.explanation.headline);
console.log('Suspects:', report.explanation.suspects);
console.log('Warnings:', report.notes.warnings);
```

## 📊 Format wyniku

```typescript
{
  ok: true,
  payloadEchoHash: "h1234abcd",

  online: {
    ok: true,
    status: 200,
    durationMs: 234,
    result: {
      designHeatLoss_kW: 5.6,
      breakdown: { ... }
    }
  },

  offline: {
    ok: true,
    result: {
      designHeatLoss_kW: 5.2,
      heatLossPerM2: 35.86,
      breakdown: { ... }
    }
  },

  delta: {
    offline_kW: 5.2,
    online_kW: 5.6,
    abs_kW: 0.4,
    pct: 7.1  // 7.1% różnicy
  },

  explanation: {
    headline: "Różnica najpewniej wynika z wentylacji/okien...",
    bullets: [
      "Δ = 0.40 kW (7.1% vs cieplo.app).",
      "Offline: 5.20 kW, ~36 W/m²."
    ],
    suspects: [
      {
        label: "Okna - największy wpływ na wynik",
        weight: 0.9,
        details: [
          "windows_type=new_double_glass",
          "Z rev_engine: różnice między typami okien to -0.5kW do +2.4kW"
        ]
      }
    ]
  },

  notes: {
    assumptions: [ ... ],
    warnings: [ ... ]
  }
}
```

## 🔄 Batch mode - wiele payloadów

```typescript
const payloads = [
  { id: 'test1', payload: payload1 },
  { id: 'test2', payload: payload2 },
  // ...
];

const batchResult = await compareOZCBatch(
  payloads,
  {
    endpointUrl: 'https://api.cieplo.app/calculation',
    timeoutMs: 4500,
  },
  (current, total, id) => {
    console.log(`Progress: ${current}/${total} - ${id}`);
  }
);

console.log('Summary:', batchResult.summary);
// {
//   total: 50,
//   onlineOk: 48,
//   avgDeltaPct: 5.2,
//   maxDeltaPct: 15.3,
//   topDiscrepancies: [
//     { id: 'test15', deltaPct: 15.3 },
//     { id: 'test7', deltaPct: 12.1 },
//     ...
//   ]
// }
```

## 📝 Logowanie do pliku (regresja)

```typescript
import { logComparison, readComparisons } from './engine/ozc/src';

// Zapisuj każde porównanie
const report = await compareOZC(payload, config);
logComparison(report, 'ozc_comparisons.jsonl');

// Czytaj wszystkie porównania
const allComparisons = readComparisons('ozc_comparisons.jsonl');
console.log(`Zapisano ${allComparisons.length} porównań`);
```

## 🎯 Diagnostyka różnic (z wiedzy rev_engine)

Adapter automatycznie analizuje różnice bazując na wiedzy z `rev_engine`:

### Największe wpływy (z rev_engine):

1. **Okna** (`windows_type`) - dyskretne klasy:

   - `old_single_glass`: +2.4kW
   - `old_double_glass`: +1.7kW
   - `new_double_glass`: 0 (baseline)
   - `new_triple_glass`: -0.3kW
   - `2021_triple_glass`: -0.5kW

2. **Wentylacja z rekuperacją**:

   - `mechanical_recovery` vs `natural`: ~-1kW / -1.8MWh/rok

3. **Temperatura wewnętrzna**:

   - ±2°C = ±0.25kW / ±1MWh/rok

4. **Przestrzenie nieogrzewane**:

   - Piwnica (worst→great): -0.1kW do -0.4kW

5. **Geometria**:
   - ±10% wymiaru = ±0.4kW

### Co NIE wpływa (z rev_engine):

- **Rok budowy** - NIE wpływa na wynik (potwierdza nasze założenie "zero roku budowy")

## ⚠️ Obsługa błędów

```typescript
const report = await compareOZC(payload, config);

if (!report.online.ok) {
  console.error('API error:', report.online.error);
  console.log('Używam fallback:', report.offline.result);
}

// Rozróżnienie błędów:
// - 4xx (walidacja): NIE używa fallback
// - 5xx/timeout: używa fallback
```

## 🔧 Konfiguracja

```typescript
const config: CieploClientConfig = {
  endpointUrl: 'https://api.cieplo.app/calculation',
  apiKey: 'optional_key',
  timeoutMs: 4500, // timeout w ms
  headers: {
    'Custom-Header': 'value',
  },
};
```

## 📈 Przykład użycia w testach

```typescript
describe('OZC Comparison', () => {
  it('should compare with cieplo.app', async () => {
    const report = await compareOZC(baselinePayload, config);

    expect(report.online.ok).toBe(true);
    expect(report.offline.ok).toBe(true);

    // Różnica powinna być < 15%
    if (report.delta.pct) {
      expect(Math.abs(report.delta.pct)).toBeLessThan(15);
    }

    // Zapisuj do logów
    logComparison(report);
  });
});
```

---

**TOP-INSTAL Wycena 2025**
_Adapter porównawczy - wersja 1.0_
