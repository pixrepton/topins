# Konfigurator Maszynowni TOP-INSTAL

## 📋 Spis treści

1. [Wprowadzenie](#wprowadzenie)
2. [Architektura systemu](#architektura-systemu)
3. [Silniki decyzyjne - szczegółowy opis](#silniki-decyzyjne)
4. [Dla użytkownika końcowego](#dla-użytkownika-końcowego)
5. [Dla developera](#dla-developera)
6. [API i integracja](#api-i-integracja)

---

## 🎯 Wprowadzenie

Konfigurator Maszynowni TOP-INSTAL to zaawansowany system doboru komponentów instalacji pompy ciepła. Na podstawie wyników obliczeń z kalkulatora OZC (Obliczenia Zapotrzebowania na Ciepło) automatycznie dobiera i rekomenduje:

- **Pompę ciepła** (Split lub All-in-One)
- **Zasobnik CWU** (Ciepłej Wody Użytkowej)
- **Bufor CO** (Centralnego Ogrzewania)
- **Cyrkulację CWU**
- **Service Cloud** (monitoring i diagnostyka)
- **Posadowienie jednostki zewnętrznej**
- **Reduktor ciśnienia**
- **Uzdatnianie wody**

System wykorzystuje **inteligentne silniki decyzyjne** (rules engine) oparte na normach branżowych, doświadczeniu technicznym i specyfikacjach produktów Panasonic.

---

## 🏗️ Architektura systemu

### Struktura plików

```
main/konfigurator/
├── konfigurator.html          # Główny plik HTML (ładowany do calculator.html)
├── configurator-unified.js    # Główna logika (rules engine, rendering, state)
├── configurator.css           # Style główne
├── configurator-v2-flat.css   # Style dodatkowe (v2 layout)
├── panasonic.json             # Baza danych produktów Panasonic
└── README.md                  # Ta dokumentacja
```

### Komponenty systemu

1. **State Management** (`state` object)

   - Przechowuje wybrane komponenty (`selections`)
   - Dane z kalkulatora (`meta`)
   - Wybraną pompę (`selectedPump`)
   - Ceny (`pricing`)

2. **Rules Engine** (`rulesEngine` object)

   - 10+ funkcji decyzyjnych dla każdego komponentu
   - Automatyczne obliczanie rekomendacji
   - Walidacja zgodności komponentów

3. **Rendering Engine**

   - Dynamiczne generowanie kart produktów
   - Integracja z `panasonic.json` dla danych technicznych
   - Automatyczne oznaczanie rekomendowanych opcji

4. **Pricing Engine**

   - Obliczanie cen netto/brutto
   - Sumowanie kosztów wszystkich komponentów
   - Eksport do podsumowania

5. **UI Controllers**
   - `SelectionsBarController` - sticky pasek z wybranymi komponentami
   - Nawigacja między krokami
   - Walidacja i podsumowanie

---

## ⚙️ Silniki decyzyjne - szczegółowy opis

### 1. 🔥 DOBÓR POMPY CIEPŁA

**Ekran:** KROK 1/9 - Pompa ciepła

#### Algorytm doboru

Pompa jest dobierana na podstawie **trzech kluczowych parametrów**:

1. **Moc grzewcza** (`recommended_power_kw` lub `max_heating_power` - **bez** `hot_water_power`)
2. **Typ ogrzewania** (`heating_type`: `underfloor`, `mixed`, `radiators`)
3. **Faza zasilania** (`has_three_phase`: `true`/`false`)

**Uwaga:** Moc pompy jest liczona **tylko na podstawie zapotrzebowania na ogrzewanie**, bez dodawania mocy CWU (CWU jest obsługiwane przez osobny zasobnik).

#### Tabela doboru (`pumpMatchingTable`)

System zawiera **pełną tabelę** wszystkich modeli Panasonic:

- **HIGH PERFORMANCE (HP)** - seria WC (Split) i ADC (All-in-One)
- **T-CAP** - seria WXC (Split) i AXC (All-in-One)
- **Zakresy mocy:** 3kW, 5kW, 7kW, 9kW, 12kW, 16kW
- **Fazy:** 1~ (230V) i 3~ (400V)

**Przykład dopasowania:**

```javascript
// Dla mocy 12kW, ogrzewanie podłogowe, 1-fazowe:
// Znajdzie: KIT-WC12K6E5 (Split) i KIT-ADC12K6E5 (All-in-One)

const matched = selectHeatPumps({
  max_heating_power: 12,
  hot_water_power: 0,
  heating_type: 'underfloor',
  has_three_phase: false,
});
```

#### Logika wyświetlania

1. **Split (rekomendowany)** - zawsze wyświetlany jako pierwsza karta

   - Oznaczony badge "★ REKOMENDOWANE"
   - Auto-wybrany przy inicjalizacji
   - Dane techniczne z `panasonic.json` (COP, wymiary, etc.)

2. **All-in-One (opcjonalny)** - wyświetlany jako druga karta
   - Tylko jeśli istnieje odpowiednik w `aioMap`
   - Wyłączony jeśli brak odpowiednika
   - Ma wbudowany zasobnik CWU (185L lub 260L)

#### Zależności

- **Jeśli wybrano All-in-One:**
  - Sekcja "Zasobnik CWU" jest **automatycznie wyłączona** (pompa ma wbudowany)
  - Bufor CO może być wyłączony dla małych mocy (<7kW)

#### Dane techniczne

System ładuje szczegółowe dane z `panasonic.json`:

- **COP** (Coefficient of Performance) dla A7/W35
- **Wymiary** jednostki zewnętrznej i wewnętrznej
- **Masa** (ważne dla posadowienia)
- **Czynnik chłodniczy** (R32)
- **Zakres temperatur pracy**

---

### 2. 💧 DOBÓR ZASOBNIKA CWU

**Ekran:** KROK 2/9 - Zasobnik CWU

#### Algorytm doboru

Pojemność zasobnika jest obliczana na podstawie:

1. **Liczba osób** (`hot_water_persons` lub `cwu_people`)
2. **Profil użytkowania** (`hot_water_usage` lub `cwu_profile`)
3. **Typ pompy** (Split vs All-in-One)

#### Tabela bazowa (liczba osób)

```javascript
if (persons <= 2)  recommendedCapacity = 150L
else if (persons <= 4) recommendedCapacity = 200L
else if (persons <= 6) recommendedCapacity = 250L
else recommendedCapacity = 300L
```

#### Korekty (profil użytkowania)

```javascript
if (profile === 'shower_bath') extra = +50L  // Prysznic + kąpiel
else if (profile === 'bath') extra = +100L   // Głównie kąpiel w wannie
```

#### Reguła bezpieczeństwa — kąpiel + 2+ osoby

**Dla profilu `bath` z 2+ osobami:**

- `recommendedCapacity` **musi być co najmniej 200 l**
- Reguła nadpisuje mniejsze obliczone wartości
- Zapewnia odpowiednią pojemność dla rzeczywistego użytkowania

#### Zaokrąglenie do dostępnych pojemności

System zaokrągla do najbliższej dostępnej pojemności:

- **Dostępne:** 150L, 200L, 250L, 300L, 400L, 500L

**Przykład:**

```
Liczba osób: 3
Profil: shower_bath
Obliczenie: 200L (dla 3-4 osób) + 50L (profil) = 250L
Wynik: 250L (najbliższa dostępna)
```

#### Wyłączenie sekcji

**Sekcja CWU jest automatycznie wyłączona jeśli:**

- Użytkownik wybrał **All-in-One** (pompa ma wbudowany zasobnik 185L lub 260L)
- Użytkownik nie zaznaczył "Ciepła woda użytkowa" w kalkulatorze

#### Opcje wykończenia

System wyświetla **2 karty** dla rekomendowanej pojemności:

1. **Emalia** (rekomendowana)

   - Ekonomiczne rozwiązanie
   - Sprawdzona technologia
   - Auto-wybrana

2. **Stal nierdzewna (INOX)**
   - Premium rozwiązanie
   - Maksymalna trwałość
   - Bez konieczności wymiany anody

---

### 3. 📦 DOBÓR BUFORA CO

**Ekran:** KROK 3/9 - Bufor CO

#### Algorytm doboru

Bufor CO jest dobierany na podstawie **uzupełnienia brakującego zładu wody instalacji**, zgodnie z praktyką instalacyjną i wytycznymi Panasonic Aquarea.

**Kluczowa zasada:** Bufor **NIE jest zawsze wymagany** — jest stosowany wyłącznie wtedy, gdy rzeczywisty (lub szacowany) zład instalacji nie spełnia minimalnego wymagania producenta pompy.

#### Reguła nadrzędna — pompy 3-fazowe serii K

**Dla pomp 3-fazowych (400V) o mocy 9/12/16 kW serii K:**

- **Zawsze**: `recommendedCapacity = 200 l`
- **Zawsze**: `required = true`
- **Zawsze**: `allowZeroBuffer = false`

Ta reguła ma **pierwszeństwo** nad wszystkimi innymi obliczeniami.

#### Minimalny wymagany zład wody instalacji

`capacityPerKw` oznacza **minimalny wymagany zład wody instalacji [l/kW]**, nie "bufor na kW":

```javascript
const capacityPerKw = {
  underfloor: 10, // 10 l/kW minimalny zład
  mixed: 15, // 15 l/kW minimalny zład
  radiators: 20, // 20 l/kW minimalny zład
};

requiredWaterVolume = pumpPower * capacityPerKw[heatingType];
```

**Przykład:** Pompa 12 kW z grzejnikami wymaga minimum: `12 × 20 = 240 l` zładu wody w instalacji.

#### Szacowanie zładu instalacji

System szacuje rzeczywisty zład instalacji na podstawie powierzchni:

```javascript
const systemVolumePerM2 = {
  underfloor: 1.1, // ~1.1 l/m² (duża bezwładność, więcej wody w rurach)
  mixed: 0.9, // ~0.9 l/m²
  radiators: 0.65, // ~0.65 l/m² (mniej wody w grzejnikach)
};

estimatedSystemVolume = heatedArea * systemVolumePerM2[heatingType];
```

**Przykład:** Dom 120 m² z grzejnikami: `120 × 0.65 = 78 l` szacowanego zładu.

#### Decyzja o buforze — uzupełnienie brakującego zładu

Bufor jest liczony jako **uzupełnienie różnicy** między wymaganym a szacowanym zładem:

```javascript
if (estimatedSystemVolume >= requiredWaterVolume) {
  bufferNeeded = 0; // Bufor nie wymagany
} else {
  bufferNeeded = requiredWaterVolume - estimatedSystemVolume; // Uzupełnienie
}
```

**Przykład:** Pompa 12 kW, grzejniki, 120 m²:

- Wymagany zład: `12 × 20 = 240 l`
- Szacowany zład: `120 × 0.65 = 78 l`
- Brakuje: `240 - 78 = 162 l`
- Bufor: `≈ 150 l` (najbliższa dostępna pojemność)

#### Scenariusze priorytetowe

Przed obliczaniem zładu sprawdzane są scenariusze:

1. **Podłogówka + budynek nowy (≥2015) + brak poprzedniego źródła:**

   - `recommendedCapacity = 0`, `required = false`, `allowZeroBuffer = true`
   - Pomija obliczanie zładu

2. **Mieszana:**

   - `recommendedCapacity = 100 l`, `required = false`
   - Pomija obliczanie zładu (scenariusz uproszczony)

3. **Grzejniki:**
   - `recommendedCapacity = 100 l`, `required = true`
   - Pomija obliczanie zładu (scenariusz uproszczony)

#### Zaokrąglenie do dostępnych pojemności

System zaokrągla do najbliższej dostępnej pojemności:

- **Dostępne:** 50L, 80L, 100L, 120L, 150L, 200L, 400L, 500L

#### Logika wymagalności

| Typ ogrzewania | Wymagany?                    | Min pojemność | Max pojemność | Może być 0L? |
| -------------- | ---------------------------- | ------------- | ------------- | ------------ |
| **Podłogowe**  | ❌ Nie (tylko gdy bufor > 0) | 0L            | 120L+         | ✅ Tak       |
| **Mieszane**   | ❌ Nie                       | 80L           | 200L+         | ❌ Nie       |
| **Grzejniki**  | ✅ Tak (tylko gdy bufor > 0) | 100L          | 200L+         | ❌ Nie       |

**Uwaga:** Dla grzejników `required = true` tylko gdy `recommendedCapacity > 0` (bufor jest wymagany jako uzupełnienie zładu).

#### Specjalne przypadki

1. **All-in-One < 7kW + podłogowe:**

   - Rekomendacja: **0L** (bufor nie jest wymagany)
   - Opcja "Bez bufora" jest dostępna

2. **Pompy 3-fazowe 9/12/16 kW serii K:**
   - **Zawsze**: `recommendedCapacity = 200 l`, `required = true`
   - Niezależnie od typu instalacji i zładu

#### Wyświetlane karty

System wyświetla karty w zależności od rekomendacji:

- **50L** - Kompaktowy (mniejsze instalacje)
- **80L** - Standardowy (mniejsze instalacje)
- **100L** - Standardowy (większość instalacji)
- **120L** - Standardowy (większe instalacje)
- **150L** - Duży (większe instalacje)
- **200L** - Duży (duże instalacje, pompy 3-fazowe)
- **400L** - Bardzo duży (bardzo duże instalacje)
- **500L** - Bardzo duży (bardzo duże instalacje)
- **0L** - Bez bufora (tylko dla podłogowego gdy zład wystarczający)

---

### 4. 🔄 CYRKULACJA CWU

**Ekran:** KROK 4/9 - Cyrkulacja CWU

#### Logika włączenia

Sekcja jest **włączona tylko jeśli:**

- Użytkownik zaznaczył "Ciepła woda użytkowa" w kalkulatorze
- Wybrano pompę **Split** (nie All-in-One)

#### Opcje

1. **Z cyrkulacją CWU** (Komfort)

   - Cena: **1800 PLN**
   - Czas oczekiwania: **< 3 sek**
   - Pobór mocy: **5-8 W**
   - Dla użytkowników ceniących komfort

2. **Bez cyrkulacji** (Standard) - **rekomendowane**
   - Cena: **0 PLN**
   - Czas oczekiwania: **Zależny od odległości**
   - Dla standardowych instalacji
   - **Auto-wybrane** jako domyślne

---

### 5. ☁️ SERVICE CLOUD

**Ekran:** KROK 5/9 - Service Cloud

#### Logika włączenia

Sekcja jest **włączona tylko jeśli:**

- Generacja pompy to **"K"** (High Performance K)

#### Opcje

1. **Adapter Wi-Fi** (Basic)
   - Cena: **800 PLN**
   - Monitoring i diagnostyka przez aplikację
   - **Auto-wybrany** jeśli sekcja włączona

#### Funkcjonalności

- Monitoring pracy pompy w czasie rzeczywistym
- Diagnostyka błędów
- Historia pracy
- Powiadomienia o awariach

---

### 6. 🏗️ POSADOWIENIE

**Ekran:** KROK 6/9 - Posadowienie jednostki zewnętrznej

#### Logika doboru

System sprawdza:

1. **Typ budynku** (`building_type`)
2. **Masa pompy** (`weight` z `panasonic.json`)

#### Opcje

1. **Stopa betonowa** (na gruncie) - **rekomendowana**

   - Dla wszystkich typów budynków
   - Dla wszystkich mas pomp
   - **Auto-wybrana**

2. **Wsporniki ścienne**

   - **Dozwolone tylko jeśli:**
     - `building_type !== 'apartment'` (nie mieszkanie)
     - `weight <= 65kg`
   - **Ostrzeżenie** jeśli `weight > 65kg` (możliwe, ale niezalecane)

3. **Wibroizolacja**
   - Dodatkowa opcja dla redukcji hałasu
   - Dla budynków z wymaganiami akustycznymi

---

### 7. 🔧 REDUKTOR CIŚNIENIA

**Ekran:** KROK 7/9 - Reduktor ciśnienia

#### Logika

System sprawdza **ciśnienie wody** w instalacji:

1. **Wymagany** jeśli ciśnienie > 5 bar
2. **Rekomendowany** jeśli ciśnienie 3-5 bar
3. **Nie wymagany** jeśli ciśnienie < 3 bar

#### Opcje

1. **Z reduktorem** - **rekomendowane** dla większości instalacji
2. **Bez reduktora** - tylko dla niskiego ciśnienia

---

### 8. 💧 UZDATNIANIE WODY

**Ekran:** KROK 8/9 - Uzdatnianie wody

#### Logika

System **zawsze rekomenduje** uzdatnianie wody dla:

- Ochrony pompy ciepła
- Ochrony zasobnika CWU
- Wydłużenia żywotności instalacji

#### Opcje

1. **Filtracja podstawowa** - **rekomendowana**

   - Filtr mechaniczny
   - Ochrona przed zanieczyszczeniami
   - **Auto-wybrana**

2. **Stacja kompleksowa**

   - Filtracja + zmiękczacz
   - Dla twardej wody
   - Premium rozwiązanie

3. **Bez uzdatniania**
   - Niezalecane
   - Tylko dla bardzo miękkiej wody

---

## 👤 Dla użytkownika końcowego

### Jak korzystać z konfiguratora

1. **Uruchomienie:**

   - Po zakończeniu obliczeń w kalkulatorze kliknij **"ROZPOCZNIJ PERSONALIZACJĘ"**
   - Konfigurator automatycznie załaduje wyniki z kalkulatora

2. **Nawigacja:**

   - Przechodź między krokami przyciskami **"Dalej →"** i **"Wstecz"**
   - Możesz zmieniać wybory w każdym kroku
   - **Sticky pasek u góry** pokazuje aktualnie wybrane komponenty

3. **Rekomendacje:**

   - Karty oznaczone **"★ REKOMENDOWANE"** są automatycznie wybrane
   - Możesz zmienić wybór klikając inną kartę
   - System automatycznie aktualizuje ceny i zgodność komponentów

4. **Podsumowanie:**
   - W kroku 9 zobaczysz pełne podsumowanie wybranych komponentów
   - Możesz pobrać raport PDF z konfiguracją

### Co oznaczają rekomendacje?

- **Rekomendacje są oparte na:**

  - Wynikach obliczeń OZC z kalkulatora
  - Normach branżowych (PN-B 02025, PN-EN 832)
  - Doświadczeniu technicznym TOP-INSTAL
  - Specyfikacjach produktów Panasonic

- **Możesz zmienić wybór:**
  - Wszystkie rekomendacje są sugestiami
  - Możesz wybrać inną opcję jeśli masz specyficzne wymagania
  - System automatycznie sprawdzi zgodność

### FAQ

**Q: Dlaczego nie widzę sekcji "Zasobnik CWU"?**
A: Sekcja jest wyłączona jeśli wybrałeś pompę All-in-One (ma wbudowany zasobnik).

**Q: Czy mogę wybrać bufor 0L?**
A: Tylko dla ogrzewania podłogowego + pompa All-in-One <7kW. W innych przypadkach bufor jest wymagany.

**Q: Co oznacza "Wymaga konsultacji" przy buforze 0L?**
A: Instalacja bez bufora wymaga dodatkowej analizy technicznej - skontaktuj się z doradcą.

**Q: Dlaczego niektóre karty są wyłączone (szare)?**
A: System automatycznie wyłącza opcje niezgodne z wybraną konfiguracją (np. wsporniki ścienne dla mieszkania).

---

## 👨‍💻 Dla developera

### Struktura kodu

#### 1. State Management

```javascript
const state = {
  selections: {
    pompa: { optionId: 'hp', label: 'Panasonic Aquarea Split 12kW' },
    cwu: { optionId: 'emalia-250', label: 'Emalia 250L' },
    bufor: { optionId: 'buffer-100', label: 'Bufor 100L' },
    // ...
  },
  meta: {
    // Dane z kalkulatora
    recommended_power_kw: 12,
    heating_type: 'mixed',
    hot_water_persons: 4,
    // ...
  },
  selectedPump: {
    model: 'KIT-WC12K6E5',
    power_kw: 12,
    type: 'split',
    // ...
  },
  pricing: {
    total_netto_pln: 45000,
    total_brutto_pln: 55350,
    items: [
      /* ... */
    ],
  },
};
```

#### 2. Rules Engine - jak rozszerzyć

Aby dodać nową regułę decyzyjną:

```javascript
// W rulesEngine object dodaj nową funkcję:
rulesEngine.nowaSekcja(state) {
  const param1 = state.meta?.param1;
  const param2 = state.selectedPump?.param2;

  // Logika decyzyjna
  const enabled = param1 > 0;
  const recommended = param2 === 'value';

  return {
    enabled,
    recommended,
    // inne właściwości
  };
}

// W evaluateRules() dodaj:
const nowaSekcjaRules = rulesEngine.nowaSekcja(state);
return {
  // ... istniejące
  nowaSekcjaRules,
};

// W applyRulesToUI() dodaj:
UICallbacks.setSectionEnabled('nowa-sekcja', evaluated.nowaSekcjaRules.enabled);
```

#### 3. Renderowanie kart - jak dodać nową kartę

```javascript
function renderNowaKarta(type, isRecommended = false) {
  const data = {
    typ1: {
      title: 'Opcja 1',
      description: 'Opis...',
      price: 1000,
      optionId: 'nowa-typ1',
    },
    // ...
  };

  const cardData = data[type];
  const selectedClass = isRecommended ? 'selected' : '';

  return `
    <div class="product-card ${selectedClass}" data-option-id="${cardData.optionId}">
      <div class="product-content">
        <h4 class="product-title">${cardData.title}</h4>
        <p class="product-description">${cardData.description}</p>
        <div class="product-price">
          <span class="price-value">${cardData.price.toLocaleString('pl-PL')}</span>
          <span class="price-currency">PLN</span>
        </div>
      </div>
    </div>
  `;
}
```

#### 4. Pricing Engine - jak dodać cenę

```javascript
// W calculatePrice() dodaj:
function calculateNowaSekcjaPrice(optionId) {
  const prices = {
    'nowa-typ1': 1000,
    'nowa-typ2': 2000,
  };
  return prices[optionId] || 0;
}

// W calculateTotalPrice() dodaj:
if (state.selections.nowaSekcja) {
  const price = calculateNowaSekcjaPrice(state.selections.nowaSekcja.optionId);
  total += price;
  items.push({
    label: 'Nowa sekcja',
    value: state.selections.nowaSekcja.label,
    price_netto: price,
    price_brutto: price * 1.23,
  });
}
```

#### 5. Integracja z panasonic.json

```javascript
// Załaduj bazę danych:
await loadPanasonicDB();

// Pobierz dane dla modelu:
const pumpData = getPumpDataFromDB('KIT-WC12K6E5');

// Dostępne właściwości:
pumpData.heating.A7W35_COP; // COP dla A7/W35
pumpData.dimensions.outdoor; // Wymiary jednostki zewnętrznej
pumpData.weight; // Masa
pumpData.refrigerant; // Czynnik chłodniczy
```

### Debugowanie

#### Console logs

System loguje wszystkie kluczowe operacje:

```javascript
console.log('[Configurator] 🔍 Inicjalizacja...');
console.log('[Pump Matching] Dobór pomp dla mocy 12 kW');
console.log('[Rules Engine] CWU enabled: true, recommendedCapacity: 250L');
console.log('[SelectionsBar] ✅ Sticky controller zainicjalizowany');
```

#### Globalne funkcje debugowania

```javascript
// Przelicz reguły ręcznie:
window.configuratorRecompute();

// Zobacz aktualny stan:
console.log(window.configuratorState);

// Zobacz wybrane komponenty:
console.log(window.configuratorState.selections);
```

### Testowanie

#### Testowanie rules engine

```javascript
// Symuluj dane z kalkulatora:
const testState = {
  meta: {
    recommended_power_kw: 12,
    heating_type: 'mixed',
    hot_water_persons: 4,
    hot_water_usage: 'shower_bath',
    has_three_phase: false,
  },
  selectedPump: {
    type: 'split',
    power_kw: 12,
  },
};

// Przetestuj regułę:
const cwuRules = rulesEngine.cwu(testState);
console.log('CWU Rules:', cwuRules);
// Oczekiwany wynik: { enabled: true, recommendedCapacity: 250 }
```

#### Testowanie renderowania

```javascript
// Test renderowania karty:
const cardHTML = renderCwuCard('emalia', 250, true);
console.log(cardHTML);

// Sprawdź czy zawiera rekomendację:
expect(cardHTML).toContain('badge-recommended');
expect(cardHTML).toContain('selected');
```

---

## 🔌 API i integracja

### Funkcje globalne

#### `populateConfiguratorWithCalculatorData()`

Wypełnia konfigurator danymi z kalkulatora.

```javascript
// Wywołanie automatyczne po załadowaniu konfiguratora
// Lub ręcznie:
window.populateConfiguratorWithCalculatorData();
```

**Wymagane dane z kalkulatora:**

```javascript
window.lastCalculationResult = {
  max_heating_power: 12, // kW
  hot_water_power: 0, // kW
  heating_type: 'mixed', // 'underfloor' | 'mixed' | 'radiators'
  heated_area: 150, // m²
  hot_water_persons: 4, // liczba osób
  hot_water_usage: 'shower_bath', // 'shower' | 'shower_bath' | 'bath'
  has_three_phase: false, // boolean
  building_type: 'single_house', // 'single_house' | 'semi_detached' | 'row_house' | 'apartment'
  construction_year: 2010, // rok
  include_hot_water: true, // boolean
  // ... inne parametry
};
```

#### `configuratorRecompute()`

Przelicza wszystkie reguły i aktualizuje UI.

```javascript
// Po zmianie wyboru pompy:
state.selectedPump = newPump;
window.configuratorRecompute();
```

#### `window.configuratorState`

Globalny dostęp do stanu konfiguratora.

```javascript
// Odczytaj wybrane komponenty:
const selections = window.configuratorState.selections;

// Odczytaj ceny:
const total = window.configuratorState.pricing.total_brutto_pln;
```

### Eksport danych

#### Format eksportu

```javascript
{
  selections: {
    pompa: { optionId: 'hp', label: '...', model: 'KIT-WC12K6E5' },
    cwu: { optionId: 'emalia-250', label: '...' },
    bufor: { optionId: 'buffer-100', label: '...' },
    // ...
  },
  pricing: {
    total_netto_pln: 45000,
    total_brutto_pln: 55350,
    items: [
      { label: 'Pompa ciepła', value: '...', price_netto: 25000, price_brutto: 30750 },
      // ...
    ]
  },
  meta: {
    // Dane z kalkulatora
  }
}
```

### Webhooks / Callbacks

System nie ma wbudowanych webhooków, ale możesz dodać:

```javascript
// W captureSelectionForCard():
if (typeof window.onConfiguratorSelectionChange === 'function') {
  window.onConfiguratorSelectionChange(state.selections);
}

// W calculateTotalPrice():
if (typeof window.onConfiguratorPriceChange === 'function') {
  window.onConfiguratorPriceChange(state.pricing);
}
```

---

## 📊 Przykłady obliczeń

### Przykład 1: Dom jednorodzinny, 150m², ogrzewanie mieszane

**Dane wejściowe:**

- Moc grzewcza: 10kW
- Typ: mixed
- Powierzchnia: 150m²
- CWU: 4 osoby, profil: shower_bath
- Faza: 1~ (230V)

**Wyniki:**

1. **Pompa:**

   - Rekomendowana: **KIT-WC09K6E5** (Split 9kW)
   - Alternatywa: **KIT-ADC09K6E5** (All-in-One 9kW, 185L)

2. **Zasobnik CWU:**

   - Obliczenie: 200L (4 osoby) + 50L (profil) = **250L**
   - Rekomendowana: **Emalia 250L**

3. **Bufor CO:**
   - Wymagany zład: `9 × 15 = 135 l`
   - Szacowany zład: `150 × 0.9 = 135 l`
   - Szacowany zład >= wymagany zład → **bufor = 0 l**
   - Wynik: `recommendedCapacity = 0`, `required = false`
   - **Uwaga:** W scenariuszu priorytetowym dla `mixed` → `recommendedCapacity = 100 l` (scenariusz uproszczony)

### Przykład 2: Mieszkanie, 80m², ogrzewanie podłogowe

**Dane wejściowe:**

- Moc grzewcza: 5kW
- Typ: underfloor
- Powierzchnia: 80m²
- CWU: 2 osoby, profil: shower
- Faza: 1~ (230V)

**Wyniki:**

1. **Pompa:**

   - Rekomendowana: **KIT-WC05K6E5** (Split 5kW)

2. **Zasobnik CWU:**

   - Obliczenie: 150L (2 osoby) + 0L (profil) = **150L**
   - Rekomendowana: **Emalia 150L**

3. **Bufor CO:**
   - Wymagany zład: `5 × 10 = 50 l`
   - Szacowany zład: `80 × 1.1 = 88 l`
   - Szacowany zład >= wymagany zład → **bufor = 0 l**
   - Wynik: `recommendedCapacity = 0`, `required = false`, `allowZeroBuffer = true`

---

## 🛠️ Rozwiązywanie problemów

### Problem: Konfigurator nie ładuje się

**Sprawdź:**

1. Czy `configurator-unified.js` jest załadowany?
2. Czy `#configurator-app` istnieje w DOM?
3. Sprawdź console logi: `[Configurator] 🔍 Inicjalizacja...`

### Problem: Rekomendacje są nieprawidłowe

**Sprawdź:**

1. Czy `window.lastCalculationResult` zawiera poprawne dane?
2. Czy `state.meta` jest wypełnione po `populateConfiguratorWithCalculatorData()`?
3. Wywołaj `window.configuratorRecompute()` ręcznie

### Problem: Ceny się nie aktualizują

**Sprawdź:**

1. Czy `calculatePrice()` jest wywoływane po zmianie wyboru?
2. Czy `state.selections` jest aktualizowane w `captureSelectionForCard()`?
3. Sprawdź `state.pricing` w console

### Problem: Sticky pasek nie działa

**Sprawdź:**

1. Czy `SelectionsBarController.init()` jest wywoływane?
2. Czy `#configurator-selections-bar` istnieje w DOM?
3. Sprawdź `triggerOffset` w console logach

---

## 📚 Dodatkowe zasoby

### Dokumentacja produktów Panasonic

- [Oficjalna dokumentacja techniczna](https://www.aircon.panasonic.eu/)
- `panasonic.json` - lokalna baza danych produktów

### Normy branżowe

- **PN-B 02025** - Obliczanie zapotrzebowania na ciepło
- **PN-EN 832** - Energetyczne właściwości użytkowe budynków

### Kontakt

Dla pytań technicznych dotyczących konfiguratora:

- Sprawdź kod źródłowy w `configurator-unified.js`
- Sprawdź logi w konsoli przeglądarki
- Skontaktuj się z zespołem deweloperskim TOP-INSTAL

---

---

## 🔄 Zmiany w logice (v3.1)

### Bufor CO — nowa semantyka zładu wody

**PRZED (v3.0):**

- `capacityPerKw` = "bufor na kW" → bufor zawsze liczony jako `moc × współczynnik`
- Bufor wymagany "z automatu" dla większości instalacji

**PO (v3.1):**

- `capacityPerKw` = **minimalny wymagany zład wody instalacji [l/kW]**
- Bufor = **uzupełnienie brakującego zładu** (tylko gdy `szacowany_zład < wymagany_zład`)
- Bufor domyślnie = 0 dla podłogówki (jeśli zład wystarczający)
- Reguła nadrzędna: pompy 3-fazowe 9/12/16 kW serii K → zawsze bufor 200 l

### Pompa ciepła — moc bez CWU

**PRZED:**

- Moc pompy = `max_heating_power + hot_water_power`

**PO:**

- Moc pompy = `recommended_power_kw` lub `max_heating_power` (bez `hot_water_power`)
- CWU jest obsługiwane przez osobny zasobnik, nie zwiększa mocy pompy

### CWU — reguła bezpieczeństwa

**Dodano:**

- Dla profilu `bath` z 2+ osobami: `recommendedCapacity` musi być co najmniej 200 l
- Zapewnia odpowiednią pojemność dla rzeczywistego użytkowania

### Cyrkulacja CWU — opcjonalna z rekomendacją

**PRZED:**

- Cyrkulacja auto-wybrana w niektórych przypadkach

**PO:**

- Cyrkulacja zawsze opcjonalna
- Rekomendacja: `persons >= 4` LUB `hot_water_usage === 'comfort'`

---

**Ostatnia aktualizacja:** 2025-01-XX
**Wersja:** 3.1 (semantyka zładu wody + reguła nadrzędna 3-fazowe)
**Autor:** Zordon (TOP-INSTAL Development Team)
