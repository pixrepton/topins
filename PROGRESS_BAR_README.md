# 📊 Progress Bar — Jak Działa

**Krótki przewodnik po zachowaniu progress bara w kalkulatorze**

---

## 🎯 PODSTAWY

Progress bar pokazuje postęp użytkownika przez **7 kroków** formularza:

- **Krok 0:** 12% — Start · Wprowadzenie
- **Krok 1:** 24% — Krok 2 · Wymiary
- **Krok 2:** 42% — Krok 3 · Konstrukcja
- **Krok 3:** 58% — Krok 4 · Okna & Drzwi
- **Krok 4:** 75% — Krok 5 · Izolacje
- **Krok 5:** 91% — Krok 6 · Finalizacja
- **Krok 6:** 100% — ✓ Zakończono · Wyniki

**Kontroler:** `workflowController.js`
**Aktualizacja:** Automatyczna przy zmianie zakładki (hook do `showTab()`)

---

## 🖥️ DESKTOP (>767px)

### Zachowanie

1. **Sticky Progress Bar**

   - Przykleja się do góry podczas scrollowania
   - **Trigger:** Gdy scroll przekroczy pozycję progress bara minus wysokość headera
   - **Pozycja:** `position: fixed; top: var(--header-height, 60px)`
   - **Z-index:** 1199 (pod headerem 1200)

2. **Format Labela**

   - **Desktop:** `"Krok 2 · Wymiary"` (z bulletem `·`, title case)
   - **Procent:** Widoczny (12%, 24%, etc.)
   - **Ukryty w kroku 0:** Procent jest ukryty w pierwszej zakładce

3. **Placeholder**

   - Gdy progress bar staje się sticky, placeholder (60px wysokości) zapobiega "skokowi" treści

4. **Animacja**
   - `stickySlideDown` — slide down przy przyklejeniu
   - `progressShimmer` — subtelny shimmer na fill barze

---

## 📱 MOBILE (≤767px)

### Zachowanie

1. **Sticky Progress Bar** (jak desktop)

   - Przykleja się do góry podczas scrollowania
   - **Trigger:** Zmniejszony o **10px** dla wcześniejszego przyklejenia
   - **Pozycja:** `position: fixed; top: var(--header-height, 0)`
   - **Padding:** `12px 16px 8px` (mniejszy niż desktop)

2. **Format Labela**

   - **Mobile:** `"krok 2 wymiary"` (bez bulleta, lowercase)
   - **Procent:** Widoczny (12%, 24%, etc.)
   - **Ukryty w kroku 0:** Procent jest ukryty w pierwszej zakładce

3. **Hide/Show on Scroll** ⭐ **RÓŻNICA**

   - **Scroll w dół** (po 200px): Progress bar **ukrywa się** (`transform: translateY(-100%)`)
   - **Scroll w górę** (po 100px): Progress bar **pokazuje się**
   - **Kontroler:** `mobileController.js` (linie 98-105)
   - **Cel:** Oszczędność miejsca na ekranie, lepsze UX podczas wypełniania formularza

4. **Placeholder**

   - Wysokość: **70px** (więcej niż desktop 60px)
   - Uwzględnia safe-area-inset-bottom (iOS notch)

5. **Keyboard Detection**
   - Gdy klawiatura się otwiera → bottom nav ukrywa się
   - Progress bar pozostaje widoczny (jeśli nie jest ukryty przez scroll)

---

## 🔄 RÓŻNICE: DESKTOP vs MOBILE

| Aspekt                 | Desktop              | Mobile                                |
| ---------------------- | -------------------- | ------------------------------------- |
| **Format labela**      | `"Krok 2 · Wymiary"` | `"krok 2 wymiary"`                    |
| **Sticky trigger**     | Standardowy offset   | **-10px** (wcześniejsze przyklejenie) |
| **Hide on scroll**     | ❌ Zawsze widoczny   | ✅ Ukrywa się przy scroll w dół       |
| **Padding**            | `10px 32px 8px`      | `12px 16px 8px`                       |
| **Placeholder height** | 60px                 | 70px                                  |
| **Safe area**          | Nie                  | Tak (iOS notch)                       |

---

## 🚫 KROK 6 (WYNIKI) — WYJĄTEK

**W kroku 6 (100%, wyniki):**

- ❌ **Sticky wyłączony** (`stickyDisabled = true`)
- ❌ Progress bar **nie przykleja się** podczas scrollowania
- ❌ Placeholder **ukryty**
- ✅ **Animacja typewriter** — pokazuje gratulacje i CTA

**Dlaczego?**
Wyniki to długi content (tabele, wykresy, konfigurator). Sticky progress bar byłby przeszkadzał w przeglądaniu wyników.

---

## 🎨 STYLING

### Desktop

```css
.progress-bar-container.sticky {
  position: fixed;
  top: var(--header-height, 60px);
  padding: 10px 32px 8px;
  max-width: 1148px; /* wyśrodkowany */
}
```

### Mobile

```css
@media (max-width: 767px) {
  .progress-bar-container {
    padding: 12px 16px 8px;
  }

  .progress-bar-container.hidden {
    transform: translateY(-100%);
  }

  .progress-sticky-placeholder.active {
    height: 70px;
  }
}
```

---

## 🔧 TECHNICZNE SZCZEGÓŁY

### Aktualizacja Progress Bara

```javascript
// workflowController.js
WorkflowController.updateProgress(tabIndex);

// Automatycznie wywoływane przez hook do showTab()
window.showTab = index => {
  originalShowTab(index);
  WorkflowController.updateProgress(index);
};
```

### Format Labela

```javascript
// Desktop: "Krok 2 · Wymiary"
// Mobile: "krok 2 wymiary"

formatLabelForDisplay(label, isMobile) {
  if (isMobile) {
    return label.replace(/·/g, ' ').toLowerCase().trim();
  }
  return label; // oryginalny format
}
```

### Sticky Trigger

```javascript
// Desktop: progressBarTop - headerHeight
// Mobile: progressBarTop - headerHeight - 10px (wcześniejsze przyklejenie)

updateTriggerOffset() {
  const isMobile = window.matchMedia('(max-width: 480px)').matches;
  if (isMobile) {
    this.triggerOffset = Math.max(0, this.triggerOffset - 10);
  }
}
```

### Mobile Hide/Show

```javascript
// mobileController.js
if (scrollDirection === 'down' && currentScrollY > 200) {
  progressBar.classList.add('hidden'); // ukryj
} else if (scrollDirection === 'up' && currentScrollY > 100) {
  progressBar.classList.remove('hidden'); // pokaż
}
```

---

## 📝 PODSUMOWANIE

**Desktop:**

- Sticky zawsze aktywny (oprócz kroku 6)
- Format: "Krok 2 · Wymiary"
- Zawsze widoczny podczas scrollowania

**Mobile:**

- Sticky aktywny (oprócz kroku 6)
- Format: "krok 2 wymiary" (lowercase, bez bulleta)
- **Ukrywa się** przy scroll w dół (oszczędność miejsca)
- **Pokazuje się** przy scroll w górę (łatwy dostęp)

**Krok 6 (Wyniki):**

- Sticky **wyłączony** (nie przeszkadza w przeglądaniu)
- Animacja typewriter + CTA

---

**Pliki:**

- `js/workflowController.js` — główna logika progress bara
- `js/mobileController.js` — mobile hide/show behavior
- `css/main.css` — desktop styling
- `css/mobile-redesign.css` — mobile styling

---

**Ostatnia aktualizacja:** 2025-12-18
