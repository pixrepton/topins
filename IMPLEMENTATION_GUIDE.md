# MOBILE REDESIGN – INSTRUKCJA IMPLEMENTACJI
## TOP-INSTAL Heat Pump Calculator & Configurator

**Wersja**: 1.0  
**Data**: 16 grudnia 2025  
**Autor**: Zordon Design System

---

## SPIS TREŚCI

1. [Przegląd](#1-przegląd)
2. [Struktura plików](#2-struktura-plików)
3. [Integracja z istniejącym kodem](#3-integracja-z-istniejącym-kodem)
4. [Krok po kroku: Implementacja](#4-krok-po-kroku-implementacja)
5. [Testowanie](#5-testowanie)
6. [Troubleshooting](#6-troubleshooting)
7. [FAQ](#7-faq)

---

## 1. PRZEGLĄD

### Co zostało dostarczone?

#### 📄 **MOBILE_DESIGN_STRATEGY.md**
- Kompleksowa strategia designu mobile
- Benchmarking konkurencji (Viessmann, Mitsubishi, Daikin)
- Design system mobile (typography, spacing, colors)
- Szczegółowe opisy komponentów
- Mikrointerakcje i animacje
- Accessibility guidelines (WCAG AA)
- Success metrics

#### 🎨 **mobile-redesign.css**
- Production-ready CSS dla mobile
- Mobile-first approach (@media max-width: 767px)
- Wszystkie komponenty: hero, progress, forms, cards, navigation
- Touch-optimized (44×44px minimum tap targets)
- Animations i transitions
- Error states, loading states, toast notifications
- Accessibility features (focus indicators, reduced motion)
- ~1400 linii czystego, dokumentowanego CSS

#### ⚙️ **mobileController.js**
- JavaScript controller dla mobile behaviors
- Scroll detection (hide/show progress bar, bottom nav)
- Keyboard detection (iOS/Android)
- Touch gesture handlers (swipe left/right)
- Accordion controls
- Toast notifications (success, error, info)
- Loading overlay
- Haptic feedback (vibration)
- Safe area insets (iOS notch)
- Debug utilities

### Filozofia designu

1. **Hetzner-style minimalism** – czysty, zbalansowany, profesjonalny
2. **HVAC precision** – technical excellence, trust signals
3. **Mobile-first** – priorytety: touch, thumb zones, readability
4. **Progressive disclosure** – informacje ujawniane krok po kroku
5. **Microinteractions** – subtelne, eleganckie animacje (0.15-0.25s)

---

## 2. STRUKTURA PLIKÓW

### Nowe pliki (utworzone)

```
main/
├── kalkulator/
│   ├── css/
│   │   └── mobile-redesign.css          ← NOWY (1.4KB)
│   └── js/
│       └── mobileController.js          ← NOWY (~450 linii)
├── MOBILE_DESIGN_STRATEGY.md            ← NOWY (dokumentacja)
└── IMPLEMENTATION_GUIDE.md              ← NOWY (ten plik)
```

### Istniejące pliki (do modyfikacji)

```
main/
├── kalkulator/
│   ├── calculator.html                  ← Dodać <link> do mobile CSS i <script> do mobileController.js
│   ├── css/
│   │   └── main.css                     ← Opcjonalnie: dodać media queries dla override
│   └── js/
│       ├── workflowController.js        ← Opcjonalnie: integracja z MobileController
│       └── tabNavigation.js             ← Opcjonalnie: rozszerzyć o mobile behaviors
└── konfigurator/
    └── konfigurator.html                ← Dodać <link> do mobile CSS i <script> do mobileController.js
```

---

## 3. INTEGRACJA Z ISTNIEJĄCYM KODEM

### 3.1 Dodaj mobile CSS do HTML

#### calculator.html

Znajdź sekcję `<head>` i dodaj **po** istniejących stylach:

```html
<head>
  <!-- Existing styles -->
  <link rel="stylesheet" href="./css/main.css">
  <link rel="stylesheet" href="./css/error-system.css">
  <link rel="stylesheet" href="./css/onboarding-modal.css">
  <link rel="stylesheet" href="./css/workflow-system.css">
  <link rel="stylesheet" href="./css/ai-coach-dock.css">
  
  <!-- 🆕 MOBILE REDESIGN -->
  <link rel="stylesheet" href="./css/mobile-redesign.css">
</head>
```

#### konfigurator.html

```html
<head>
  <!-- Existing styles -->
  <link rel="stylesheet" href="configurator.css">
  <link rel="stylesheet" href="configurator-v2-flat.css">
  <link rel="stylesheet" href="../kalkulator/css/error-system.css">
  <link rel="stylesheet" href="../kalkulator/css/onboarding-modal.css">
  
  <!-- 🆕 MOBILE REDESIGN -->
  <link rel="stylesheet" href="../kalkulator/css/mobile-redesign.css">
</head>
```

---

### 3.2 Dodaj mobileController.js do HTML

#### calculator.html

Znajdź koniec `<body>` (przed `</body>`) i dodaj **po** istniejących skryptach:

```html
<body>
  <!-- Existing content -->
  
  <!-- Existing scripts -->
  <script src="./js/state.js"></script>
  <script src="./js/engine.js"></script>
  <script src="./js/render.js"></script>
  <script src="./js/tabNavigation.js"></script>
  <script src="./js/workflowController.js"></script>
  <!-- ... other scripts ... -->
  
  <!-- 🆕 MOBILE CONTROLLER -->
  <script src="./js/mobileController.js"></script>
</body>
```

#### konfigurator.html

```html
<body>
  <!-- Existing content -->
  
  <!-- Existing scripts -->
  <script src="configurator-unified.js"></script>
  
  <!-- 🆕 MOBILE CONTROLLER -->
  <script src="../kalkulator/js/mobileController.js"></script>
</body>
```

---

### 3.3 Opcjonalnie: Integracja WorkflowController z MobileController

Jeśli chcesz zsynchronizować WorkflowController (desktop) z MobileController (mobile), dodaj do `workflowController.js`:

```javascript
// Na końcu workflowController.js, w metodzie updateProgress():

updateProgress(tabIndex) {
  // ... existing code ...
  
  // 🆕 Update mobile controller (if available)
  if (window.MobileController && window.MobileController.state.isMobile) {
    window.MobileController.updateProgress(tabIndex + 1, this.steps.length);
  }
}
```

---

## 4. KROK PO KROKU: IMPLEMENTACJA

### FAZA 1: Setup (10 min)

#### Krok 1: Dodaj pliki
✅ Skopiuj `mobile-redesign.css` do `main/kalkulator/css/`  
✅ Skopiuj `mobileController.js` do `main/kalkulator/js/`

#### Krok 2: Linkuj w HTML
✅ Dodaj `<link>` do mobile CSS w `calculator.html` i `konfigurator.html`  
✅ Dodaj `<script>` do mobileController.js w obu plikach

#### Krok 3: Test podstawowy
✅ Otwórz `calculator.html` w przeglądarce  
✅ Zmień viewport na mobile (DevTools: Toggle Device Toolbar, iPhone 12)  
✅ Sprawdź w konsoli: `MobileController` powinien się zainicjalizować

**Oczekiwany output w konsoli:**
```
🚀 MobileController: Initializing...
✅ MobileController: Initialized successfully
```

---

### FAZA 2: Komponenty (2-3 godz.)

#### Krok 4: Hero Section

**Obecny HTML** (nie modyfikuj):
```html
<section class="hero hero-hetzner">
  <div class="hero-media">
    <img src="../img/panasonic.png" alt="Panasonic">
  </div>
  <div class="container hero-inner">
    <span class="hero-pill">TOP-INSTAL</span>
    <h1>KALKULATOR MOCY POMPY CIEPŁA</h1>
    <p class="hero-lead">Długi tekst...</p>
  </div>
</section>
```

**Efekt mobile CSS** (automatyczny):
- Height: 40-50vh (nie blokuje treści)
- Font size: 28-36px (responsive)
- Lead text: 14px (skrócony)
- Ciemniejszy gradient overlay (lepszy kontrast)

**Test**:
- [ ] Hero nie zajmuje całego ekranu
- [ ] Tekst jest czytelny (kontrast)
- [ ] Badge "TOP-INSTAL" jest widoczny

---

#### Krok 5: Progress Bar

**Obecny HTML** (nie modyfikuj):
```html
<div class="progress-bar-container" id="progress-bar-container">
  <div class="form-progress hp-progress" id="global-progress-bar">
    <div class="form-progress-fill" id="top-progress-fill"></div>
  </div>
  <div class="progress-info-row hp-progress-info">
    <div class="form-progress-percentage" id="progress-percentage">12%</div>
    <div class="form-progress-label" id="progress-label">Start · Wprowadzenie</div>
  </div>
</div>
```

**Efekt mobile CSS + JS**:
- Thin bar: 3px height
- Sticky on scroll down
- Hide on scroll up (więcej przestrzeni)
- Mobile label formatting: lowercase, no "·"

**Test**:
- [ ] Progress bar przykleja się przy scrollowaniu w dół
- [ ] Progress bar znika przy scrollowaniu w górę
- [ ] Label jest sformatowany: "start wprowadzenie" (lowercase)

---

#### Krok 6: Building Type Cards

**Obecny HTML** (nie modyfikuj):
```html
<div class="building-type-cards">
  <button class="building-type-card" data-value="single_house">
    <div class="building-type-card__icon">
      <img src="../img/dom.png" alt="">
    </div>
    <div class="building-type-card__label">Dom wolnostojący</div>
  </button>
  <!-- 3 more cards -->
</div>
```

**Efekt mobile CSS**:
- 2×2 grid (nie 4 kolumny)
- Min height: 120px (większy tap target)
- Selected state: zielona ramka + checkmark
- Touch feedback: scale 0.98 on tap

**Test**:
- [ ] Karty są w 2 kolumnach
- [ ] Tap target jest ≥ 44×44px
- [ ] Selected state: zielona ramka + ✓
- [ ] Tap daje visual feedback (scale)

---

#### Krok 7: Form Inputs

**Obecny HTML** (nie modyfikuj):
```html
<input type="text" id="..." name="..." required>
<select id="..." name="...">
  <option>...</option>
</select>
```

**Efekt mobile CSS**:
- Height: 52px (touch-friendly)
- Font-size: 16px (zapobiega iOS zoom)
- Focus state: czerwona ramka + shadow
- Select: custom arrow (consistent)

**Test**:
- [ ] Inputy mają 52px wysokości
- [ ] Font-size ≥ 16px (sprawdź w DevTools)
- [ ] Focus: czerwona ramka pojawia się
- [ ] iOS nie zoomuje przy focus (test na real device)

---

#### Krok 8: Radio Buttons

**Obecny HTML** (może wymagać modyfikacji):

**Jeśli obecny kod to**:
```html
<label>
  <input type="radio" name="zone" value="III">
  <span>Strefa III (-20°C)</span>
</label>
```

**Dodaj wrapper**:
```html
<label class="radio-option-mobile">
  <input type="radio" name="zone" value="III">
  <span class="radio-custom"></span>
  <span class="radio-label">Strefa III (-20°C)</span>
</label>
```

**Efekt mobile CSS**:
- Custom radio: 24px circle
- Full row clickable
- Selected: zielona ramka + biała kropka wewnątrz
- Touch feedback on tap

**Test**:
- [ ] Radio button: 24px size
- [ ] Całe pole jest klikalne
- [ ] Selected: zielony + biała kropka
- [ ] Tap daje feedback

---

#### Krok 9: Bottom Navigation

**Obecny HTML** (nie modyfikuj):
```html
<div class="step-nav">
  <button id="nav-prev">← Wstecz</button>
  <button id="nav-next">Dalej →</button>
</div>
```

**Efekt mobile CSS**:
- Fixed at bottom (80px + safe area)
- Hide on keyboard open
- Hide on scroll down, show on scroll up
- iOS safe area inset (notch)

**Test**:
- [ ] Navigation jest na dole ekranu
- [ ] Nie zasłania content (body ma padding-bottom)
- [ ] Znika przy otwieraniu klawiatury
- [ ] Znika/pokazuje się przy scrollowaniu

---

#### Krok 10: Configurator Selection Bar

**Obecny HTML** (nie modyfikuj):
```html
<div class="configurator-selections-bar">
  <div class="selections-inner">
    <div class="selection-item" data-type="pompa">
      <span class="selection-label">Pompa ciepła:</span>
      <span class="selection-value">—</span>
    </div>
    <!-- more items -->
  </div>
</div>
```

**Efekt mobile CSS**:
- Horizontal scroll (nie grid)
- Snap points
- Min-width: 120px per chip
- Scrollbar hidden

**Test**:
- [ ] Chipy przewijają się poziomo (smooth scroll)
- [ ] Snap effect działa
- [ ] Scrollbar jest ukryty
- [ ] Każdy chip ma min 120px

---

#### Krok 11: Product Cards (Configurator)

**Obecny HTML** (nie modyfikuj):
```html
<div class="options-grid">
  <div class="option-card" data-product-id="...">
    <div class="option-card__image">
      <img src="..." alt="">
    </div>
    <div class="option-card__content">
      <h3 class="option-card__title">KIT-WC09K3E5</h3>
      <p class="option-card__description">...</p>
    </div>
    <button class="option-card__button">Wybierz</button>
  </div>
</div>
```

**Efekt mobile CSS**:
- Single column (nie grid)
- Full-width cards
- Selected: zielona ramka + animation
- Image: 180px height (fixed)

**Test**:
- [ ] Karty są w 1 kolumnie
- [ ] Selected: zielona ramka + bounce animation
- [ ] Przycisk zmienia kolor na zielony (selected state)
- [ ] Obrazek jest wyśrodkowany (180px height)

---

### FAZA 3: Interakcje (1-2 godz.)

#### Krok 12: Accordion Help Boxes

**Obecny HTML** (może wymagać modyfikacji):

**Jeśli obecny kod to**:
```html
<div class="help-box">
  <h4>Jak to działa?</h4>
  <p>Treść...</p>
</div>
```

**Dodaj strukturę accordion**:
```html
<div class="help-box">
  <button class="help-toggle">
    <svg class="icon-info">...</svg>
    Jak to działa?
    <svg class="help-toggle-icon">⌄</svg>
  </button>
  <div class="help-content">
    <p>Treść...</p>
  </div>
</div>
```

**Efekt mobile JS**:
- `MobileController.setupAccordions()` automatycznie konwertuje help-boxy na accordiony
- Click toggle: open/close z animacją
- Max-height transition (smooth)

**Test**:
- [ ] Help box jest domyślnie zamknięty
- [ ] Klik na toggle otwiera/zamyka
- [ ] Animacja jest smooth (0.3s)
- [ ] Chevron rotates 180° (open state)

---

#### Krok 13: Toast Notifications

**API**:
```javascript
// Success toast
MobileController.showToast('Dane zapisane pomyślnie', 'success', 3000);

// Error toast
MobileController.showToast('Wystąpił błąd', 'error', 3000);

// Info toast
MobileController.showToast('Sprawdź wprowadzone dane', 'info', 3000);
```

**Przykład użycia** (dodaj do istniejących event handlers):
```javascript
// W downloadPDF.js lub podobnym
function handlePDFDownload() {
  MobileController.showLoading('Generowanie PDF...');
  
  generatePDF()
    .then(() => {
      MobileController.hideLoading();
      MobileController.showToast('PDF pobrany pomyślnie', 'success');
    })
    .catch((error) => {
      MobileController.hideLoading();
      MobileController.showToast('Nie udało się pobrać PDF', 'error');
    });
}
```

**Test**:
- [ ] Toast pojawia się na dole ekranu (nad bottom nav)
- [ ] Auto-dismiss po 3s
- [ ] Haptic feedback (wibracja)
- [ ] Fade out animation działa

---

#### Krok 14: Loading Overlay

**API**:
```javascript
// Show loading
const overlay = MobileController.showLoading('Obliczanie...');

// Hide loading
MobileController.hideLoading();
```

**Test**:
- [ ] Overlay pokrywa cały ekran
- [ ] Spinner się obraca
- [ ] Tekst jest widoczny
- [ ] Hide: fade out smooth

---

#### Krok 15: Haptic Feedback

**Automatyczne** (MobileController dodaje vibration do):
- Button taps
- Toast notifications
- Accordion toggle
- Card selection

**Manual** (jeśli potrzebujesz):
```javascript
MobileController.vibrate(10); // 10ms vibration
```

**Test** (tylko na real device):
- [ ] Tap na przycisku daje vibration
- [ ] Toast daje vibration
- [ ] Accordion toggle daje vibration

---

### FAZA 4: Polish & Optimization (1 godz.)

#### Krok 16: iOS Safe Area

**Automatyczne** (CSS używa `env(safe-area-inset-bottom)`):
```css
.bottom-nav-mobile {
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}
```

**Test** (tylko na iPhone X+ z notch):
- [ ] Bottom nav nie jest zasłonięty przez notch
- [ ] Spacing jest prawidłowy

---

#### Krok 17: Accessibility

**Automatyczne** (mobile CSS zawiera):
- Focus indicators (3px outline)
- Touch targets ≥ 44px
- Color contrast WCAG AA
- Reduced motion support

**Test**:
- [ ] Tab navigation działa (keyboard)
- [ ] Focus indicators są widoczne
- [ ] Screen reader: wszystkie elementy są opisane
- [ ] Reduced motion: animacje są wyłączone (test w DevTools: prefers-reduced-motion)

---

#### Krok 18: Performance

**Sprawdź Lighthouse**:
```bash
# Chrome DevTools > Lighthouse
# Device: Mobile
# Categories: Performance, Accessibility
```

**Target scores**:
- [ ] Performance: ≥ 90
- [ ] Accessibility: ≥ 95
- [ ] Best Practices: ≥ 90

**Jeśli wyniki są niskie**:
- Dodaj `loading="lazy"` do obrazków
- Zmniejsz rozmiar obrazków (webp format)
- Minifikuj CSS/JS

---

### FAZA 5: Testing (2 godz.)

#### Krok 19: Device Testing

**Minimum devices** (real or BrowserStack):
- [ ] iPhone SE (375×667) – najmniejszy modern iPhone
- [ ] iPhone 12/13/14 (390×844) – najpopularniejszy
- [ ] iPhone 14 Pro Max (430×932) – największy
- [ ] Samsung Galaxy S21 (360×800) – Android baseline
- [ ] Samsung Galaxy S21+ (384×854)

**Co testować**:
- [ ] Layout nie się łamie
- [ ] Touch targets są klikalne
- [ ] Text jest czytelny
- [ ] Animacje są smooth
- [ ] Keyboard behavior działa

---

#### Krok 20: Browser Testing

**Browsers**:
- [ ] Safari iOS 15+
- [ ] Chrome Android 100+
- [ ] Samsung Internet 18+
- [ ] Firefox Mobile 100+

**Co testować**:
- [ ] CSS działa poprawnie
- [ ] JavaScript nie crashuje
- [ ] Viewport meta tag działa
- [ ] Safe area działa (iOS)

---

#### Krok 21: User Testing

**Zrób quick test z 3-5 użytkownikami**:
- [ ] Daj zadanie: "Oblicz moc pompy ciepła dla domu 120m²"
- [ ] Obserwuj: czy się gubią? Gdzie klikają?
- [ ] Zapytaj: "Co było trudne? Co było intuicyjne?"

**Zbierz feedback i iteruj**.

---

## 5. TESTOWANIE

### 5.1 Checklist: Desktop (sanity check)

Upewnij się, że desktop view NIE został zepsuty:

- [ ] Desktop layout wygląda jak poprzednio
- [ ] Progress bar działa (sticky behavior)
- [ ] Formularz działa (validation, navigation)
- [ ] Konfigurator działa (selection bar, product cards)
- [ ] Nie ma błędów w konsoli

**Jak testować**: Otwórz w przeglądarce z width > 768px.

---

### 5.2 Checklist: Mobile

#### Visual
- [ ] Hero: 40-50vh, tekst czytelny
- [ ] Progress bar: thin (3px), mobile label
- [ ] Building cards: 2×2 grid, 120px min-height
- [ ] Form inputs: 52px height, 16px font
- [ ] Radio buttons: 24px custom radio
- [ ] Bottom nav: fixed, safe area
- [ ] Selection bar: horizontal scroll
- [ ] Product cards: single column

#### Interactions
- [ ] Scroll: progress bar hide/show
- [ ] Keyboard: bottom nav hides
- [ ] Tap: visual feedback (scale 0.98)
- [ ] Swipe: działa na kartach (opcjonalnie)
- [ ] Accordion: open/close smooth
- [ ] Toast: auto-dismiss, haptic
- [ ] Loading: overlay shows/hides

#### Performance
- [ ] Lighthouse Performance: ≥ 90
- [ ] Lighthouse Accessibility: ≥ 95
- [ ] No layout shifts (CLS < 0.1)
- [ ] No errors in console

#### Accessibility
- [ ] Touch targets: ≥ 44px
- [ ] Color contrast: WCAG AA
- [ ] Focus indicators: visible
- [ ] Screen reader: works
- [ ] Keyboard navigation: works
- [ ] Reduced motion: animations off

---

### 5.3 Debug Tools

#### Console Commands

```javascript
// Check if MobileController is loaded
window.MobileController

// Debug mobile info
mobileDebug()

// Manual tests
MobileController.showToast('Test toast', 'success')
MobileController.showLoading('Test loading')
MobileController.hideLoading()
MobileController.vibrate(50)
```

#### Chrome DevTools

```
1. Toggle Device Toolbar (Cmd+Shift+M / Ctrl+Shift+M)
2. Select device: iPhone 12 Pro
3. Refresh page
4. Check console for MobileController init
5. Test interactions (tap, scroll, keyboard)
```

#### Lighthouse

```
1. Open DevTools
2. Go to Lighthouse tab
3. Device: Mobile
4. Categories: Performance, Accessibility
5. Generate report
6. Fix issues if score < 90
```

---

## 6. TROUBLESHOOTING

### Problem: MobileController nie inicjalizuje się

**Symptom**: W konsoli nie ma `✅ MobileController: Initialized`

**Possible causes**:
1. Plik `mobileController.js` nie jest załadowany
   - **Fix**: Sprawdź `<script src="./js/mobileController.js"></script>` w HTML
2. Błąd w JS (syntax error)
   - **Fix**: Sprawdź console errors, popraw syntax
3. Script ładuje się przed DOMContentLoaded
   - **Fix**: Umieść script przed `</body>`, nie w `<head>`

---

### Problem: Mobile CSS nie działa

**Symptom**: Layout wygląda jak desktop na mobile

**Possible causes**:
1. Plik `mobile-redesign.css` nie jest załadowany
   - **Fix**: Sprawdź `<link rel="stylesheet" href="./css/mobile-redesign.css">` w HTML
2. CSS jest załadowany, ale overridowany przez `main.css`
   - **Fix**: Upewnij się, że `mobile-redesign.css` jest **po** `main.css` w `<head>`
3. Viewport meta tag jest błędny
   - **Fix**: Sprawdź `<meta name="viewport" content="width=device-width, initial-scale=1">`

---

### Problem: Touch targets są za małe

**Symptom**: Trudno kliknąć przyciski/karty na mobile

**Possible causes**:
1. CSS nie jest aplikowany (sprawdź DevTools: Computed styles)
   - **Fix**: Upewnij się że mobile CSS jest załadowany
2. Existing CSS ma higher specificity
   - **Fix**: Dodaj `!important` do mobile CSS (last resort)
3. Viewport jest ustawiony na desktop
   - **Fix**: Sprawdź viewport meta tag

---

### Problem: Bottom nav zasłania content

**Symptom**: Ostatnie elementy formularza są niewidoczne

**Fix**:
```css
/* Dodaj do mobile CSS */
@media (max-width: 767px) {
  body.has-bottom-nav {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}
```

**I dodaj class do body**:
```javascript
// W mobileController.js, metoda init():
if (this.elements.bottomNav) {
  this.elements.body.classList.add('has-bottom-nav');
}
```

---

### Problem: iOS zoom przy focus na input

**Symptom**: iPhone zoomuje stronę gdy klikasz input

**Fix**: Upewnij się że input ma `font-size: 16px`:
```css
input[type="text"],
input[type="email"],
select {
  font-size: 16px !important;
}
```

---

### Problem: Progress bar nie przykleja się

**Symptom**: Progress bar nie staje się sticky przy scrollowaniu

**Possible causes**:
1. WorkflowController nie dodaje class `.sticky`
   - **Fix**: Sprawdź czy WorkflowController.setupStickyProgress() jest wywołany
2. CSS dla sticky nie jest załadowany
   - **Fix**: Sprawdź DevTools: `.progress-bar-container.sticky` powinien mieć `position: fixed`
3. Z-index conflict
   - **Fix**: Zwiększ `z-index: 100` do `z-index: 1000`

---

### Problem: Accordion nie otwiera się

**Symptom**: Klik na help box nie robi nic

**Possible causes**:
1. `MobileController.setupAccordions()` nie jest wywołany
   - **Fix**: Sprawdź console log, upewnij się że MobileController.init() się wykonał
2. HTML structure jest błędna (brak `.help-toggle` lub `.help-content`)
   - **Fix**: Dodaj correct structure (zobacz Krok 12)
3. Event listener nie jest attached
   - **Fix**: Sprawdź czy `actualToggle.addEventListener('click', ...)` się wykonuje

---

### Problem: Toast nie pojawia się

**Symptom**: `MobileController.showToast()` nie pokazuje toasta

**Possible causes**:
1. CSS dla toast nie jest załadowany
   - **Fix**: Sprawdź DevTools: `.toast-mobile` powinien mieć styles
2. Toast jest renderowany, ale poza viewport
   - **Fix**: Sprawdź `bottom` position (powinno być `calc(80px + env(...)`)
3. Z-index jest za niski
   - **Fix**: Zwiększ `z-index: 200` do `z-index: 9999`

---

### Problem: Keyboard detection nie działa

**Symptom**: Bottom nav nie chowa się gdy otwiera się klawiatura

**Possible causes**:
1. `window.visualViewport` nie jest wspierane (old browser)
   - **Fix**: Fallback to `window.innerHeight` (już jest w kodzie)
2. Keyboard nie zmienia viewport height (Android keyboard behavior)
   - **Fix**: Dodaj manual detection na focus/blur input:
   ```javascript
   inputs.forEach(input => {
     input.addEventListener('focus', () => {
       this.elements.bottomNav.classList.add('hidden');
     });
     input.addEventListener('blur', () => {
       setTimeout(() => {
         this.elements.bottomNav.classList.remove('hidden');
       }, 300);
     });
   });
   ```

---

## 7. FAQ

### Q: Czy mobile CSS override desktop CSS?

**A**: Nie. Mobile CSS używa `@media (max-width: 767px)`, więc aplikuje się tylko na mobile. Desktop pozostaje niezmieniony.

---

### Q: Czy muszę modyfikować istniejący HTML?

**A**: W większości przypadków nie. Mobile CSS jest zaprojektowany aby działać z istniejącym HTML. Jedyne wyjątki:
- Radio buttons: dodaj `.radio-option-mobile` wrapper (opcjonalnie)
- Accordions: dodaj `.help-toggle` button (opcjonalnie, MobileController może to zrobić automatycznie)

---

### Q: Co jeśli chcę inny breakpoint niż 767px?

**A**: Edytuj `mobile-redesign.css` i zmień wszystkie `@media (max-width: 767px)` na nowy breakpoint, np. `@media (max-width: 1023px)`.

---

### Q: Czy mobile CSS jest responsive (działa na tablet)?

**A**: Tak, częściowo. Mobile CSS target 320-767px. Dla tablet (768-1023px) możesz:
1. Użyć dodatkowego breakpoint: `@media (min-width: 768px) and (max-width: 1023px)`
2. Lub rozszerzyć mobile CSS: `@media (max-width: 1023px)`

Obecna implementacja zakłada: mobile ≤ 767px, desktop > 767px.

---

### Q: Jak dodać nowy komponent mobile?

**A**: Dodaj do `mobile-redesign.css` w sekcji odpowiedniej:

```css
@media (max-width: 767px) {
  .new-component-mobile {
    /* styles */
  }
}
```

Jeśli wymaga JS logic, dodaj do `mobileController.js`:

```javascript
// W metodzie init():
this.setupNewComponent();

// Nowa metoda:
setupNewComponent() {
  const component = document.querySelector('.new-component-mobile');
  if (!component) return;
  
  // logic here
}
```

---

### Q: Czy mogę użyć tylko CSS bez JS?

**A**: Tak. Mobile CSS działa standalone. JS (mobileController.js) jest opcjonalny, ale dodaje:
- Scroll behavior (hide/show progress bar, bottom nav)
- Keyboard detection
- Touch gestures
- Accordion controls
- Toast notifications
- Loading overlay
- Haptic feedback

Jeśli nie potrzebujesz tych features, skip JS.

---

### Q: Jak przetestować iOS safe area bez iPhone?

**A**: Chrome DevTools > Device Toolbar > iPhone X+. DevTools emuluje safe area. Ale dla production test, użyj real device lub BrowserStack.

---

### Q: Jak wyłączyć animacje dla user preference?

**A**: Automatyczne. Mobile CSS zawiera:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

User może włączyć "Reduce motion" w system settings (iOS: Settings > Accessibility > Motion > Reduce Motion).

---

### Q: Czy mobile CSS wpływa na PDF generation?

**A**: Nie. Mobile CSS używa screen media query. PDF generation używa print media. Dodatkowo, mobile CSS zawiera:
```css
@media print {
  .progress-bar-container,
  .bottom-nav-mobile,
  .toast-mobile {
    display: none !important;
  }
}
```

---

### Q: Jak zintegrować z istniejącym error handling?

**A**: Użyj `MobileController.showToast()` zamiast alert():

**Before**:
```javascript
if (error) {
  alert('Wystąpił błąd');
}
```

**After**:
```javascript
if (error) {
  if (window.MobileController && window.MobileController.state.isMobile) {
    MobileController.showToast('Wystąpił błąd', 'error');
  } else {
    alert('Wystąpił błąd'); // Fallback for desktop
  }
}
```

---

### Q: Jak upgrade mobile CSS w przyszłości?

**A**:
1. Backup current `mobile-redesign.css`
2. Copy new version
3. Merge custom changes (if any)
4. Test na staging
5. Deploy to production

Alternatywnie: użyj version control (Git) i merge conflicts.

---

## ZAKOŃCZENIE

### Co dalej?

1. **Monitor metrics** (Analytics):
   - Mobile completion rate (target: > 85%)
   - Mobile bounce rate (target: < 20%)
   - Time to complete (target: < 5 min)
   - Error rate (target: < 5%)

2. **Collect user feedback**:
   - Surveys (CSAT, NPS)
   - Heatmaps (Hotjar, Clarity)
   - Session recordings
   - Support tickets

3. **Iterate & improve**:
   - Fix pain points
   - A/B test variants
   - Optimize performance
   - Add new features

---

### Support

Jeśli potrzebujesz pomocy:
- **Documentation**: `MOBILE_DESIGN_STRATEGY.md`
- **Code**: `mobile-redesign.css`, `mobileController.js`
- **Troubleshooting**: Section 6 tego dokumentu
- **Debug**: `mobileDebug()` w console

---

**Powodzenia! 🚀**

---

**Version**: 1.0  
**Last updated**: 16.12.2025  
**Author**: Zordon Design System
