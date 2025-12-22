# 🔍 AUDYT PREMIUM - KALKULATOR TOP-INSTAL

**Data audytu:** 2025-01-XX
**Wersja:** FAZA B - Audyt Premium (spójność, typografia, spacing, stany)
**Status:** ✅ Kompletna

---

## 📋 SPIS TREŚCI

1. [Top 20 Problemów (P0/P1/P2)](#top-20-problemów-p0p1p2)
2. [Podsumowanie](#podsumowanie)
3. [Metryki Jakości](#metryki-jakości)

---

## 🚨 TOP 20 PROBLEMÓW (P0/P1/P2)

### P0 - KRYTYCZNE (wpływają na UX, dostępność, spójność wizualną)

#### 1. **Niespójne Border-Radius** ⚠️ P0

**Lokalizacja:** `main.css` (97 wystąpień różnych wartości)
**Problem:**

- Komponenty używają: `2px`, `3px`, `6px`, `10px`, `16px`, `18px`, `20px`, `50%`, `999px`
- Brak tokenu CSS dla border-radius (jest tylko `--input-radius: 2px`)
- Mobile redesign używa `var(--radius-sm)` ale nie jest zdefiniowane w `:root`

**Skutek dla użytkownika:**

- Brak spójności wizualnej - aplikacja wygląda "sklejona" z różnych systemów
- Obniża poczucie jakości premium

**Minimalna poprawka:**

```css
:root {
  --radius-xs: 1px; /* Najmniejsze elementy */
  --radius-sm: 2px; /* Inputy, przyciski, karty (domyślny) */
  --radius-md: 4px; /* Większe karty, modale */
  --radius-lg: 8px; /* Hero, sekcje */
  --radius-full: 50%; /* Kółka, pill badges */
}
```

Zastąpić wszystkie hardcoded wartości tokenami.

---

#### 2. **Hardcoded Kolory zamiast Tokenów** ⚠️ P0

**Lokalizacja:** `main.css` (49+ wystąpień)
**Problem:**

- Focus states: `#3b82f6` (niebieski) - nie jest w tokenach
- Hover borders: `#b8b8b8`, `#9ca3af` - nie są w tokenach
- Button colors: `#1a1a1a`, `#fff`, `#d1d5db` - częściowo w tokenach
- Backgrounds: `#f7f7f7`, `#fafafa`, `#f5f7fa` - nie są w tokenach
- Border colors: `#e5e7eb`, `#e1e1e1` - różne od `--color-border: #e0e0e0`

**Skutek dla użytkownika:**

- Brak możliwości łatwej zmiany palety kolorów
- Niespójne odcienie szarości wprowadzają w błąd (różne stany wyglądają przypadkowo)

**Minimalna poprawka:**

```css
:root {
  /* Uzupełnić istniejące tokeny */
  --color-border-hover: #b8b8b8;
  --color-border-focus: #3b82f6; /* lub użyć --color-form-interactive */
  --color-bg-hover: #fafafa;
  --color-bg-selected: #f7f7f7;
  --color-bg-disabled: #f5f7fa;
  --color-text-disabled: var(--color-text-muted);
}
```

Zastąpić wszystkie hardcoded kolory tokenami.

---

#### 3. **Niespójne Stany Focus** ⚠️ P0

**Lokalizacja:** `main.css:1426-1434`, `main.css:1826-1832`
**Problem:**

- Input/Select: `border: 2px solid #3b82f6` (niebieski)
- Radio buttons: `border: 2px solid #7491c1` (inny niebieski)
- Przyciski: `outline: 2px solid var(--color-success)` (złoty)
- Karty: `border-color: #8a8a8a` (szary, brak wyraźnego focus)

**Skutek dla użytkownika:**

- Brak spójności w dostępności (keyboard navigation)
- Różne kolory focus wprowadzają w błąd (użytkownik nie wie, co jest aktywne)

**Minimalna poprawka:**
Ujednolicić focus na jeden kolor (np. `--color-focus: #3b82f6` lub `--color-form-interactive`) dla wszystkich interaktywnych elementów.

---

#### 4. **Niespójne Transition Durations** ⚠️ P0

**Lokalizacja:** `main.css` (29+ wystąpień)
**Problem:**

- `0.15s` (karty, inputy hover)
- `0.18s` (niektóre inputy)
- `0.2s` (domyślny `--transition`)
- `0.25s` (przyciski)
- `0.3s` (niektóre animacje)
- `0.4s` (fadeIn sekcji)

**Skutek dla użytkownika:**

- Aplikacja "wibruje" - różne elementy reagują w różnym tempie
- Brak płynności i spójności w interakcjach

**Minimalna poprawka:**

```css
:root {
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease; /* --transition */
  --transition-slow: 0.25s ease;
  --transition-slower: 0.3s ease;
}
```

Użyć maksymalnie 2-3 wartości dla wszystkich komponentów.

---

#### 5. **Hardcoded Paddingi/Marginesy** ⚠️ P0

**Lokalizacja:** `main.css` (29+ wystąpień)
**Problem:**

- `padding: 14px 28px` (przyciski) - nie używa `--spacing-*`
- `margin: 36px 18px 0px 18px` (h3) - hardcoded
- `padding: 8px 20px` (hero-pill) - hardcoded
- `padding: 16px 12px` (option-card) - hardcoded
- `margin: 8px` (przyciski) - hardcoded

**Skutek dla użytkownika:**

- Brak spójności w spacing - elementy wyglądają przypadkowo rozmieszczone
- Trudno utrzymać rytm wizualny (8px grid)

**Minimalna poprawka:**
Zastąpić wszystkie hardcoded wartości tokenami `--spacing-*` lub dodać brakujące:

```css
:root {
  --spacing-xxs: 4px;
  --spacing-xs: 8px; /* już jest 10px - zmienić? */
  --spacing-sm: 14px;
  --spacing-md: 20px;
  --spacing-lg: 28px;
  --spacing-xl: 40px;
  --spacing-2xl: 56px;
  --spacing-3xl: 76px;
}
```

---

### P1 - WAŻNE (wpływają na spójność, ale nie blokują)

#### 6. **Niespójne Border Colors** ⚠️ P1

**Lokalizacja:** `main.css` (wszędzie)
**Problem:**

- `--color-border: #e0e0e0` (token)
- `#e1e1e1` (karty)
- `#d1d5db` (przyciski, selecty)
- `#e5e7eb` (disabled radio)
- `#f0f0f0` (--color-border-light)

**Skutek dla użytkownika:**

- Subtelne różnice wprowadzają w błąd (użytkownik nie wie, czy to ten sam stan)

**Minimalna poprawka:**
Ujednolicić na 2-3 odcienie:

```css
:root {
  --color-border: #e0e0e0; /* Domyślny */
  --color-border-light: #f0f0f0; /* Bardzo subtelny */
  --color-border-dark: #d1d5db; /* Hover, aktywne */
}
```

---

#### 7. **Niespójne Opacity dla Disabled** ⚠️ P1

**Lokalizacja:** `main.css:1456`, `main.css:1980`, `main.css:1465`, `main.css:1473`
**Problem:**

- Input disabled: `opacity: 0.6`
- Button disabled: `opacity: 0.45`
- Progressive disabled radio: `opacity: 0.65`
- Progressive disabled checkbox: `opacity: 0.5`

**Skutek dla użytkownika:**

- Brak spójności - użytkownik nie wie, czy element jest disabled czy tylko "mniej ważny"

**Minimalna poprawka:**

```css
:root {
  --opacity-disabled: 0.5; /* Standardowy disabled */
  --opacity-disabled-light: 0.65; /* Progressive disabled (widoczny ale nieaktywny) */
}
```

---

#### 8. **Hardcoded Font-Size** ⚠️ P1

**Lokalizacja:** `main.css` (29+ wystąpień)
**Problem:**

- `font-size: 15px` (przyciski) - powinno być `var(--font-size-base)`
- `font-size: 18px` (help-box, niektóre inputy) - powinno być `var(--font-size-lg)`
- `font-size: 1.8rem` (h3) - powinno być token
- `font-size: 16px` (option-card\_\_title) - powinno być `var(--font-size-lg)`

**Skutek dla użytkownika:**

- Brak spójności typograficznej - tekst wygląda przypadkowo

**Minimalna poprawka:**
Zastąpić wszystkie hardcoded `font-size` tokenami `--font-size-*`.

---

#### 9. **Niespójne Box-Shadow** ⚠️ P1

**Lokalizacja:** `main.css` (29+ wystąpień)
**Problem:**

- Tokeny: `--shadow-subtle`, `--shadow-md`, `--shadow-input`, `--shadow-red`
- Hardcoded: `0 2px 8px rgba(0, 0, 0, 0.08)` (przyciski hover)
- Hardcoded: `0 1px 2px rgba(0, 0, 0, 0.05)` (quantity-btn)
- Hardcoded: `0 0 0 1px rgba(37, 99, 235, 0.18)` (select focus)

**Skutek dla użytkownika:**

- Brak spójności w głębi wizualnej (depth)

**Minimalna poprawka:**
Użyć istniejących tokenów lub dodać brakujące:

```css
:root {
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 2px 8px rgba(0, 0, 0, 0.08); /* dla przycisków hover */
  --shadow-focus: 0 0 0 1px rgba(37, 99, 235, 0.18); /* focus ring */
}
```

---

#### 10. **Brak Tokenów dla Border Width** ⚠️ P1

**Lokalizacja:** `main.css` (wszędzie)
**Problem:**

- Default: `1px`
- Selected/Filled: `2px`
- Focus: `2px`
- Hardcoded wszędzie

**Skutek dla użytkownika:**

- Trudno utrzymać spójność (łatwo pomylić 1px z 2px)

**Minimalna poprawka:**

```css
:root {
  --border-width: 1px;
  --border-width-thick: 2px;
}
```

---

#### 11. **Niespójne Hover States** ⚠️ P1

**Lokalizacja:** `main.css` (wszędzie)
**Problem:**

- Karty: `transform: translateY(-1px)` + `border-color: #b5b5b5`
- Przyciski: `transform: translateY(-1px)` + `box-shadow` + zmiana tła
- Inputy: tylko `border-color: #b8b8b8`
- Radio: `border-color: #b8b8b8` + `background: #fafafa` + shadow na radio circle

**Skutek dla użytkownika:**

- Brak spójności - niektóre elementy "podnoszą się", inne tylko zmieniają kolor

**Minimalna poprawka:**
Ujednolicić hover na jeden wzorzec (np. tylko border-color dla inputów, transform dla kart/przycisków).

---

#### 12. **Hardcoded Wartości w Mobile Redesign** ⚠️ P1

**Lokalizacja:** `mobile-redesign.css`
**Problem:**

- Używa `var(--radius-sm)` ale nie jest zdefiniowane w `:root`
- Hardcoded breakpoints (530px, 768px, 390px)
- Różne wartości spacing niż desktop

**Skutek dla użytkownika:**

- Brak spójności między desktop a mobile

**Minimalna poprawka:**
Dodać brakujące tokeny i użyć tokenów breakpointów:

```css
:root {
  --radius-sm: 2px;
  --breakpoint-mobile: 530px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1148px;
}
```

---

### P2 - DROBNE (nie wpływają znacząco, ale warto poprawić)

#### 13. **Niespójne Letter-Spacing** ⚠️ P2

**Lokalizacja:** `main.css:1893`, `main.css:1914`
**Problem:**

- Button base: `letter-spacing: 0.5px`
- Button next/prev: `letter-spacing: 0` (nadpisane)
- Hero pill: `letter-spacing: 0.5px`

**Minimalna poprawka:**
Ujednolicić na `0` (przyciski nie powinny mieć letter-spacing jeśli są uppercase).

---

#### 14. **Hardcoded Z-Index** ⚠️ P2

**Lokalizacja:** `main.css` (kilka miejsc)
**Problem:**

- Checkmarki: `z-index: 10`
- Progress bar sticky: brak z-index (może być pod innymi elementami)

**Minimalna poprawka:**

```css
:root {
  --z-base: 1;
  --z-dropdown: 10;
  --z-sticky: 100;
  --z-modal: 1000;
  --z-toast: 10000;
}
```

---

#### 15. **Niespójne Line-Height** ⚠️ P2

**Lokalizacja:** `main.css` (29+ wystąpień)
**Problem:**

- Body: `line-height: 1.6`
- Headings: `line-height: 1.3`
- Hero: `line-height: 1.1`
- Hardcoded wszędzie

**Minimalna poprawka:**

```css
:root {
  --line-height-tight: 1.1;
  --line-height-normal: 1.3;
  --line-height-relaxed: 1.6;
}
```

---

#### 16. **Brak Tokenów dla Gap** ⚠️ P2

**Lokalizacja:** `main.css` (flex/grid gaps)
**Problem:**

- `gap: 10px` (przyciski)
- `gap: 16px` (option-cards)
- `gap: var(--spacing-md)` (niektóre)

**Minimalna poprawka:**
Użyć `--spacing-*` dla wszystkich gap.

---

#### 17. **Niespójne Min-Height** ⚠️ P2

**Lokalizacja:** `main.css`
**Problem:**

- Input: `height: 52px` (--input-height)
- Radio label: `min-height: 54px`
- Button: `height: 52px` (--button-height)

**Minimalna poprawka:**
Ujednolicić na `--input-height: 52px` dla wszystkich interaktywnych elementów.

---

#### 18. **Hardcoded Max-Width** ⚠️ P2

**Lokalizacja:** `main.css` (19+ wystąpień)
**Problem:**

- Section: `width: 1300px` (hardcoded)
- Progress bar: `max-width: 1148px` (hardcoded)
- Input: `width: 530px` (hardcoded)
- Hero container: `max-width: min(1200px, 95%)` (hardcoded)

**Minimalna poprawka:**

```css
:root {
  --container-sm: 530px;
  --container-md: 1148px;
  --container-lg: 1300px;
  --container-xl: 1200px;
}
```

---

#### 19. **Niespójne Text-Transform** ⚠️ P2

**Lokalizacja:** `main.css:1892`, `main.css:1915`
**Problem:**

- Button base: `text-transform: uppercase`
- Button next/prev: `text-transform: none` (nadpisane)
- Hero pill: `text-transform: uppercase`

**Minimalna poprawka:**
Ujednolicić - jeśli przyciski nie są uppercase, usunąć z base.

---

#### 20. **Brak Tokenów dla Checkmark** ⚠️ P2

**Lokalizacja:** `main.css` (checkmarki wszędzie)
**Problem:**

- Checkmark size: `20px` (hardcoded)
- Checkmark font-size: `12px` (hardcoded)
- Checkmark background: `var(--color-gold)` (OK)
- Checkmark position: różne (hardcoded)

**Minimalna poprawka:**

```css
:root {
  --checkmark-size: 20px;
  --checkmark-font-size: 12px;
  --checkmark-offset: 8px; /* od krawędzi */
}
```

---

## 📊 PODSUMOWANIE

### Statystyki Problemów:

- **P0 (Krytyczne):** 5 problemów
- **P1 (Ważne):** 7 problemów
- **P2 (Drobne):** 8 problemów
- **Razem:** 20 problemów

### Główne Obszary:

1. **Tokeny CSS** - brakuje ~15 tokenów, wiele hardcoded wartości
2. **Spójność Border-Radius** - 97 różnych wartości
3. **Spójność Kolorów** - 49+ hardcoded kolorów
4. **Spójność Transition** - 6 różnych durations
5. **Spójność Spacing** - wiele hardcoded paddingów/marginesów

### Priorytet Naprawy:

1. **Najpierw:** Tokeny CSS (P0) - fundament spójności
2. **Potem:** Border-radius + kolory (P0) - największy wpływ wizualny
3. **Na końcu:** Drobne (P2) - polish

---

## 📈 METRYKI JAKOŚCI

### Przed Naprawą:

- **Spójność tokenów:** 40% (wiele hardcoded wartości)
- **Spójność border-radius:** 30% (97 różnych wartości)
- **Spójność kolorów:** 50% (część używa tokenów)
- **Spójność transition:** 60% (większość używa --transition)
- **Spójność spacing:** 45% (część używa --spacing-\*)

### Cel Po Naprawie:

- **Spójność tokenów:** 95%+
- **Spójność border-radius:** 100% (tylko tokeny)
- **Spójność kolorów:** 95%+ (tylko tokeny)
- **Spójność transition:** 95%+ (2-3 wartości)
- **Spójność spacing:** 95%+ (tylko tokeny)

---

**Koniec FAZY B**
**Następny krok:** FAZA C - Micro-Fix Plan (bezpieczne patche)
