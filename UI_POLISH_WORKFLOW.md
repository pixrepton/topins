# 🎨 UI POLISH WORKFLOW — NAJWYŻSZY POZIOM

**Jak uzyskać premium finish z Visual Finishing Mode**

---

## 🎯 KIEDY UŻYWAĆ

Gdy layout jest **stabilny** i chcesz:

- Doszlifować spacing
- Poprawić optical balance
- Zrobić final polish przed wdrożeniem
- Podnieść poziom z "działa" do "premium"

**Nie używaj** gdy:

- Layout jeszcze się zmienia
- Potrzebujesz nowych features
- Struktura HTML wymaga refaktoru

---

## 📋 WORKFLOW (KROK PO KROKU)

### FAZA 1: PRZYGOTOWANIE

#### 1. Zrób Screenshot "Przed"

```
- Otwórz stronę w przeglądarce
- Zrób screenshot (Win+Shift+S)
- Zapisz jako: .proJECT/main/docs/screenshots/before-polish-[nazwa-sekcji].png
```

#### 2. Określ Scope

**Zamiast:**

```
"doszlifuj UI"
```

**Lepiej:**

```
"Tryb Visual Finishing Mode:
Sekcja: wybór pompy (.proJECT/main/konfigurator/)
Focus:
- spacing między kartami produktów
- typografia nagłówków
- optical balance przycisków
- mobile 390px

Nie zmieniaj: struktura HTML, logika JS"
```

### FAZA 2: WYKONANIE (Z AI)

#### 3. Użyj Precyzyjnego Prompta

**Template:**

```
@ui-agent aktywuj Visual Finishing Mode

Sekcja: [konkretna ścieżka do pliku CSS/HTML]
Device: [desktop 1440px / mobile 390px / tablet 768px]

Focus na:
- [ ] Spacing rhythm (8/16/24px)
- [ ] Typography hierarchy
- [ ] Optical alignment
- [ ] Touch targets (min 44x44px na mobile)
- [ ] Visual balance między elementami
- [ ] Micro-transitions (0.25s ease)

Nie zmieniaj:
- Struktura HTML
- Funkcjonalność JS
- Layout breakpoints

Sprawdź przez:
@html-validator (accessibility)
@visual-regression (przed/po)

Cel: premium, restrained, confident finish
```

#### 4. AI Wykona

Cursor z Visual Finishing Mode:

1. ✅ Czyta istniejący kod
2. ✅ Stosuje micro-adjustments (2-6px)
3. ✅ Respektuje spacing system
4. ✅ Nie rusza struktury
5. ✅ Auto-review (prettier, linters)
6. ✅ Sprawdza accessibility

### FAZA 3: WERYFIKACJA

#### 5. Zrób Screenshot "Po"

```
- Odśwież stronę
- Zrób screenshot tej samej sekcji
- Zapisz jako: .proJECT/main/docs/screenshots/after-polish-[nazwa-sekcji].png
```

#### 6. Porównaj (Opcjonalnie z MCP)

```
@visual-regression porównaj:
before: docs/screenshots/before-polish-wybor-pompy.png
after: docs/screenshots/after-polish-wybor-pompy.png
```

Lub ręcznie:

- Otwórz oba w osobnych okienkach
- Sprawdź czy zmiany są subtelne ale widoczne
- Oceń czy lepiej

#### 7. Iteracja (jeśli trzeba)

```
"Visual Finishing Mode - iteracja:

Dobrze:
- spacing między kartami
- typography

Do poprawy:
- przyciski wyglądają za duże na mobile
- nagłówek h2 zbyt blisko górnej krawędzi

Popraw tylko te 2 rzeczy"
```

---

## 🎨 PRZYKŁADY DOBRYCH PROMPTÓW

### Przykład 1: Mobile Polish

```
@ui-agent Visual Finishing Mode

Plik: .proJECT/main/konfigurator/konfigurator-style.css
Device: mobile 390px
Sekcja: formularz wyboru pompy

Focus:
- spacing między inputami (powinno być 16px)
- labels zbyt blisko inputów (dodaj 8px)
- button CTA za mały (min 44px wysokości)
- optical balance całego formularza

Nie zmieniaj struktury HTML.
Sprawdź @html-validator accessibility.
```

### Przykład 2: Desktop Typography

```
@ui-agent Visual Finishing Mode

Plik: .proJECT/main/kalkulator/kalkulator-style.css
Device: desktop 1440px
Sekcja: wyniki obliczeń

Focus TYLKO na typography:
- hierarchy h1 > h2 > p (czy wyraźna?)
- line-height (czy komfortowy?)
- letter-spacing w nagłówkach
- optical alignment liczb w tabeli

Nie zmieniaj: colors, spacing, layout.
```

### Przykład 3: Final Polish (All Devices)

```
@ui-agent Visual Finishing Mode

Plik: .proJECT/main/konfigurator/zestawy.css
All devices: 390px / 768px / 1440px

Finalne doszlifowanie przed deployem:
- spacing rhythm (8/16/24px)
- visual balance
- micro-transitions (0.25s)
- accessibility (kontrast, focus states)

Cel: premium finish, Hetzner-class minimalism.
Sprawdź @html-validator + @visual-regression.
```

---

## ⚡ POWER TIPS

### 1. **Konkretność > Ogólność**

Zamiast: "popraw spacing"
Lepiej: "zwiększ spacing między kartami z 12px do 16px"

### 2. **Jedno Urządzenie = Jeden Przebieg**

Najpierw: mobile 390px
Potem: desktop 1440px
(łatwiej ocenić rezultat)

### 3. **Screenshot Before/After = Must**

Bez tego trudno ocenić czy lepiej czy gorzej

### 4. **Iteruj w Małych Krokach**

Lepiej 3x małe tweaki niż 1x wielka zmiana

### 5. **Użyj @visual-regression dla Krytycznych Sekcji**

Np. landing page, CTA sections, formularze zakupowe

### 6. **Stop When Done**

Visual Finishing Mode mówi:

> "stop when further changes would be subjective, not improving clarity"

Jeśli czujesz że dalsze zmiany to już preferencje, nie poprawa → **stop**.

---

## 🧪 CHECKLIST: CZY TO NAJWYŻSZY POZIOM?

Po Visual Finishing sprawdź:

**Visual:**

- [ ] Spacing konsystentny (8/16/24px rhythm)
- [ ] Typography hierarchy wyraźna
- [ ] Optical alignment (elementy "czują się" zbalansowane)
- [ ] Żadne elementy "nie gryzą" (colors, sizes harmonijne)
- [ ] Minimalizm (nic zbędnego)

**Technical:**

- [ ] No linter errors (ESLint, Stylelint)
- [ ] Prettier formatted
- [ ] Accessibility OK (@html-validator)
- [ ] Touch targets min 44x44px (mobile)

**Feel:**

- [ ] Wygląda "engineered" (nie przypadkowe)
- [ ] Premium, calm, confident
- [ ] Hetzner-class (gdyby to była ich strona)

Jeśli wszystkie ✅ → **najwyższy poziom achieved**.

---

## 🎯 REZULTAT

Z tym workflow + Visual Finishing Mode masz:

✅ **Deterministyczny proces** (nie "jakoś wyjdzie")
✅ **Konkretne kryteria** (spacing system, optical balance)
✅ **Narzędzia weryfikacji** (MCP, screenshots)
✅ **Iteracyjne doskonalenie** (małe kroki → pewny rezultat)
✅ **Premium finish** (Zordon rules + Visual Finishing Mode)

**To nie jest "doszlifuj UI" → to jest inżynierski proces visual refinement.**

---

**Kiedy używać:** Layout stabilny, przed deployem, gdy chcesz z "działa" → "premium"
**Nie używać:** Gdy jeszcze budujesz features, zmieniasz strukturę

---

**Wersja:** 1.0
**Ostatnia aktualizacja:** 2025-12-18





