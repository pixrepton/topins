# 🔥 Silnik OZC (Obciążenie Cieplne Budynku)

## 📋 Opis

Deterministyczny silnik obliczeniowy obciążenia cieplnego budynku zgodny z **PN-EN 12831**.

Silnik działa jako **fallback (tryb awaryjny)** dla API cieplo.app, zapewniając ciągłość działania systemu nawet gdy zewnętrzne API nie jest dostępne.

**Wersja:** 3.0 (przebudowany - zero roku budowy, tylko lookupy w JSON-ach)

## 🎯 Cel

Silnik oblicza projektowe obciążenie cieplne **Φ_HL** dla całego budynku, używając **TYLKO danych z payload API cieplo.app**.

**Zasady fundamentalne:**

- ✅ Przyjmuje dokładnie TEN SAM payload, który normalnie wysyłany jest do API `cieplo.app`
- ✅ **NIE używa roku budowy** do zgadywania wartości
- ✅ **NIE liczy fizyki przegród** (brak warstw, brak R, brak lambd)
- ✅ Odtwarza logikę cieplo.app przez **lookupy w JSON-ach**
- ✅ Deterministyczny fallback (offline / timeout / 5xx)
- ✅ Jasna, modularna architektura produkcyjna

## 🏗️ Architektura

```
engine/ozc/
├── src/
│   ├── index.ts                # Publiczny entrypoint
│   ├── types.ts                # Typy wejścia/wyjścia
│   ├── calculateOZC.ts         # Główna funkcja obliczająca
│   ├── cieploMapper.ts         # API payload → model normowy
│   ├── geometry.ts             # A, P, B', kubatura
│   ├── transmission.ts         # Φ_T
│   ├── ventilation.ts          # Φ_V
│   ├── utils.ts                # Narzędzia pomocnicze
│   └── climate.ts              # Rozwiązywanie strefy klimatycznej
├── data/
│   ├── materials.json          # ID materiałów → lambda (uproszczone)
│   ├── windows.json            # windows_type → U
│   ├── doors.json              # doors_type → U
│   ├── ventilation.json        # ventilation_type → ACH / η
│   ├── climate.json            # Strefy → θ_e, θ_m,e
│   └── defaults.json           # TYLKO fallbacki, bez "roku budowy"
├── ozc-engine.js               # Silnik JavaScript (używany w przeglądarce)
├── tests/
│   └── ozc-engine.test.ts      # Testy deterministyczne
└── README_OZC_ENGINE.md        # Ta dokumentacja
```

## 🔧 Zasady obliczeń

### 1. Wejście = Payload API cieplo.app (1:1)

Silnik przyjmuje dokładnie ten sam payload, który jest wysyłany do API cieplo.app.

**NIE pyta użytkownika o nic nowego.**

### 2. Mapowanie payload → model

`cieploMapper.ts` mapuje payload na `NormalizedBuildingModel`:

- **Geometria:** z `floor_area` lub `building_length+building_width`
- **Wartości U:** TYLKO z danych payloadu (materiały, izolacje, grubości)
- **Okna/Drzwi:** lookup z `windows_type` / `doors_type` w JSON-ach
- **Wentylacja:** lookup z `ventilation_type` w JSON-ach
- **Klimat:** fallback PL_III (docelowo mapping lat/lon → zoneId)

### 3. Straty przez przenikanie Φ_T

```
HT = Σ(U_i * A_i)   [W/K]
Φ_T = HT * ΔT       [W]
```

gdzie:

- `U_i` = TYLKO z danych payloadu (materiały + izolacje) lub fallback
- `A_i` = obliczone z geometrii payloadu
- `ΔT` = `indoor_temperature - theta_e`

**Brak danych o izolacji → fallback U + warning + assumption**

### 4. Straty wentylacyjne Φ_V

```
V_dot = ACH * volume   [m³/h]
HV = 0.34 * V_dot      [W/K]
Φ_V = HV * ΔT * (1 - η_rec)   [W]
```

gdzie:

- `ACH` = lookup z `ventilation_type` w JSON-ach
- `η_rec` = lookup z `ventilation_type` w JSON-ach

### 5. Mostki cieplne Φ_ψ

```
Φ_ψ = Φ_T * (multiplier - 1)
```

gdzie `multiplier` z `defaults.json` (domyślnie 1.10 = +10%)

**NIE używa roku budowy** do określenia poziomu mostków.

### 6. Podłoga na gruncie

Uproszczony model:

```
Φ_ground = U_floor * A_floor * ΔT
```

gdzie `U_floor` z danych payloadu (izolacja) lub fallback.

### 7. Safety factor

Z `defaults.json` (domyślnie 1.10 = +10%)

## 📊 Format wyniku

```javascript
{
  designHeatLoss_W: 5200,        // W
  designHeatLoss_kW: 5.2,        // kW
  heatLossPerM2: 35.86,         // W/m²
  breakdown: {
    transmission: 3500,          // W
    ventilation: 1200,           // W
    bridges: 200                // W
  },
  assumptions: [...],            // Założenia (fallbacki, metody)
  warnings: [...]                // Ostrzeżenia (braki danych)
}
```

## 🔌 Integracja

### W przeglądarce

Silnik jest automatycznie używany jako fallback gdy API cieplo.app nie działa:

```javascript
// W calculatorInit.js
try {
  const response = await fetch(proxyUrl, {...});
  // ... obsługa odpowiedzi
} catch (apiError) {
  // Rozróżnienie: 4xx = błąd danych (NIE fallback)
  // 5xx/timeout = błąd serwera (użyj fallback)
  if (isServerError) {
    if (window.OZCEngine) {
      const ozcResult = await window.OZCEngine.calculate(payload);
      const cieploFormat = window.OZCEngine.convertToCieploAppFormat(ozcResult, payload);
      // Użyj wyniku...
    }
  }
}
```

### Format zgodny z cieplo.app

Silnik zwraca wyniki w formacie kompatybilnym z API cieplo.app, więc UI i konfigurator nie muszą wiedzieć, skąd pochodzi wynik.

**Dodatkowe pola w fallback:**

- `fallback: true` - oznacza, że wynik pochodzi z silnika lokalnego

## 📐 Założenia domyślne (fallbacki)

Gdy brak danych w payloadzie, silnik używa wartości z `defaults.json`:

- **U_wall:** 0.6 W/(m²·K)
- **U_roof:** 0.3 W/(m²·K)
- **U_floor:** 0.4 W/(m²·K)
- **U_window:** 1.3 W/(m²·K)
- **U_door:** 1.8 W/(m²·K)
- **Wentylacja:** naturalna (ach=0.8)
- **Mostki:** multiplier=1.10
- **Safety:** 1.10

**Wszystkie fallbacki są zapisywane w `assumptions[]` i `warnings[]` w wyniku.**

## ⚠️ Ostrzeżenia

Silnik generuje ostrzeżenia gdy:

- Brak danych o izolacji (używa fallback)
- Nieznany typ okien/drzwi (używa fallback)
- Nieznany typ wentylacji (używa fallback)
- Brak danych geometrycznych (oblicza z dostępnych danych lub fallback)
- Wartości W/m² poza zakresem 20-250 (sanity check)

## 🧪 Testy

Testy obejmują:

- Podstawowy payload → wynik deterministyczny
- Brak danych → fallbacki działają
- Sanity checks (W/m² w rozsądnym zakresie)

**Uruchomienie testów:**

```javascript
// W przeglądarce
window.OZCTests.runAll();
```

## 📚 Źródła

- **PN-EN 12831** - Obciążenie cieplne budynków
- **PN-EN ISO 13370** - Podłoga na gruncie (referencja, używamy uproszczenia)
- **PN-EN ISO 14683** - Mostki cieplne (referencja, używamy heurystyki)
- **PN-EN ISO 6946** - Opór cieplny przegród
- **WT2021** - Warunki techniczne

## 🔄 Kalibracja

Silnik można kalibrować poprzez:

1. Modyfikację plików JSON w `data/`
2. Dostosowanie wartości fallback w `defaults.json`
3. Aktualizację lookupów (windows, doors, ventilation, materials)

**Wszystkie wartości są jawne i oznaczone w `assumptions[]`.**

## 🚀 Status

✅ **Gotowy do użycia** - silnik jest w pełni funkcjonalny i zintegrowany z systemem.

**Tryb:** Fallback (awaryjny) - używany gdy cieplo.app API nie działa (5xx/timeout).

**Rozróżnienie błędów:**

- **4xx (błąd danych):** NIE używa fallback - błąd jest przekazywany do użytkownika
- **5xx/timeout (błąd serwera):** Używa fallback - oblicza lokalnie

## 📝 Zasady projektowe

### Determinizm

- Wszystkie obliczenia są deterministyczne
- Brak losowości
- Te same dane wejściowe = ten sam wynik

### Jawność

- Każdy fallback = `assumptions[]`
- Każdy brak danych = `warnings[]`
- Każda heurystyka = jawnie nazwana

### Zero zgadywania

- **NIE używa roku budowy** do zgadywania wartości
- **NIE liczy fizyki warstw** (tylko uproszczony model jeśli są dane)
- **TYLKO lookupy w JSON-ach** + fallbacki

### Modularność

- Kod jest modularny i łatwy do rozbudowy
- Każdy moduł ma jedną odpowiedzialność
- Łatwa kalibracja i testowanie

### Produkcyjność

- Kod jest gotowy do użycia w środowisku produkcyjnym
- Obsługa błędów i walidacja
- Testy deterministyczne

## 🔍 Zmiany w wersji 3.0

### Przebudowa architektury

- ✅ Wejście = payload API cieplo.app (1:1)
- ✅ Usunięto wszystkie odwołania do roku budowy
- ✅ Uproszczono obliczenia U (tylko z materiałów jeśli są, inaczej fallback)
- ✅ Lookupy w JSON-ach zamiast obliczeń fizycznych

### Zasady fundamentalne

- ✅ **ZERO roku budowy** - nie używa do zgadywania wartości
- ✅ **ZERO fizyki warstw** - tylko uproszczony model jeśli są dane
- ✅ **TYLKO lookupy** - windows, doors, ventilation, materials z JSON-ów
- ✅ **Fallbacki jawne** - wszystkie w `defaults.json` + `assumptions[]`

### Struktura

- ✅ `calculateOZC.ts` - główna funkcja
- ✅ `cieploMapper.ts` - mapowanie payload → model
- ✅ `geometry.ts` - obliczanie geometrii
- ✅ `transmission.ts` - HT, Φ_T
- ✅ `ventilation.ts` - HV, Φ_V
- ✅ `utils.ts` - narzędzia pomocnicze
- ✅ `climate.ts` - rozwiązywanie strefy

---

**TOP-INSTAL Wycena 2025**
_Silnik OZC - wersja 3.0 (zero roku budowy, tylko lookupy)_
