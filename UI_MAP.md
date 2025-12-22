# 🗺️ MAPA UI - KALKULATOR & KONFIGURATOR TOP-INSTAL

**Data analizy:** 2025-01-XX
**Wersja:** FAZA A - Mapa UI + Intencja
**Status:** ✅ Kompletna

---

## 📋 SPIS TREŚCI

1. [Ekrany i Flow](#ekrany-i-flow)
2. [Komponenty UI](#komponenty-ui)
3. [Stany i Interakcje](#stany-i-interakcje)
4. [Logika Sterująca UI](#logika-sterująca-ui)
5. [Diagnoza Intencji](#diagnoza-intencji)
6. [Checklisty](#checklisty)

---

## 🎯 EKRANY I FLOW

### KALKULATOR (`calculator.html`)

#### Flow główny (7 sekcji):

```
START → [0] Informacje o budynku → [1] Wymiary → [2] Konstrukcja →
[3] Okna i drzwi → [4] Izolacja → [5] Podgrzewanie wody → [6] WYNIKI
```

#### Szczegóły sekcji:

**SEKCJA 0: Informacje o budynku** (`data-tab="0"`)

- **Cel:** Zbieranie podstawowych danych o budynku
- **Komponenty:**
  - Building type cards (4 opcje: dom, bliźniak, szeregowiec, mieszkanie)
  - Construction year select (dropdown)
  - Location selection (option cards - strefy klimatyczne)
- **Walidacja:** `building_type`, `construction_year`, `location_id` (wymagane)
- **Nawigacja:** `btn-next1` → przejście do sekcji 1

**SEKCJA 1: Wymiary budynku** (`data-tab="1"`)

- **Cel:** Zbieranie wymiarów i geometrii
- **Komponenty:**
  - Radio: kształt budynku (regularny/nieregularny)
  - Conditional fields: wymiary vs powierzchnia
  - Quantity inputs: długość, szerokość, kondygnacje, wysokość
  - Floor rendering (checkboxy dla ogrzewanych kondygnacji)
- **Walidacja:** Warunkowa w zależności od wyboru kształtu
- **Nawigacja:** `btn-prev` ← | `btn-next2` →

**SEKCJA 2: Konstrukcja i ściany** (`data-tab="2"`)

- **Cel:** Parametry konstrukcyjne
- **Komponenty:**
  - Radio: typ konstrukcji (tradycyjna/szkieletowa)
  - Conditional fields: materiały ścian, izolacja zewnętrzna
  - Quantity inputs: grubość ścian
- **Nawigacja:** `btn-prev` ← | `btn-next3` →

**SEKCJA 3: Okna i drzwi** (`data-tab="3"`)

- **Cel:** Parametry stolarki
- **Komponenty:**
  - Quantity inputs: liczba okien, drzwi, balkonów
  - Selects: typ okien, typ drzwi
- **Nawigacja:** `btn-prev` ← | `btn-next4` →

**SEKCJA 4: Izolacja** (`data-tab="4"`)

- **Cel:** Izolacja dachu/stropu i podłogi
- **Komponenty:**
  - Selects: materiał izolacji
  - Quantity inputs: grubość izolacji
- **Nawigacja:** `btn-prev` ← | `btn-next5` →

**SEKCJA 5: Podgrzewanie wody** (`data-tab="5"`)

- **Cel:** Parametry CWU
- **Komponenty:**
  - Radio: czy uwzględnić CWU
  - Conditional fields: liczba osób, profil zużycia
- **Nawigacja:** `btn-prev` ← | `btn-finish` → (wywołuje API)

**SEKCJA 6: Wyniki** (`data-tab="6"`)

- **Cel:** Wyświetlanie wyników obliczeń + konfigurator maszynowni
- **Komponenty:**
  - Results view (podstawowe wyniki)
  - Configurator view (9 kroków konfiguracji maszynowni)
  - Results switcher (przyciski przełączania widoków)
- **Nawigacja:** Powrót do edycji (przez `btn-prev` w poprzednich sekcjach)

---

### KONFIGURATOR (`konfigurator.html`)

#### Flow (9 kroków):

```
[1] Pompa ciepła → [2] Zasobnik CWU → [3] Bufor CO → [4] Cyrkulacja CWU →
[5] Service Cloud → [6] Posadowienie → [7] Reduktor → [8] Uzdatnianie → [9] Podsumowanie
```

#### Struktura:

- **Sticky selections bar** (górny pasek z wybranymi komponentami)
- **Options grid** (karty produktów renderowane dynamicznie przez `configurator-unified.js`)
- **Recommendation notes** (notatki z rekomendacjami z kalkulatora)

---

## 🧩 KOMPONENTY UI

### 1. KARTY WYBORU (Cards)

#### Building Type Cards (`.building-type-card`)

- **Rozmiar:** 120px × 130px
- **Layout:** Grid 4 kolumny (desktop), 2 kolumny (mobile)
- **Zawartość:** Ikona + label
- **Stany:** default, hover, focus, selected (`--selected`)
- **Lokalizacja:** Sekcja 0

#### Option Cards (`.option-card`)

- **Rozmiar:** 120px × 130px (domyślnie), 160px (wide), 110px (compact)
- **Layout:** Flex wrap
- **Zawartość:** Tytuł + podtytuł
- **Stany:** default, hover, focus, selected (`--selected`), disabled (`--disabled`)
- **Lokalizacja:** Wszystkie sekcje (strefy klimatyczne, opcje Tak/Nie, itp.)

### 2. PRZYCISKI (Buttons)

#### Primary CTA (`.btn-next1`, `.btn-next2`, ..., `.btn-finish`)

- **Styl:** Neutral premium (białe tło, ciemna ramka → hover: ciemne tło)
- **Rozmiar:** padding 14px 28px, min-width 120px
- **Stany:** default, hover (translateY -1px, shadow), active (translateY 0), disabled (opacity 0.45)
- **Ikony:** Animacja translateX przy hover
- **Lokalizacja:** `.btn-row` na dole każdej sekcji

#### Secondary (`.btn-prev`)

- **Styl:** Podobny do primary, ale hover: szare tło zamiast czarnego
- **Lokalizacja:** `.btn-row` (lewa strona)

### 3. POLA FORMULARZA (Form Fields)

#### Input Number (`.form-field-item input[type="number"]`)

- **Rozmiar:** height 52px, width 530px (desktop), 100% (mobile)
- **Border:** 1px solid #e0e0e0 → hover: #b8b8b8 → focus: 2px solid #3b82f6
- **Stany:** default, hover, focus, filled (`has-number-value` → border 2px #2b2b2b, bg #f7f7f7)
- **Checkmark:** Złoty checkmark (✓) po prawej stronie gdy wypełnione

#### Select Dropdown (`.form-select`, `select`)

- **Rozmiar:** height 52px, width 530px (desktop)
- **Border:** 1px solid #d1d5db → hover: #9ca3af → focus: #2563eb
- **Stany:** default, hover, focus (`is-active-select`), completed (`has-selected-value` → border 2px #2b2b2b)
- **Checkmark:** Złoty checkmark dla `construction_year` (po lewej stronie strzałki)

#### Radio Buttons (`.form-field__radio-label`)

- **Rozmiar:** min-height 54px, padding 14px 16px
- **Layout:** Flex column (zawsze jeden pod drugim)
- **Border:** 1px solid #e0e0e0 → hover: #b8b8b8 → checked: 2px solid #2b2b2b
- **Radio circle:** 19px × 19px, border-radius 50%
- **Stany:** default, hover, focus, checked (złoty checkmark w kółku)
- **Background:** checked → #f7f7f7

#### Quantity Input (`.quantity-input-wrapper`)

- **Layout:** Flex z przyciskami +/- po bokach
- **Przyciski:** 40px × 52px, border 1px, hover: bg light + border interactive
- **Input:** Bez border po bokach (połączony z przyciskami)

### 4. KARTY FORMULARZA (`.form-card`)

- **Layout:** Grid mosaic (`.form-row-mosaic`)
- **Padding:** Zgodny z sekcją
- **Border:** Brak (tło sekcji)
- **Spacing:** Gap między kartami zgodny z `--spacing-md`

### 5. PROGRESS BAR (`.progress-bar-container`)

- **Typ:** Sticky (przykleja się do góry przy scrollu)
- **Komponenty:**
  - Progress fill (`.form-progress-fill`) - pasek wypełnienia
  - Progress info (`.hp-progress-info`) - procent + label
- **Aktualizacja:** Przez `WorkflowController.updateProgress()`
- **Lokalizacja:** Nad formularzem, sticky podczas scrollu

### 6. HELP BOX (`.help-box`)

- **Styl:** Neutral, z ikoną informacyjną
- **Zawartość:** Tekst + opcjonalnie obrazek
- **Lokalizacja:** Pod labelami pól formularza

### 7. ERROR SYSTEM (`.error-system`)

- **Komponenty:**
  - Field errors (`.field-error`) - czerwona ramka + komunikat
  - Toast notifications (przez `ErrorHandler`)
- **Lokalizacja:** Pod polami z błędami

---

## 🎨 STANY I INTERAKCJE

### Stany Komponentów

#### 1. KARTY (Cards)

| Stan     | Border      | Background | Transform        | Checkmark        |
| -------- | ----------- | ---------- | ---------------- | ---------------- |
| Default  | 1px #e1e1e1 | #ffffff    | -                | ❌               |
| Hover    | 1px #b5b5b5 | #ffffff    | translateY(-1px) | ❌               |
| Focus    | 1px #8a8a8a | #ffffff    | -                | ❌               |
| Selected | 2px #2b2b2b | #f7f7f7    | -                | ✅ (złoty)       |
| Disabled | 1px #e1e1e1 | #ffffff    | -                | ❌ (opacity 0.5) |

#### 2. PRZYCISKI (Buttons)

| Stan     | Border      | Background                         | Transform        | Shadow                        |
| -------- | ----------- | ---------------------------------- | ---------------- | ----------------------------- |
| Default  | 1px #d1d5db | #ffffff                            | -                | ❌                            |
| Hover    | 1px #1a1a1a | #1a1a1a (primary) / #fafafa (prev) | translateY(-1px) | ✅ 0 2px 8px rgba(0,0,0,0.08) |
| Active   | 1px #1a1a1a | #1a1a1a                            | translateY(0)    | ❌                            |
| Disabled | 1px #d1d5db | #ffffff                            | -                | ❌ (opacity 0.45)             |

#### 3. POLA FORMULARZA

**Input Number / Select:**

| Stan             | Border                | Background | Padding | Checkmark  |
| ---------------- | --------------------- | ---------- | ------- | ---------- |
| Default          | 1px #e0e0e0 / #d1d5db | #ffffff    | 0 16px  | ❌         |
| Hover            | 1px #b8b8b8 / #9ca3af | #ffffff    | 0 16px  | ❌         |
| Focus            | 2px #3b82f6 / #2563eb | #ffffff    | 0 15px  | ❌         |
| Filled/Completed | 2px #2b2b2b           | #f7f7f7    | 0 16px  | ✅ (złoty) |

**Radio Buttons:**

| Stan    | Border      | Background | Radio Circle               |
| ------- | ----------- | ---------- | -------------------------- |
| Default | 1px #e0e0e0 | #ffffff    | 1.5px #e0e0e0              |
| Hover   | 1px #b8b8b8 | #fafafa    | 1.5px + shadow interactive |
| Focus   | 2px #7491c1 | #ffffff    | -                          |
| Checked | 2px #2b2b2b | #f7f7f7    | Złoty checkmark (✓)        |

### Interakcje i Zależności

#### Progressive Disclosure

- **Mechanizm:** Pola są ukrywane/odblokowywane w zależności od wyborów
- **Implementacja:** `progressiveDisclosure.js`
- **Stany:** `progressive-disabled` (opacity 0.5-0.65, pointer-events: none)

#### Conditional Fields

- **Przykłady:**
  - Kształt budynku → wymiary vs powierzchnia
  - Typ konstrukcji → materiały ścian
  - Izolacja zewnętrzna → materiał + grubość
  - CWU → liczba osób + profil
- **Walidacja:** Warunkowa (pola pokazane = wymagane)

#### Real-time Validation

- **Mechanizm:** `formEngine` + `ErrorHandler`
- **Feedback:** Czerwona ramka + komunikat pod polem
- **Timing:** Po blur (focus out) lub po kliknięciu "Dalej"

---

## ⚙️ LOGIKA STERUJĄCA UI

### Pliki JavaScript (krytyczne dla UI)

#### 1. `tabNavigation.js`

- **Funkcje:** `showTab(index)`, `validateTab(index)`, `nextStep()`, `prevStep()`
- **Eventy:** Kliknięcia przycisków nawigacyjnych
- **Selektory:** `.section[data-tab]`, `.btn-next*`, `.btn-prev`, `.btn-finish`
- **Efekt:** Przełączanie sekcji, scroll do aktywnej sekcji, aktualizacja progress bar

#### 2. `calculatorInit.js`

- **Funkcje:** `initTopInstalCalculator()`, `setupStepButton()`, `setupFinishButtonWithAPI()`
- **Eventy:** Inicjalizacja przycisków, symulacja AI analysis, wywołanie API
- **Selektory:** `.btn-next1`, `.btn-next2`, ..., `.btn-finish`
- **Efekt:** Animacje przejść, wywołanie API, przejście do wyników

#### 3. `engine.js` (formEngine)

- **Funkcje:** `init()`, `rebindAll()`, `render.sectionButton()`
- **Eventy:** `input`, `change` na polach formularza
- **Selektory:** Wszystkie pola formularza (`input`, `select`, `textarea`)
- **Efekt:** Walidacja, aktualizacja stanu, odblokowywanie przycisków

#### 4. `progressiveDisclosure.js`

- **Funkcje:** `init()`, `updateTab(index)`, `updateButton(index)`
- **Eventy:** Zmiany wartości pól
- **Selektory:** Pola z `data-condition`, `.progressive-disabled`
- **Efekt:** Ukrywanie/odblokowywanie pól, aktualizacja disabled states

#### 5. `errorHandler.js`

- **Funkcje:** `showFieldError()`, `clearAllErrors()`, `showToast()`
- **Eventy:** Walidacja, błędy API
- **Selektory:** `.field-error`, `.error-message`
- **Efekt:** Wyświetlanie błędów, toast notifications

#### 6. `workflowController.js`

- **Funkcje:** `updateProgress(index)`
- **Eventy:** Zmiana sekcji
- **Selektory:** `.progress-bar-container`, `#global-progress-bar`
- **Efekt:** Aktualizacja paska postępu (procent + label)

### Event Flow (przykład: kliknięcie "Dalej")

```
1. User clicks .btn-next2
   ↓
2. calculatorInit.js → clickHandler()
   ↓
3. simulateAIAnalysis() → animacja loading
   ↓
4. window.showTab(2) → tabNavigation.js
   ↓
5. validateTab(1) → sprawdzenie walidacji sekcji 1
   ↓
6. Jeśli valid:
   - Ukryj sekcję 1 (.section[data-tab="1"])
   - Pokaż sekcję 2 (.section[data-tab="2"])
   - Scroll do sekcji 2
   - updateProgressBar(2) → WorkflowController
   ↓
7. progressiveDisclosure.updateTab(2) → odblokuj pola sekcji 2
   ↓
8. formEngine.rebindAll() → bind nowe pola sekcji 2
```

---

## 🔍 DIAGNOZA INTENCJI

### Co autor próbuje zbudować wizualnie i UX-owo:

#### 1. **Styl Premium Technical / Engineering**

- **Cel:** Aplikacja ma wyglądać jak produkt premium HVAC (Viessmann, Panasonic, Hetzner)
- **Charakterystyka:**
  - Minimalistyczny, czysty design
  - Neutralne kolory (szarości + złoty akcent)
  - Małe border-radius (1-2px)
  - Subtelne cienie lub brak
  - Typografia "engineered" (spójne wagi, wysokości linii)

#### 2. **Flow Krok-po-Kroku z Walidacją**

- **Cel:** Prowadzenie użytkownika przez proces z jasnym feedbackiem
- **Charakterystyka:**
  - 7 sekcji z jasnym postępem (progress bar)
  - Walidacja przed przejściem dalej
  - Conditional fields (progressive disclosure)
  - Real-time feedback (checkmarki, stany filled/completed)

#### 3. **Spójne Stany Interakcji**

- **Cel:** Przewidywalne zachowanie komponentów
- **Charakterystyka:**
  - Hover: subtelny lift (translateY -1px)
  - Focus: niebieska ramka (accessibility)
  - Selected/Filled: ciemna ramka + szare tło + złoty checkmark
  - Disabled: opacity 0.45-0.65

#### 4. **Mobile-First Responsive**

- **Cel:** Działanie na wszystkich urządzeniach
- **Charakterystyka:**
  - Grid → 2 kolumny → 1 kolumna (mobile)
  - Touch-friendly hit areas (min 44px)
  - Sticky progress bar
  - Overflow handling

### Czy kod to realizuje?

#### ✅ TAK (dobrze zaimplementowane):

- System sekcji z `data-tab` działa poprawnie
- Walidacja jest funkcjonalna (formEngine + ErrorHandler)
- Stany hover/focus/selected są zdefiniowane w CSS
- Progress bar działa (WorkflowController)
- Mobile redesign istnieje (`mobile-redesign.css`)

#### ⚠️ MOŻE BYĆ LEPIEJ (potencjalne problemy):

- **Niespójne border-radius:** Część komponentów ma 2px, część 1px, część 6px
- **Niespójne kolory border:** Różne odcienie szarości (#e0e0e0, #d1d5db, #e1e1e1)
- **Niespójne paddingi:** Różne wartości w różnych sekcjach
- **Brak tokenów CSS:** Wiele hardcoded wartości zamiast zmiennych
- **Różne style focus:** Niektóre pola mają niebieską ramkę, inne złotą
- **Animacje:** Część ma 0.15s, część 0.2s, część 0.25s

---

## ✅ CHECKLISTY

### Checklist: Ekrany i Flow

- [x] Sekcja 0: Informacje o budynku
- [x] Sekcja 1: Wymiary budynku
- [x] Sekcja 2: Konstrukcja
- [x] Sekcja 3: Okna i drzwi
- [x] Sekcja 4: Izolacja
- [x] Sekcja 5: Podgrzewanie wody
- [x] Sekcja 6: Wyniki + Konfigurator
- [x] Progress bar (sticky)
- [x] Nawigacja wstecz/dalej

### Checklist: Komponenty

- [x] Building type cards
- [x] Option cards
- [x] Przyciski (next/prev/finish)
- [x] Input number
- [x] Select dropdown
- [x] Radio buttons
- [x] Quantity input (+/-)
- [x] Form cards
- [x] Help boxes
- [x] Error messages
- [x] Progress bar

### Checklist: Stany Interakcji

- [x] Hover (karty, przyciski, pola)
- [x] Focus (accessibility)
- [x] Active/Pressed
- [x] Selected/Filled (checkmarki)
- [x] Disabled (opacity + cursor)
- [x] Error (czerwona ramka + komunikat)
- [x] Loading (przyciski, AI analysis)

### Checklist: Logika UI

- [x] Tab navigation (`tabNavigation.js`)
- [x] Form engine (`engine.js`)
- [x] Progressive disclosure (`progressiveDisclosure.js`)
- [x] Error handling (`errorHandler.js`)
- [x] Progress tracking (`workflowController.js`)
- [x] Mobile controller (`mobileController.js`)

---

## 📝 NOTATKI DLA FAZY B (Audyt Premium)

### Obszary do sprawdzenia:

1. **Spójność tokenów CSS** - czy wszystkie wartości używają zmiennych?
2. **Border-radius** - czy wszystkie komponenty mają spójny radius?
3. **Border colors** - czy wszystkie użyte kolory są zdefiniowane w `:root`?
4. **Spacing** - czy paddingi/marginesy są zgodne z `--spacing-*`?
5. **Typography** - czy wszystkie font-size/weight/line-height są spójne?
6. **Focus states** - czy wszystkie pola mają spójny focus ring?
7. **Animacje** - czy wszystkie transition są spójne?
8. **Mobile breakpoints** - czy wszystkie media queries są spójne?
9. **Hit areas** - czy wszystkie klikalne elementy mają min 44px?
10. **Kontrast** - czy wszystkie kolory spełniają WCAG AA?

---

**Koniec FAZY A**
**Następny krok:** FAZA B - Audyt Premium (spójność, typografia, spacing, stany)
