# 🔧 MICRO-FIX PLAN - KALKULATOR TOP-INSTAL

**Data planu:** 2025-01-XX
**Wersja:** FAZA C - Micro-Fix Plan (bezpieczne patche)
**Status:** ✅ Kompletna

---

## 📋 SPIS TREŚCI

1. [Zasady Bezpieczeństwa](#zasady-bezpieczeństwa)
2. [Kolejność Commitów](#kolejność-commitów)
3. [Szczegóły Poprawek](#szczegóły-poprawek)
4. [Testy Manualne](#testy-manualne)

---

## 🛡️ ZASADY BEZPIECZEŃSTWA

### ✅ CO MOŻEMY ZMIENIAĆ:

- **Tokeny CSS** (`:root` zmienne)
- **Wartości CSS** (zamiana hardcoded → tokeny)
- **Selektory CSS** (dodanie brakujących stanów)
- **Drobne poprawki HTML** (aria-label, klasy pomocnicze)
- **JS tylko dla UI** (focus, aria, klasy stanów - NIE logika domenowa)

### ❌ CZEGO NIE ZMIENIAMY:

- **Logika domenowa** (walidacja, obliczenia, API)
- **Struktura projektu** (pliki, foldery)
- **Architektura** (formEngine, tabNavigation - tylko poprawki kosmetyczne)
- **Funkcjonalność** (dodawanie/usuwanie features)

### 🎯 ZASADA MINIMALNEGO RYZYKA:

1. **Najpierw tokeny** - dodajemy brakujące, nie zmieniamy istniejących
2. **Potem zamiana** - hardcoded → tokeny (tylko wartości wizualne)
3. **Na końcu polish** - drobne poprawki spacing/alignment

---

## 📦 KOLEJNOŚĆ COMMITÓW

### COMMIT 1: Tokeny CSS - Fundament

**Zakres:** `main.css` (tylko `:root`)
**Ryzyko:** ⚠️ NISKIE (tylko dodanie zmiennych, nie zmiana użycia)
**Efekt:** Podstawa dla wszystkich kolejnych poprawek

**Zmiany:**

- Dodanie brakujących tokenów border-radius
- Dodanie brakujących tokenów kolorów
- Dodanie tokenów transition
- Dodanie tokenów spacing (jeśli brakuje)
- Dodanie tokenów z-index, line-height, itp.

**Pliki:**

- `main/kalkulator/css/main.css` (tylko sekcja `:root`)

---

### COMMIT 2: Border-Radius - Ujednolicenie

**Zakres:** `main.css` (wszystkie `border-radius`)
**Ryzyko:** ⚠️ NISKIE (tylko wartości wizualne)
**Efekt:** Spójność wizualna - wszystkie komponenty używają tokenów

**Zmiany:**

- Zamiana wszystkich hardcoded `border-radius` na tokeny
- Ujednolicenie: `2px` → `var(--radius-sm)`, `50%` → `var(--radius-full)`, itp.

**Pliki:**

- `main/kalkulator/css/main.css`
- `main/kalkulator/css/mobile-redesign.css` (jeśli używa hardcoded)

**Uwaga:** Sprawdzić czy `mobile-redesign.css` używa `var(--radius-sm)` - jeśli tak, upewnić się że token istnieje.

---

### COMMIT 3: Kolory - Ujednolicenie

**Zakres:** `main.css` (wszystkie kolory)
**Ryzyko:** ⚠️ ŚREDNIE (może wpłynąć na kontrast/accessibility)
**Efekt:** Spójność kolorów - wszystkie użyte kolory są w tokenach

**Zmiany:**

- Zamiana hardcoded kolorów na tokeny
- `#3b82f6` → `var(--color-focus)` lub `var(--color-form-interactive)`
- `#b8b8b8` → `var(--color-border-hover)`
- `#f7f7f7` → `var(--color-bg-selected)`
- itp.

**Pliki:**

- `main/kalkulator/css/main.css`

**Testy:** Sprawdzić kontrast (WCAG AA) dla wszystkich kolorów tekstu.

---

### COMMIT 4: Transition - Ujednolicenie

**Zakres:** `main.css` (wszystkie `transition`)
**Ryzyko:** ⚠️ NISKIE (tylko timing, nie funkcjonalność)
**Efekt:** Spójność animacji - wszystkie używają 2-3 wartości

**Zmiany:**

- Zamiana `0.15s` → `var(--transition-fast)`
- Zamiana `0.2s` → `var(--transition-base)` (lub `var(--transition)`)
- Zamiana `0.25s` → `var(--transition-slow)`
- Usunięcie `0.18s`, `0.3s` (zastąpić najbliższą wartością)

**Pliki:**

- `main/kalkulator/css/main.css`

---

### COMMIT 5: Spacing - Ujednolicenie

**Zakres:** `main.css` (wszystkie `padding`, `margin`, `gap`)
**Ryzyko:** ⚠️ ŚREDNIE (może wpłynąć na layout)
**Efekt:** Spójność spacing - wszystkie użyte wartości są w tokenach

**Zmiany:**

- Zamiana hardcoded paddingów/marginesów na `--spacing-*`
- `14px 28px` → `var(--spacing-sm) var(--spacing-lg)`
- `8px` → `var(--spacing-xs)`
- itp.

**Pliki:**

- `main/kalkulator/css/main.css`

**Testy:** Sprawdzić layout na mobile/tablet/desktop - czy nie ma overflow/underflow.

---

### COMMIT 6: Typography - Ujednolicenie

**Zakres:** `main.css` (wszystkie `font-size`, `font-weight`, `line-height`)
**Ryzyko:** ⚠️ NISKIE (tylko wartości wizualne)
**Efekt:** Spójność typografii - wszystkie użyte wartości są w tokenach

**Zmiany:**

- Zamiana hardcoded `font-size` na `--font-size-*`
- Zamiana hardcoded `line-height` na tokeny (jeśli dodane)
- Ujednolicenie `font-weight` (użyć tylko: 400, 500, 600, 700)

**Pliki:**

- `main/kalkulator/css/main.css`

---

### COMMIT 7: Focus States - Ujednolicenie

**Zakres:** `main.css` (wszystkie `:focus`, `:focus-visible`)
**Ryzyko:** ⚠️ ŚREDNIE (accessibility - ważne!)
**Efekt:** Spójność focus - wszystkie elementy mają ten sam focus ring

**Zmiany:**

- Ujednolicenie focus color (jeden token)
- Ujednolicenie focus style (border vs outline vs box-shadow)
- Dodanie `:focus-visible` dla keyboard navigation

**Pliki:**

- `main/kalkulator/css/main.css`

**Testy:** Sprawdzić keyboard navigation - wszystkie elementy powinny mieć widoczny focus.

---

### COMMIT 8: Box-Shadow - Ujednolicenie

**Zakres:** `main.css` (wszystkie `box-shadow`)
**Ryzyko:** ⚠️ NISKIE (tylko wartości wizualne)
**Efekt:** Spójność shadow - wszystkie użyte wartości są w tokenach

**Zmiany:**

- Zamiana hardcoded `box-shadow` na tokeny
- `0 2px 8px rgba(0, 0, 0, 0.08)` → `var(--shadow-lg)`
- itp.

**Pliki:**

- `main/kalkulator/css/main.css`

---

### COMMIT 9: Disabled States - Ujednolicenie

**Zakres:** `main.css` (wszystkie `:disabled`, `.disabled`)
**Ryzyko:** ⚠️ NISKIE (tylko wartości wizualne)
**Efekt:** Spójność disabled - wszystkie użyte wartości są w tokenach

**Zmiany:**

- Ujednolicenie opacity (jeden token dla standardowego, jeden dla progressive)
- Ujednolicenie kolorów (tło, tekst, border)

**Pliki:**

- `main/kalkulator/css/main.css`

---

### COMMIT 10: Mobile Redesign - Tokeny

**Zakres:** `mobile-redesign.css`
**Ryzyko:** ⚠️ ŚREDNIE (mobile - ważne!)
**Efekt:** Spójność mobile - używa tych samych tokenów co desktop

**Zmiany:**

- Sprawdzenie czy `var(--radius-sm)` istnieje (jeśli nie, dodać w COMMIT 1)
- Zamiana hardcoded wartości na tokeny (jeśli są)
- Ujednolicenie breakpoints (jeśli dodane tokeny)

**Pliki:**

- `main/kalkulator/css/mobile-redesign.css`

**Testy:** Sprawdzić na rzeczywistych urządzeniach mobile (390px, 768px, itp.).

---

## 🔍 SZCZEGÓŁY POPRAWEK

### COMMIT 1: Tokeny CSS

**Dodaj do `:root`:**

```css
/* Border Radius */
--radius-xs: 1px;
--radius-sm: 2px; /* Domyślny - inputy, przyciski, karty */
--radius-md: 4px; /* Większe karty */
--radius-lg: 8px; /* Sekcje, modale */
--radius-full: 50%; /* Kółka, pill badges */

/* Kolory - Uzupełnienie */
--color-border-hover: #b8b8b8;
--color-border-focus: #3b82f6; /* lub użyć --color-form-interactive */
--color-bg-hover: #fafafa;
--color-bg-selected: #f7f7f7;
--color-bg-disabled: #f5f7fa;
--color-text-disabled: var(--color-text-muted);

/* Border Width */
--border-width: 1px;
--border-width-thick: 2px;

/* Transition */
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease; /* alias dla --transition */
--transition-slow: 0.25s ease;

/* Opacity */
--opacity-disabled: 0.5;
--opacity-disabled-light: 0.65;

/* Box Shadow - Uzupełnienie */
--shadow-lg: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-focus: 0 0 0 1px rgba(37, 99, 235, 0.18);

/* Z-Index */
--z-base: 1;
--z-dropdown: 10;
--z-sticky: 100;
--z-modal: 1000;
--z-toast: 10000;

/* Line Height */
--line-height-tight: 1.1;
--line-height-normal: 1.3;
--line-height-relaxed: 1.6;

/* Container Widths */
--container-sm: 530px;
--container-md: 1148px;
--container-lg: 1300px;
--container-xl: 1200px;

/* Checkmark */
--checkmark-size: 20px;
--checkmark-font-size: 12px;
--checkmark-offset: 8px;
```

---

### COMMIT 2: Border-Radius - Przykłady Zamiany

**Przed:**

```css
.building-type-card {
  border-radius: 2px;
}

.hero-pill {
  border-radius: 20px;
}

.option-card {
  border-radius: 2px;
}
```

**Po:**

```css
.building-type-card {
  border-radius: var(--radius-sm);
}

.hero-pill {
  border-radius: var(--radius-lg); /* lub nowy token --radius-pill: 20px */
}

.option-card {
  border-radius: var(--radius-sm);
}
```

---

### COMMIT 3: Kolory - Przykłady Zamiany

**Przed:**

```css
input:focus {
  border: 2px solid #3b82f6;
}

.building-type-card:hover {
  border-color: #b5b5b5;
}

.option-card--selected {
  background: #f7f7f7;
}
```

**Po:**

```css
input:focus {
  border: var(--border-width-thick) solid var(--color-border-focus);
}

.building-type-card:hover {
  border-color: var(--color-border-hover);
}

.option-card--selected {
  background: var(--color-bg-selected);
}
```

---

### COMMIT 4: Transition - Przykłady Zamiany

**Przed:**

```css
.building-type-card {
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.btn-next1 {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Po:**

```css
.building-type-card {
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.btn-next1 {
  transition: all var(--transition-slow) cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

### COMMIT 5: Spacing - Przykłady Zamiany

**Przed:**

```css
.btn-next1 {
  padding: 14px 28px;
  margin: 8px;
}

h3 {
  margin: 36px 18px 0px 18px;
}
```

**Po:**

```css
.btn-next1 {
  padding: var(--spacing-sm) var(--spacing-lg);
  margin: var(--spacing-xs);
}

h3 {
  margin: var(--spacing-lg) var(--spacing-sm) 0 var(--spacing-sm);
}
```

---

## ✅ TESTY MANUALNE

### Po każdym commicie sprawdzić:

#### 1. Visual Regression (przed/po):

- [ ] Screenshot sekcji 0 (Informacje o budynku)
- [ ] Screenshot sekcji 1 (Wymiary)
- [ ] Screenshot sekcji 6 (Wyniki)
- [ ] Porównanie - czy nic się nie "zepsuło" wizualnie

#### 2. Interakcje:

- [ ] Hover na karty (building-type, option)
- [ ] Hover na przyciski (next, prev)
- [ ] Focus na inputy/selecty (keyboard navigation)
- [ ] Click na karty (selected state)
- [ ] Disabled states (przyciski, pola)

#### 3. Mobile (po COMMIT 10):

- [ ] 390px width (iPhone SE)
- [ ] 768px width (iPad)
- [ ] Touch interactions (hover nie działa, tylko active)
- [ ] Overflow (czy nic nie wychodzi poza ekran)

#### 4. Accessibility:

- [ ] Keyboard navigation (Tab przez wszystkie elementy)
- [ ] Focus visible (czy wszystkie elementy mają focus ring)
- [ ] Kontrast (WCAG AA - sprawdzić narzędziem)

#### 5. Performance:

- [ ] CSS file size (czy nie wzrósł znacząco)
- [ ] Render time (czy nie spowolniło)

---

## 📝 CHECKLIST PRZED COMMITEM

Dla każdego commitu:

- [ ] Zmiany tylko w CSS (lub drobne HTML/JS dla UI)
- [ ] Nie zmieniono logiki domenowej
- [ ] Nie zmieniono struktury projektu
- [ ] Wszystkie hardcoded wartości zamienione na tokeny (w zakresie commitu)
- [ ] Testy manualne przechodzą
- [ ] Visual regression OK (screenshots)
- [ ] Mobile OK (jeśli dotyczy)

---

## 🎯 METRYKI SUKCESU

### Przed:

- Tokeny CSS: ~40 zmiennych
- Hardcoded wartości: ~200+ wystąpień
- Spójność: 40-60%

### Po:

- Tokeny CSS: ~60+ zmiennych
- Hardcoded wartości: <10 wystąpień (tylko specjalne przypadki)
- Spójność: 95%+

---

**Koniec FAZY C**
**Następny krok:** FAZA D - Implementacja (tylko jeśli bezpieczne)
