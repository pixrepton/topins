# 🔬 Analiza rev_engine - Wnioski dla silnika OZC

## 📋 Podsumowanie analizy

Przeanalizowano folder `rev_engine/` zawierający odwrotną inżynierię API cieplo.app dla typu `single_house`.

**Źródła:**

- `reverse_engine_final.py` - skrypt testujący API
- `engine_spec_single_house.md` - szczegółowa specyfikacja zachowania
- `reverse_results_final.json` - wyniki 100 testów
- `baseline.json` - budynek referencyjny

## 🎯 Kluczowe odkrycia

### 1. **Rok budowy NIE wpływa na wynik** ✅

**Z rev_engine:**

```
construction_year: 1914-2025 → ΔE_year = 0 kWh, ΔP_max ≈ ±0.1 kW
```

**Wniosek:** Silnik cieplo.app **nie zakodowuje** jakości budynku w samym roku budowy. O izolacyjności decydują **realne parametry ścian, izolacji, okien i drzwi**.

**Potwierdza nasze założenie:** ✅ "ZERO roku budowy" - nie używamy do zgadywania wartości.

### 2. **Okna - NAJWIĘKSZY wpływ (dyskretne klasy)**

**Z rev_engine - różnice względem baseline (`new_double_glass`):**

| `windows_type`          | ΔP_max              | ΔE_year       |
| ----------------------- | ------------------- | ------------- |
| `2021_triple_glass`     | **-0.5 kW**         | **-1000 kWh** |
| `2021_double_glass`     | **-0.3 kW**         | **-500 kWh**  |
| `new_triple_glass`      | **-0.3 kW**         | **-500 kWh**  |
| `new_double_glass`      | **0 kW** (baseline) | **0 kWh**     |
| `semi_new_double_glass` | **+0.9 kW**         | **+1600 kWh** |
| `old_double_glass`      | **+1.7 kW**         | **+3200 kWh** |
| `old_single_glass`      | **+2.4 kW**         | **+4300 kWh** |

**Charakterystyka:**

- Silnik traktuje typ okien jako **kategorie dyskretne** z przypisaną paczką (ΔP, ΔE)
- Różnice są **duże** - przejście z nowych do starych szyb to ~**+2.4 kW i +4.3 MWh/rok**
- W analizowanym zakresie **nie ma płynnego przejścia** - typ okien wybiera się z predefiniowanego zbioru klas efektywności

**Dla naszego silnika:**

- ✅ Używamy lookupów w `windows.json` (U_okien)
- ⚠️ Możemy dodać **korekty addytywne** bazujące na typie okien (zamiast tylko U \* A)

### 3. **Drzwi - mniejszy wpływ, ale mierzalny**

**Z rev_engine - różnice względem baseline (`new_metal`):**

| `doors_type` | ΔP_max      | ΔE_year      |
| ------------ | ----------- | ------------ |
| `new_metal`  | **0 kW**    | **0 kWh**    |
| `new_pvc`    | ~0 kW       | ~0 kWh       |
| `new_wooden` | ~0 kW       | **-100 kWh** |
| `old_metal`  | **+0.1 kW** | **+100 kWh** |
| `old_wooden` | **+0.2 kW** | **+300 kWh** |

**Wniosek:** Efekt jest zbliżony do **sumy** oddzielnych efektów okien i drzwi → **korektę można przybliżać addytywnie**.

**Dla naszego silnika:**

- ✅ Używamy lookupów w `doors.json` (U_drzwi)
- ⚠️ Możemy dodać **korekty addytywne** bazujące na typie drzwi

### 4. **Wentylacja z rekuperacją - duży wpływ**

**Z rev_engine:**

| Typ wentylacji             | ΔP_max (vs natural) | ΔE_year (vs natural) |
| -------------------------- | ------------------- | -------------------- |
| `natural`                  | 0 (baseline)        | 0 (baseline)         |
| `mechanical` (bez odzysku) | ~0 kW               | ~0 kWh               |
| `mechanical_recovery`      | **-1.0 kW**         | **-1800 kWh**        |

**Wniosek:**

- Typ `mechanical` jest neutralny energetycznie w stosunku do `natural`
- `mechanical_recovery` daje **istotne oszczędności** - rząd wielkości **-1 kW / -1.8 MWh/rok** przy 21°C

**Dla naszego silnika:**

- ✅ Używamy lookupów w `ventilation.json` (ACH, eta_rec)
- ✅ Formuła `Φ_V = HV * ΔT * (1 - η_rec)` jest poprawna
- ⚠️ Sprawdź czy `eta_rec=0.85` dla `mechanical_recovery` jest zgodne z cieplo.app

### 5. **Temperatura wewnętrzna - wpływ liniowy**

**Z rev_engine:**

- Zmiana o **±2°C** powoduje zmianę rzędu **±0.25 kW** w mocy szczytowej
- oraz **±1.0 MWh/rok** w energii rocznej

**Dla naszego silnika:**

- ✅ Używamy `indoor_temperature` z payloadu
- ✅ Formuła `ΔT = theta_int - theta_e` jest poprawna

### 6. **Przestrzenie nieogrzewane (piwnica)**

**Z rev_engine - dla `has_basement = true`:**

| `unheated_space_under_type` | ΔP_max      | ΔE_year      |
| --------------------------- | ----------- | ------------ |
| `worst`                     | **-0.1 kW** | **-200 kWh** |
| `poor`                      | **-0.2 kW** | **-400 kWh** |
| `medium`                    | **-0.3 kW** | **-600 kWh** |
| `great`                     | **-0.4 kW** | **-800 kWh** |

**Wniosek:** Im **lepsza izolacja przestrzeni nieogrzewanej pod spodem**, tym **mniejsze straty** → mniejsza wymagana moc i energia.

**Dla naszego silnika:**

- ⚠️ Obecnie **nie uwzględniamy** przestrzeni nieogrzewanych w pełni
- ⚠️ Możemy dodać korekty bazujące na `has_basement` + `unheated_space_under_type`

### 7. **Geometria - prawie liniowa**

**Z rev_engine:**

- **±10%** w jednym wymiarze: ΔP_max ≈ ±0.4 kW, ΔE_year ≈ ±600-700 kWh
- **±20%**: ΔP_max ≈ ±0.7 kW, ΔE_year ≈ ±1100-1200 kWh
- Dołożenie **kolejnego ogrzewanego piętra**: +1.8...3.1 kW, +3.3...8.9 MWh/rok

**Wniosek:** Silnik zachowuje się jak **prawie liniowa funkcja ogrzewanej powierzchni** przy zachowaniu podobnej kompaktowości bryły.

**Dla naszego silnika:**

- ✅ Obliczamy geometrię z `floor_area` lub `building_length * building_width`
- ✅ Uwzględniamy `building_heated_floors` w kubaturze
- ✅ Formuły są zgodne z liniowym modelem

## 💡 Propozycje ulepszeń silnika

### 1. **Korekty addytywne dla okien** (opcjonalne)

Zamiast tylko `U_okien * A_okien`, możemy dodać korekty bazujące na typie:

```typescript
// W cieploMapper.ts lub calculateOZC.ts
const windowCorrections: Record<string, { deltaP_kW: number }> = {
  old_single_glass: { deltaP_kW: +2.4 },
  old_double_glass: { deltaP_kW: +1.7 },
  new_double_glass: { deltaP_kW: 0 },
  new_triple_glass: { deltaP_kW: -0.3 },
  '2021_triple_glass': { deltaP_kW: -0.5 },
};

// Dodaj korektę do Φ_T lub bezpośrednio do Φ_HL
const windowCorrection = windowCorrections[payload.windows_type]?.deltaP_kW ?? 0;
```

**Uwaga:** To może być redundantne z obecnym modelem `U * A`, ale może poprawić zgodność z cieplo.app.

### 2. **Korekty dla przestrzeni nieogrzewanych**

```typescript
// W calculateOZC.ts
function getUnheatedSpaceCorrection(payload: CieploApiPayload): number {
  if (!payload.has_basement) return 0;

  const underType = (payload as any).unheated_space_under_type ?? 'medium';
  const corrections: Record<string, number> = {
    worst: -0.1,
    poor: -0.2,
    medium: -0.3,
    great: -0.4,
  };

  return corrections[underType] ?? -0.3; // kW
}
```

### 3. **Weryfikacja eta_rec dla rekuperacji**

Sprawdź czy `eta_rec=0.85` w `ventilation.json` jest zgodne z cieplo.app (z rev_engine wynika że tak).

### 4. **Dokumentacja wpływu parametrów**

Dodaj do `explainDiff.ts` więcej szczegółów bazujących na rev_engine (już zrobione ✅).

## 📊 Model heurystyczny cieplo.app (z rev_engine)

Na podstawie analizy, cieplo.app używa modelu:

```
P_max ≈ A_heated * f_P_base  +  Σ(ΔP_z_okien) + Σ(ΔP_z_drzwi) + Σ(ΔP_z_wentylacji) + Σ(ΔP_z_piwnicy_i_unheated) + …
E_year ≈ A_heated * f_E_base +  Σ(ΔE_z_okien) + Σ(ΔE_z_drzwi) + Σ(ΔE_z_wentylacji) + Σ(ΔE_z_piwnicy_i_unheated) + …
```

gdzie:

- `f_P_base ≈ 65.6 W/m²` (dla baseline)
- `f_E_base ≈ 241 kWh/m²/rok` (dla baseline)
- Korekty są **addytywne** i **dyskretne** (tabele)

**Nasz silnik:**

- ✅ Używa modelu fizycznego (U \* A, HT, HV)
- ✅ Jest bardziej elastyczny niż tabelaryczny model cieplo.app
- ⚠️ Może dawać różne wyniki ze względu na różne podejście (fizyka vs tabele)

## ✅ Potwierdzenie naszych założeń

1. ✅ **"ZERO roku budowy"** - rev_engine potwierdza że rok NIE wpływa na wynik
2. ✅ **Lookupy w JSON-ach** - cieplo.app używa dyskretnych klas (okna, drzwi, wentylacja)
3. ✅ **Deterministyczny fallback** - model jest deterministyczny (tabele, nie ML)
4. ✅ **Modularność** - każdy parametr ma osobny wpływ (addytywny)

## 🎯 Priorytety ulepszeń

1. **Wysokie:**

   - ✅ Weryfikacja `eta_rec=0.85` dla rekuperacji
   - ✅ Dokumentacja wpływu parametrów w `explainDiff.ts` (zrobione)

2. **Średnie:**

   - ⚠️ Korekty dla przestrzeni nieogrzewanych (jeśli potrzebne)
   - ⚠️ Weryfikacja zgodności U_okien z cieplo.app

3. **Niskie:**
   - ⚠️ Korekty addytywne dla okien/drzwi (może być redundantne z U \* A)

---

**TOP-INSTAL Wycena 2025**
_Analiza rev_engine - wersja 1.0_
