# 📝 Logika treści w konfiguratorze — specyfikacja kompletna

## 🎯 Cel dokumentu

Ten dokument definiuje **kompletną logikę wyświetlania treści** w poszczególnych krokach konfiguratora maszynowni. Każdy krok powinien dynamicznie aktualizować:

- `.section-description` — opis sekcji z wartościami z obliczeń
- `.recommendation-note` — wynik kalkulacji i rekomendacje
- Opcjonalnie: dodatkowe informacje kontekstowe

---

## 📋 KROK 1/9 — POMPA CIEPŁA

### Obecny stan

- ✅ HTML zawiera `.recommendation-note` z placeholderem
- ❌ Brak aktualizacji `.section-description` z rekomendowaną mocą
- ❌ Brak aktualizacji `.recommendation-note` z wartością mocy

### Wymagana logika

#### `.section-description` (w headerze sekcji)

**Przed obliczeniami:**

```
Na podstawie obliczeń rekomendujemy pompę o odpowiedniej mocy. Wybierz preferowany model.
```

**Po obliczeniach:**

```
Na podstawie obliczeń rekomendujemy pompę o mocy ${recommendedPower} kW. Wybierz preferowany model.
```

**Gdzie:**

- `recommendedPower = state.meta?.recommended_power_kw || state.meta?.max_heating_power || 'brak danych'`

#### `.recommendation-note` (pod kartami)

**Przed obliczeniami:**

```
Wynik kalkulacji: Rekomendowana wartość zostanie wyświetlona po obliczeniach.
```

**Po obliczeniach:**

```
Wynik kalkulacji: Rekomendowana wartość to ${recommendedPower} kW
```

**Dodatkowe informacje (opcjonalnie):**

- Jeśli wybrano Split: "System Split zapewnia optymalną wydajność i elastyczność montażu."
- Jeśli wybrano All-in-One: "System All-in-One zawiera wbudowany zasobnik CWU — oszczędność miejsca."

### Implementacja

Aktualizacja w `populateConfiguratorWithCalculatorData()` po renderowaniu kart pomp (linia ~2915):

```javascript
// Aktualizuj recommendation-note dla pompy
const pumpStep = document.querySelector('[data-step-key="pompa"]');
if (pumpStep) {
  const recommendedPower =
    state.meta?.recommended_power_kw || state.meta?.max_heating_power || null;

  if (recommendedPower) {
    // Aktualizuj section-description
    const sectionDescription = pumpStep.querySelector('.section-description');
    if (sectionDescription) {
      sectionDescription.textContent = `Na podstawie obliczeń rekomendujemy pompę o mocy ${recommendedPower} kW. Wybierz preferowany model.`;
    }

    // Aktualizuj recommendation-note
    let recommendationNote = pumpStep.querySelector('.recommendation-note');
    if (!recommendationNote) {
      recommendationNote = document.createElement('div');
      recommendationNote.className = 'recommendation-note';
      pumpStep.appendChild(recommendationNote);
    }
    recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Rekomendowana wartość to <strong>${recommendedPower} kW</strong></p>`;
  }
}
```

---

## 📋 KROK 2/9 — ZASOBNIK CWU

### Obecny stan

- ✅ **DZIAŁA** — aktualizuje `.section-description` z rekomendowaną pojemnością
- ✅ **DZIAŁA** — aktualizuje `.recommendation-note` z wartością pojemności

### Obecna implementacja

**Linie 2940-2952 w `configurator-unified.js`:**

```javascript
recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Rekomendowana wartość to <strong>${recommendedCapacity}L</strong></p>`;
sectionDescription.textContent = `Rekomendowana pojemność zasobnika to ${recommendedCapacity}L. Wybierz rodzaj wykończenia wewnętrznego.`;
```

### Ulepszenia (opcjonalne)

Dodać informację o liczbie osób i profilu:

```javascript
const people = state.meta?.hot_water_persons || state.meta?.cwu_people;
const profile = state.meta?.hot_water_usage || state.meta?.cwu_profile;
const profileLabel =
  profile === 'bath'
    ? 'podwyższone zużycie'
    : profile === 'shower_bath'
    ? 'standardowe zużycie'
    : 'małe zużycie';

if (people && profile) {
  recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Rekomendowana wartość to <strong>${recommendedCapacity}L</strong> (${people} ${
    people === 1 ? 'osoba' : people < 5 ? 'osoby' : 'osób'
  }, ${profileLabel})</p>`;
}
```

---

## 📋 KROK 3/9 — BUFOR CO

### Obecny stan

- ✅ **DZIAŁA** — aktualizuje `.section-description` z rekomendowaną pojemnością
- ✅ **DZIAŁA** — aktualizuje `.recommendation-note` z wartością pojemności lub informacją "nie wymagany"

### Obecna implementacja

**Linie 2982-2998 w `configurator-unified.js`:**

```javascript
if (recommendedCapacity > 0) {
  recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Rekomendowana pojemność to <strong>${recommendedCapacity}L</strong></p>`;
  sectionDescription.textContent = `Rekomendowana pojemność bufora to ${recommendedCapacity}L. Bufor stabilizuje pracę pompy i zwiększa jej żywotność.`;
} else {
  recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Bufor nie jest wymagany dla tej instalacji.</p>`;
}
```

### Ulepszenia (opcjonalne)

Dodać krótkie uzasadnienie:

- Dla bufora 0L: "Instalacja ma wystarczający zład wody — bufor nie jest wymagany."
- Dla bufora > 0L: "Bufor uzupełnia zład wody instalacji — zapewnia stabilną pracę pompy."

---

## 📋 KROK 4/9 — CYRKULACJA CWU

### Obecny stan

- ❌ Brak elementu `.recommendation-note` w HTML
- ❌ Brak aktualizacji `.section-description` z rekomendacją
- ❌ Brak wyświetlania informacji o rekomendacji

### Wymagana logika

#### `.section-description` (w headerze sekcji)

**Bazowy tekst:**

```
System cyrkulacji zapewnia natychmiastowy dostęp do ciepłej wody.
```

**Z rekomendacją (jeśli `circulationRules.recommended === true`):**

```
System cyrkulacji zapewnia natychmiastowy dostęp do ciepłej wody. Rekomendujemy cyrkulację dla większych domów (powyżej 180 m²) lub gdy komfort jest priorytetem.
```

**Bez rekomendacji (jeśli `circulationRules.recommended === false`):**

```
System cyrkulacji zapewnia natychmiastowy dostęp do ciepłej wody. Dla większości instalacji standardowa konfiguracja bez cyrkulacji jest wystarczająca.
```

#### `.recommendation-note` (nowy element — dodać do HTML)

**Jeśli `circulationRules.recommended === true`:**

```
Wynik kalkulacji: Rekomendujemy cyrkulację CWU dla Twojej instalacji (dom powyżej 180 m² lub profil komfortowy).
```

**Jeśli `circulationRules.recommended === false`:**

```
Wynik kalkulacji: Cyrkulacja CWU jest opcjonalna. Dla standardowych instalacji nie jest wymagana.
```

**Jeśli sekcja wyłączona (`circulationRules.enabled === false`):**

```
Wynik kalkulacji: Sekcja wyłączona — wybrana pompa All-in-One zawiera wbudowany zasobnik CWU.
```

### Implementacja

Aktualizacja w `populateConfiguratorWithCalculatorData()` po renderowaniu kart cyrkulacji (linia ~3020):

```javascript
// Aktualizuj recommendation-note dla cyrkulacji
if (evaluated && evaluated.circulationRules) {
  const circulationStep = document.querySelector('[data-step-key="cyrkulacja"]');
  if (circulationStep) {
    const isRecommended = evaluated.circulationRules.recommended === true;
    const isEnabled = evaluated.circulationRules.enabled === true;

    // Aktualizuj section-description
    const sectionDescription = circulationStep.querySelector('.section-description');
    if (sectionDescription) {
      if (!isEnabled) {
        sectionDescription.textContent =
          'Sekcja wyłączona — wybrana pompa All-in-One zawiera wbudowany zasobnik CWU.';
      } else if (isRecommended) {
        sectionDescription.textContent =
          'System cyrkulacji zapewnia natychmiastowy dostęp do ciepłej wody. Rekomendujemy cyrkulację dla większych domów (powyżej 180 m²) lub gdy komfort jest priorytetem.';
      } else {
        sectionDescription.textContent =
          'System cyrkulacji zapewnia natychmiastowy dostęp do ciepłej wody. Dla większości instalacji standardowa konfiguracja bez cyrkulacji jest wystarczająca.';
      }
    }

    // Utwórz lub zaktualizuj recommendation-note
    let recommendationNote = circulationStep.querySelector('.recommendation-note');
    if (!recommendationNote) {
      recommendationNote = document.createElement('div');
      recommendationNote.className = 'recommendation-note';
      circulationStep.appendChild(recommendationNote);
    }

    if (!isEnabled) {
      recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Sekcja wyłączona — wybrana pompa All-in-One zawiera wbudowany zasobnik CWU.</p>`;
    } else if (isRecommended) {
      recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Rekomendujemy cyrkulację CWU dla Twojej instalacji (dom powyżej 180 m² lub profil komfortowy).</p>`;
    } else {
      recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Cyrkulacja CWU jest opcjonalna. Dla standardowych instalacji nie jest wymagana.</p>`;
    }
  }
}
```

---

## 📋 KROK 5/9 — SERVICE CLOUD

### Obecny stan

- ❌ Brak elementu `.recommendation-note` w HTML
- ❌ Brak aktualizacji `.section-description` z informacją "W CENIE"

### Wymagana logika (z rozmów ChatGPT)

#### `.section-description` (w headerze sekcji)

**Bazowy tekst:**

```
Zdalne monitorowanie i serwis instalacji przez profesjonalistów.
```

**Z informacją premium:**

```
Zdalne monitorowanie i serwis instalacji przez profesjonalistów. Moduł internetowy — GRATIS w standardzie TOP-INSTAL (bez dopłat).
```

#### `.recommendation-note` (nowy element — dodać do HTML)

**Zawsze wyświetlane (jeśli sekcja włączona):**

```
Wynik kalkulacji: Moduł Service Cloud jest w standardzie TOP-INSTAL — bez dodatkowych kosztów. Większość firm dolicza za moduł Wi-Fi kilkaset złotych. Dzięki temu możemy pomagać zdalnie, diagnozować ustawienia i reagować szybciej.
```

**Jeśli sekcja wyłączona:**

```
Wynik kalkulacji: Service Cloud dostępny tylko dla pomp serii K (High Performance).
```

### Implementacja

Aktualizacja w `populateConfiguratorWithCalculatorData()` po renderowaniu karty Service Cloud (linia ~3037):

```javascript
// Aktualizuj recommendation-note dla Service Cloud
const serviceStep = document.querySelector('[data-step-key="service"]');
if (serviceStep) {
  const isEnabled = evaluated?.serviceCloudRules?.enabled === true;
  const generation = state.meta?.generation || 'K';

  // Aktualizuj section-description
  const sectionDescription = serviceStep.querySelector('.section-description');
  if (sectionDescription) {
    if (isEnabled) {
      sectionDescription.textContent =
        'Zdalne monitorowanie i serwis instalacji przez profesjonalistów. Moduł internetowy — GRATIS w standardzie TOP-INSTAL (bez dopłat).';
    } else {
      sectionDescription.textContent = `Service Cloud dostępny tylko dla pomp serii ${generation} (High Performance).`;
    }
  }

  // Utwórz lub zaktualizuj recommendation-note
  let recommendationNote = serviceStep.querySelector('.recommendation-note');
  if (!recommendationNote) {
    recommendationNote = document.createElement('div');
    recommendationNote.className = 'recommendation-note';
    serviceStep.appendChild(recommendationNote);
  }

  if (isEnabled) {
    recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Moduł Service Cloud jest w standardzie TOP-INSTAL — bez dodatkowych kosztów. Większość firm dolicza za moduł Wi-Fi kilkaset złotych. Dzięki temu możemy pomagać zdalnie, diagnozować ustawienia i reagować szybciej.</p>`;
  } else {
    recommendationNote.innerHTML = `<p><strong>Wynik kalkulacji:</strong> Service Cloud dostępny tylko dla pomp serii ${generation} (High Performance).</p>`;
  }
}
```

---

## 📋 KROK 6/9 — POSADOWIENIE JEDNOSTKI ZEWNĘTRZNEJ

### Obecny stan

- ❌ Brak elementu `.recommendation-note` w HTML
- ❌ Brak aktualizacji `.section-description` z rekomendacją

### Wymagana logika

#### `.section-description` (w headerze sekcji)

**Bazowy tekst:**

```
Sposób montażu jednostki zewnętrznej pompy ciepła.
```

**Z rekomendacją:**

```
Sposób montażu jednostki zewnętrznej pompy ciepła. Rekomendujemy montaż na fundamencie betonowym — najstabilniejsza opcja z redukcją drgań.
```

#### `.recommendation-note` (nowy element — dodać do HTML)

**Zawsze:**

```
Wynik kalkulacji: Rekomendujemy montaż na fundamencie betonowym (w cenie). Montaż na konsoli ściennej jest możliwy tylko dla lżejszych pomp (do 65 kg) i wymaga dodatkowej analizy konstrukcyjnej.
```

**Jeśli waga pompy > 65 kg:**

```
Wynik kalkulacji: Rekomendujemy montaż na fundamencie betonowym (w cenie). Uwaga: Twoja pompa ma masę powyżej 65 kg — montaż na konsoli ściennej wymaga dodatkowej analizy konstrukcyjnej.
```

**Jeśli mieszkanie (`building_type === 'apartment'`):**

```
Wynik kalkulacji: Rekomendujemy montaż na fundamencie betonowym (w cenie). Montaż na konsoli ściennej nie jest dostępny dla mieszkań.
```

### Implementacja

Aktualizacja w `populateConfiguratorWithCalculatorData()` po renderowaniu kart posadowienia (linia ~3054):

```javascript
// Aktualizuj recommendation-note dla posadowienia
const foundationStep = document.querySelector('[data-step-key="posadowienie"]');
if (foundationStep) {
  const buildingType = state.meta?.building_type;
  const pumpWeight = state.selectedPump?.weight || state.selectedPump?.panasonicData?.weight || 70;
  const isApartment = buildingType === 'apartment';
  const isHeavy = pumpWeight > 65;

  // Aktualizuj section-description
  const sectionDescription = foundationStep.querySelector('.section-description');
  if (sectionDescription) {
    sectionDescription.textContent =
      'Sposób montażu jednostki zewnętrznej pompy ciepła. Rekomendujemy montaż na fundamencie betonowym — najstabilniejsza opcja z redukcją drgań.';
  }

  // Utwórz lub zaktualizuj recommendation-note
  let recommendationNote = foundationStep.querySelector('.recommendation-note');
  if (!recommendationNote) {
    recommendationNote = document.createElement('div');
    recommendationNote.className = 'recommendation-note';
    foundationStep.appendChild(recommendationNote);
  }

  let noteText = 'Wynik kalkulacji: Rekomendujemy montaż na fundamencie betonowym (w cenie).';

  if (isApartment) {
    noteText += ' Montaż na konsoli ściennej nie jest dostępny dla mieszkań.';
  } else if (isHeavy) {
    noteText += ` Uwaga: Twoja pompa ma masę powyżej 65 kg — montaż na konsoli ściennej wymaga dodatkowej analizy konstrukcyjnej.`;
  } else {
    noteText +=
      ' Montaż na konsoli ściennej jest możliwy tylko dla lżejszych pomp (do 65 kg) i wymaga dodatkowej analizy konstrukcyjnej.';
  }

  recommendationNote.innerHTML = `<p><strong>${noteText}</strong></p>`;
}
```

---

## 📋 KROK 7/9 — REDUKTOR CIŚNIENIA

### Obecny stan

- ❌ Brak elementu `.recommendation-note` w HTML
- ❌ Brak aktualizacji `.section-description` z rekomendacją

### Wymagana logika

#### `.section-description` (w headerze sekcji)

**Bazowy tekst:**

```
Reduktor chroni instalację przed zbyt wysokim ciśnieniem wody.
```

**Z rekomendacją (jeśli ciśnienie > 3 bar):**

```
Reduktor chroni instalację przed zbyt wysokim ciśnieniem wody. Rekomendujemy reduktor dla ciśnienia powyżej 3 bar — zapewnia poprawność montażu zgodnego ze sztuką oraz komfort użytkowania.
```

#### `.recommendation-note` (nowy element — dodać do HTML)

**Jeśli ciśnienie > 5 bar (wymagany):**

```
Wynik kalkulacji: Reduktor ciśnienia jest wymagany dla Twojej instalacji (ciśnienie powyżej 5 bar). Zapewnia poprawność montażu zgodnego ze sztuką oraz komfort użytkowania ciepłej wody w kranie.
```

**Jeśli ciśnienie 3-5 bar (rekomendowany):**

```
Wynik kalkulacji: Rekomendujemy reduktor ciśnienia dla Twojej instalacji (ciśnienie 3-5 bar). Zapewnia poprawność montażu zgodnego ze sztuką oraz komfort użytkowania ciepłej wody w kranie (ciśnienie robocze 3,5 bar dla zbiornika CWU).
```

**Jeśli ciśnienie < 3 bar (nie wymagany):**

```
Wynik kalkulacji: Reduktor ciśnienia nie jest wymagany dla Twojej instalacji (ciśnienie poniżej 3 bar). Możesz go dodać opcjonalnie dla dodatkowej ochrony.
```

**Jeśli brak danych o ciśnieniu:**

```
Wynik kalkulacji: Rekomendujemy reduktor ciśnienia dla większości instalacji — zapewnia poprawność montażu zgodnego ze sztuką oraz komfort użytkowania (ciśnienie robocze 3,5 bar dla zbiornika CWU).
```

### Implementacja

Aktualizacja w `populateConfiguratorWithCalculatorData()` po renderowaniu karty reduktora (linia ~3064):

```javascript
// Aktualizuj recommendation-note dla reduktora
const reducerStep = document.querySelector('[data-step-key="reduktor"]');
if (reducerStep) {
  const waterPressure = state.meta?.water_pressure || null; // Jeśli dostępne z formularza

  // Aktualizuj section-description
  const sectionDescription = reducerStep.querySelector('.section-description');
  if (sectionDescription) {
    if (waterPressure && waterPressure > 3) {
      sectionDescription.textContent =
        'Reduktor chroni instalację przed zbyt wysokim ciśnieniem wody. Rekomendujemy reduktor dla ciśnienia powyżej 3 bar — zapewnia poprawność montażu zgodnego ze sztuką oraz komfort użytkowania.';
    } else {
      sectionDescription.textContent =
        'Reduktor chroni instalację przed zbyt wysokim ciśnieniem wody.';
    }
  }

  // Utwórz lub zaktualizuj recommendation-note
  let recommendationNote = reducerStep.querySelector('.recommendation-note');
  if (!recommendationNote) {
    recommendationNote = document.createElement('div');
    recommendationNote.className = 'recommendation-note';
    reducerStep.appendChild(recommendationNote);
  }

  let noteText = '';
  if (waterPressure === null) {
    noteText =
      'Wynik kalkulacji: Rekomendujemy reduktor ciśnienia dla większości instalacji — zapewnia poprawność montażu zgodnego ze sztuką oraz komfort użytkowania (ciśnienie robocze 3,5 bar dla zbiornika CWU).';
  } else if (waterPressure > 5) {
    noteText =
      'Wynik kalkulacji: Reduktor ciśnienia jest wymagany dla Twojej instalacji (ciśnienie powyżej 5 bar). Zapewnia poprawność montażu zgodnego ze sztuką oraz komfort użytkowania ciepłej wody w kranie.';
  } else if (waterPressure >= 3) {
    noteText =
      'Wynik kalkulacji: Rekomendujemy reduktor ciśnienia dla Twojej instalacji (ciśnienie 3-5 bar). Zapewnia poprawność montażu zgodnego ze sztuką oraz komfort użytkowania ciepłej wody w kranie (ciśnienie robocze 3,5 bar dla zbiornika CWU).';
  } else {
    noteText =
      'Wynik kalkulacji: Reduktor ciśnienia nie jest wymagany dla Twojej instalacji (ciśnienie poniżej 3 bar). Możesz go dodać opcjonalnie dla dodatkowej ochrony.';
  }

  recommendationNote.innerHTML = `<p><strong>${noteText}</strong></p>`;
}
```

---

## 📋 KROK 8/9 — STACJA UZDATNIANIA WODY

### Obecny stan

- ❌ Brak elementu `.recommendation-note` w HTML
- ❌ Brak aktualizacji `.section-description` z rekomendacją

### Wymagana logika

#### `.section-description` (w headerze sekcji)

**Bazowy tekst:**

```
Ochrona instalacji przed kamieniem i korozją.
```

**Z rekomendacją:**

```
Ochrona instalacji przed kamieniem i korozją. Rekomendujemy uzdatnianie wody dla ochrony pompy ciepła, zasobnika CWU i wydłużenia żywotności instalacji.
```

#### `.recommendation-note` (nowy element — dodać do HTML)

**Zawsze rekomendowane (z rozmów ChatGPT):**

```
Wynik kalkulacji: Rekomendujemy uzdatnianie wody dla ochrony pompy ciepła, zasobnika CWU i wydłużenia żywotności instalacji. Filtracja podstawowa jest wystarczająca dla większości instalacji. Stacja kompleksowa (filtracja + zmiękczacz) jest rekomendowana dla twardej wody.
```

**Jeśli twarda woda (opcjonalnie — jeśli dostępne dane):**

```
Wynik kalkulacji: Rekomendujemy stację kompleksową (filtracja + zmiękczacz) dla Twojej instalacji — twarda woda wymaga dodatkowego uzdatniania dla ochrony pompy i zasobnika CWU.
```

### Implementacja

Aktualizacja w `populateConfiguratorWithCalculatorData()` po renderowaniu kart uzdatniania (linia ~3081):

```javascript
// Aktualizuj recommendation-note dla uzdatniania wody
const waterStep = document.querySelector('[data-step-key="woda"]');
if (waterStep) {
  const waterHardness = state.meta?.water_hardness || null; // Jeśli dostępne z formularza

  // Aktualizuj section-description
  const sectionDescription = waterStep.querySelector('.section-description');
  if (sectionDescription) {
    sectionDescription.textContent =
      'Ochrona instalacji przed kamieniem i korozją. Rekomendujemy uzdatnianie wody dla ochrony pompy ciepła, zasobnika CWU i wydłużenia żywotności instalacji.';
  }

  // Utwórz lub zaktualizuj recommendation-note
  let recommendationNote = waterStep.querySelector('.recommendation-note');
  if (!recommendationNote) {
    recommendationNote = document.createElement('div');
    recommendationNote.className = 'recommendation-note';
    waterStep.appendChild(recommendationNote);
  }

  let noteText = '';
  if (waterHardness && waterHardness > 15) {
    // Przykładowa wartość dla twardej wody
    noteText =
      'Wynik kalkulacji: Rekomendujemy stację kompleksową (filtracja + zmiękczacz) dla Twojej instalacji — twarda woda wymaga dodatkowego uzdatniania dla ochrony pompy i zasobnika CWU.';
  } else {
    noteText =
      'Wynik kalkulacji: Rekomendujemy uzdatnianie wody dla ochrony pompy ciepła, zasobnika CWU i wydłużenia żywotności instalacji. Filtracja podstawowa jest wystarczająca dla większości instalacji. Stacja kompleksowa (filtracja + zmiękczacz) jest rekomendowana dla twardej wody.';
  }

  recommendationNote.innerHTML = `<p><strong>${noteText}</strong></p>`;
}
```

---

## 🎨 Zasady ogólne dla wszystkich kroków

### 1. Ton komunikacji (z rozmów ChatGPT)

- **Jasny, ludzki, rzetelny, spokojny**
- **"Fachowo, ale nie przemądrzale"**
- **Zero technicznego żargonu**
- **2-3 zdania maksymalnie**

### 2. Struktura `.recommendation-note`

```html
<div class="recommendation-note">
  <p><strong>Wynik kalkulacji:</strong> [treść rekomendacji]</p>
</div>
```

### 3. Struktura `.section-description`

- Krótki opis funkcji komponentu
- Opcjonalnie: rekomendacja lub uzasadnienie
- Maksymalnie 2 zdania

### 4. Priorytety wyświetlania

1. **Wartości z obliczeń** (moc, pojemność, itp.)
2. **Rekomendacje** (tak/nie, rekomendowane/opcjonalne)
3. **Uzasadnienia** (krótkie, zrozumiałe)
4. **Ostrzeżenia** (jeśli wymagane)

### 5. Obsługa braku danych

- Jeśli brak wartości z obliczeń → pokaż placeholder: "Rekomendowana wartość zostanie wyświetlona po obliczeniach."
- Jeśli brak danych → pokaż ogólną rekomendację (bez konkretnych wartości)

---

## ✅ Checklist implementacji

### KROK 1 — Pompa ciepła

- [ ] Dodać aktualizację `.section-description` z rekomendowaną mocą
- [ ] Dodać aktualizację `.recommendation-note` z wartością mocy
- [ ] Przetestować dla różnych wartości mocy

### KROK 2 — Zasobnik CWU

- [x] ✅ Działa — aktualizacja `.section-description`
- [x] ✅ Działa — aktualizacja `.recommendation-note`
- [ ] Opcjonalnie: dodać informację o liczbie osób i profilu

### KROK 3 — Bufor CO

- [x] ✅ Działa — aktualizacja `.section-description`
- [x] ✅ Działa — aktualizacja `.recommendation-note`
- [ ] Opcjonalnie: dodać uzasadnienie (uzupełnienie zładu)

### KROK 4 — Cyrkulacja CWU

- [ ] Dodać element `.recommendation-note` do HTML
- [ ] Dodać aktualizację `.section-description` z rekomendacją
- [ ] Dodać aktualizację `.recommendation-note` z wynikiem kalkulacji
- [ ] Przetestować dla `recommended: true/false`

### KROK 5 — Service Cloud

- [ ] Dodać element `.recommendation-note` do HTML
- [ ] Dodać aktualizację `.section-description` z informacją "W CENIE"
- [ ] Dodać aktualizację `.recommendation-note` z informacją premium
- [ ] Przetestować dla różnych generacji pomp

### KROK 6 — Posadowienie

- [ ] Dodać element `.recommendation-note` do HTML
- [ ] Dodać aktualizację `.section-description` z rekomendacją fundamentu
- [ ] Dodać aktualizację `.recommendation-note` z uwagami (waga, mieszkanie)
- [ ] Przetestować dla różnych typów budynków i mas pomp

### KROK 7 — Reduktor ciśnienia

- [ ] Dodać element `.recommendation-note` do HTML
- [ ] Dodać aktualizację `.section-description` z rekomendacją (jeśli ciśnienie > 3 bar)
- [ ] Dodać aktualizację `.recommendation-note` z wynikiem kalkulacji
- [ ] Przetestować dla różnych wartości ciśnienia (jeśli dostępne)

### KROK 8 — Uzdatnianie wody

- [ ] Dodać element `.recommendation-note` do HTML
- [ ] Dodać aktualizację `.section-description` z rekomendacją
- [ ] Dodać aktualizację `.recommendation-note` z wynikiem kalkulacji
- [ ] Przetestować dla różnych wartości twardości wody (jeśli dostępne)

---

## 📚 Źródła

- Rozmowy ChatGPT:

  - `69461021-3850-8006-9b95-bd6bd6618dfd` — Analiza konfiguratora Panasonic
  - `69461063-7874-8006-9de1-9b10b00d255e` — Ocena oferty w konfiguratorze
  - `69461093-760c-8006-a71b-082fd7e3f0d8` — (nie udało się odczytać)
  - `694610bd-a0c0-8006-be26-2d2c812026dd` — Analiza UI/UX i psychologii sprzedaży
  - `694610f8-9ad4-8006-99dd-c0be8341f475` — Dokumentacja konfiguratora

- Kod źródłowy:
  - `main/konfigurator/configurator-unified.js` — linie 2839-3093
  - `main/konfigurator/konfigurator.html` — struktura HTML

---

**Ostatnia aktualizacja:** 2025-01-XX
**Wersja:** 1.0
**Autor:** Zordon (TOP-INSTAL Development Team)
