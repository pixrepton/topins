# 📊 Analiza plików JSON w folderze `data/`

## ✅ Status: Wszystkie pliki zweryfikowane i poprawione

---

## 📁 Pliki używane (6 plików)

### 1. **defaults.json** ✅

**Status:** Używany, wartości poprawne

**Zawartość:**

- `fallback` - wartości domyślne U, powierzchnie okien/drzwi, współczynniki dachu
- `corrections` - mnożniki mostków cieplnych i safety factor

**Użycie:**

- `ozc-engine.js` - wbudowane dane
- `src/compare.ts` - ładowanie w Node.js
- `src/cieploMapper.ts` - fallback wartości

**Wartości zgodne z wbudowanymi danymi w `ozc-engine.js`** ✅

---

### 2. **windows.json** ✅

**Status:** Używany, **ZAKTUALIZOWANY** - dodano brakujące typy

**Zawartość:**

```json
{
  "old_single_glass": 2.8,
  "old_double_glass": 2.5,
  "semi_new_double_glass": 2.0, // ✅ DODANE
  "new_double_glass": 1.3,
  "new_triple_glass": 0.9,
  "2021_double_glass": 1.0, // ✅ DODANE
  "2021_triple_glass": 0.8 // ✅ DODANE
}
```

**Użycie:**

- `ozc-engine.js` - wbudowane dane
- `src/compare.ts` - ładowanie w Node.js
- `src/cieploMapper.ts` - lookup U_okien
- Formularz kalkulatora używa wszystkich typów

**Wartości zgodne z wbudowanymi danymi w `ozc-engine.js`** ✅

---

### 3. **doors.json** ✅

**Status:** Używany, wartości poprawne

**Zawartość:**

```json
{
  "old_wooden": 3.0,
  "old_metal": 3.5,
  "new_wooden": 1.8,
  "new_metal": 1.5,
  "new_pvc": 1.3
}
```

**Użycie:**

- `ozc-engine.js` - wbudowane dane
- `src/compare.ts` - ładowanie w Node.js
- `src/cieploMapper.ts` - lookup U_drzwi
- Formularz kalkulatora używa wszystkich typów

**Wartości zgodne z wbudowanymi danymi w `ozc-engine.js`** ✅

---

### 4. **ventilation.json** ✅

**Status:** Używany, wartości poprawne

**Zawartość:**

```json
{
  "natural": { "ach": 0.8, "eta_rec": 0.0 },
  "mechanical": { "ach": 0.6, "eta_rec": 0.0 },
  "mechanical_recovery": { "ach": 0.6, "eta_rec": 0.85 }
}
```

**Użycie:**

- `ozc-engine.js` - wbudowane dane
- `src/compare.ts` - ładowanie w Node.js
- `src/cieploMapper.ts` - lookup ACH i eta_rec
- `src/ventilation.ts` - obliczenia Φ_V

**Wartości zgodne z wbudowanymi danymi w `ozc-engine.js`** ✅
**Zgodne z rev_engine** (eta_rec=0.85 dla mechanical_recovery) ✅

---

### 5. **climate.json** ✅

**Status:** Używany, wartości poprawne

**Zawartość:**

```json
{
  "PL_III": { "theta_e": -20, "theta_m_e": 7.0 },
  "PL_IV": { "theta_e": -22, "theta_m_e": 6.0 }
}
```

**Użycie:**

- `ozc-engine.js` - wbudowane dane (tylko PL_III)
- `src/compare.ts` - ładowanie w Node.js
- `src/climate.ts` - rozwiązywanie strefy klimatycznej

**Wartości zgodne z wbudowanymi danymi w `ozc-engine.js`** ✅

**Uwaga:** Obecnie resolver zwraca zawsze PL_III (fallback). Docelowo powinien mapować lat/lon → zoneId.

---

### 6. **materials.json** ✅

**Status:** Używany, wartości poprawne

**Zawartość:**

```json
{
  "57": { "lambda": 0.25 },
  "88": { "lambda": 0.036 },
  "68": { "lambda": 0.04 }
}
```

**Użycie:**

- `ozc-engine.js` - wbudowane dane
- `src/compare.ts` - ładowanie w Node.js
- `src/cieploMapper.ts` - obliczenia U z materiałów (uproszczony model)

**Wartości zgodne z wbudowanymi danymi w `ozc-engine.js`** ✅

**Uwaga:** To są tylko przykładowe materiały. Pełna lista powinna być rozszerzona w przyszłości.

---

## ❌ Pliki usunięte (1 plik)

### 1. **u_values.json** ❌ USUNIĘTY

**Status:** Nieużywany, oparty na roku budowy

**Powód usunięcia:**

- ❌ NIE był importowany ani używany w kodzie
- ❌ Zawierał wartości oparte na **roku budowy** (czego NIE używamy)
- ❌ Tylko komentarz w `src/ground.ts` wspominał o nim (zaktualizowany)

**Zawartość (przed usunięciem):**

- Tabele U dla ścian/dachu/podłogi wg roku budowy (pre_1945, 1945_1965, etc.)
- Tabele U dla okien/drzwi (częściowo duplikowane w windows.json/doors.json)

**Alternatywa:**

- Używamy `defaults.json` dla fallback wartości
- Używamy `windows.json` / `doors.json` dla lookupów
- Używamy materiałów z `materials.json` do obliczeń U (uproszczony model)

---

## 📋 Podsumowanie

### ✅ Wszystkie używane pliki są poprawne:

1. **defaults.json** - ✅
2. **windows.json** - ✅ (zaktualizowany - dodano 3 brakujące typy)
3. **doors.json** - ✅
4. **ventilation.json** - ✅
5. **climate.json** - ✅
6. **materials.json** - ✅

### ❌ Usunięte nieużywane pliki:

1. **u_values.json** - ❌ (oparty na roku budowy, nieużywany)

### 🔄 Zaktualizowane pliki:

1. **windows.json** - dodano: `semi_new_double_glass`, `2021_double_glass`, `2021_triple_glass`
2. **ozc-engine.js** - zaktualizowane wbudowane dane WINDOWS
3. **src/compare.ts** - zaktualizowane wbudowane dane windows
4. **tests/ozc-engine.test.ts** - zaktualizowane dane testowe
5. **src/ground.ts** - zaktualizowany komentarz (usunięto referencję do u_values.json)

---

## ✅ Weryfikacja zgodności

Wszystkie wartości w plikach JSON są **zgodne** z wbudowanymi danymi w `ozc-engine.js`:

- ✅ `defaults.json` ↔ `DEFAULTS` w ozc-engine.js
- ✅ `windows.json` ↔ `WINDOWS` w ozc-engine.js
- ✅ `doors.json` ↔ `DOORS` w ozc-engine.js
- ✅ `ventilation.json` ↔ `VENTILATION` w ozc-engine.js
- ✅ `climate.json` ↔ `CLIMATE` w ozc-engine.js (PL_III)
- ✅ `materials.json` ↔ `MATERIALS` w ozc-engine.js

---

## 🎯 Status końcowy

**Wszystkie pliki JSON są:**

- ✅ Używane w kodzie
- ✅ Zgodne z wbudowanymi danymi
- ✅ Zawierają wszystkie wymagane typy
- ✅ Poprawne wartości

**Nieużywane pliki:**

- ❌ Usunięte (u_values.json)

---

**TOP-INSTAL Wycena 2025**
_Analiza plików JSON - wersja 1.0_
