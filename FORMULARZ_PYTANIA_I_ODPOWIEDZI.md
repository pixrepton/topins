# 📋 LISTA PYTAŃ I ODPOWIEDZI Z FORMULARZA KALKULATORA

**Data:** 2025-01-XX
**Wersja:** Kompletna lista z warunkami widoczności + mapowania do parametrów fizycznych (U, lambda, ACH, etc.)

---

## 📊 LEGENDA - WPŁYW NA OBLICZENIA

Każda odpowiedź zawiera informację o:

- **Wartość w silniku** - jak wartość jest wysyłana do API/silnika
- **Wpływ na obliczenia** - jak wpływa na współczynniki U, lambda, ACH, powierzchnie, korekty itp.

**Parametry fizyczne:**

- **U** - współczynnik przenikania ciepła [W/(m²·K)]
- **λ (lambda)** - współczynnik przewodnictwa cieplnego [W/(m·K)]
- **ACH** - liczba wymian powietrza na godzinę [1/h]
- **η_rec (eta_rec)** - sprawność odzysku ciepła w rekuperacji [0-1]
- **ΔT** - różnica temperatur [K]
- **A** - powierzchnia [m²]

---

## 🏗️ SEKCJA 0: INFORMACJE O BUDYNKU

### 1. Jaki to rodzaj budynku? ⭐ WYMAGANE

**Pole:** `building_type`
**Typ:** Karty wyboru (4 opcje)
**Odpowiedzi:**

- `single_house` - Dom wolnostojący → **Wartość w silniku:** `"single_house"`
- `double_house` - Bliźniak → **Wartość w silniku:** `"double_house"`
- `row_house` - Szeregowiec → **Wartość w silniku:** `"row_house"`
- `apartment` - Mieszkanie → **Wartość w silniku:** `"apartment"`

**Warunki:**

- Zawsze widoczne
- Wymagane przed przejściem dalej

---

### 2. Rok budowy budynku ⭐ WYMAGANE (warunkowo)

**Pole:** `construction_year`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `2025` - 2025 (nowy / w budowie) → **Wartość w silniku:** `2025` (integer)
- `2021` - 2021–2024 → **Wartość w silniku:** `2021` (integer)
- `2011` - 2011–2020 → **Wartość w silniku:** `2011` (integer)
- `2000` - 2000–2010 → **Wartość w silniku:** `2000` (integer)
- `1990` - 1991–2000 → **Wartość w silniku:** `1990` (integer)
- `1980` - 1981–1990 → **Wartość w silniku:** `1980` (integer)
- `1970` - 1971–1980 → **Wartość w silniku:** `1970` (integer)
- `1960` - 1961–1970 → **Wartość w silniku:** `1960` (integer)
- `1950` - 1950–1960 → **Wartość w silniku:** `1950` (integer)
- `1940` - 1940–1949 → **Wartość w silniku:** `1940` (integer)
- `1939` - przed 1939 (przed II wojną) → **Wartość w silniku:** `1939` (integer)

**Warunki:**

- Widoczne gdy: `building_type` jest wybrane
- Wymagane gdy: `building_type` jest wybrane

---

### 3. Czy Twoje mieszkanie jest segmentem narożnym? ⭐ WYMAGANE (warunkowo)

**Pole:** `on_corner`
**Typ:** Karty Tak/Nie
**Odpowiedzi:**

- `yes` - Tak, segment narożny → **Wartość w silniku:** `true` (boolean)
- `no` - Nie, segment środkowy → **Wartość w silniku:** `false` (boolean)

**Warunki:**

- Widoczne gdy: `building_type === 'row_house'`
- Wymagane gdy: `building_type === 'row_house'`

---

### 4-9. Otoczenie mieszkania ⭐ WYMAGANE (warunkowo)

**Pola:** `whats_over`, `whats_under`, `whats_north`, `whats_south`, `whats_east`, `whats_west`
**Typ:** Select (dropdown)
**Odpowiedzi dla każdego:**

- `heated_room` - Ogrzewany lokal → **Wartość w silniku:** `"heated_room"` (string)
- `unheated_room` - Nieogrzewany lokal / korytarz / klatka → **Wartość w silniku:** `"unheated_room"` (string)
- `outdoor` - Świat zewnętrzny (ściana zewnętrzna / dach) → **Wartość w silniku:** `"outdoor"` (string)
- `ground` - Grunt / podłoga na gruncie (tylko dla `whats_over` i `whats_under`) → **Wartość w silniku:** `"ground"` (string)

**Warunki:**

- Widoczne gdy: `building_type === 'apartment'`
- Wymagane gdy: `building_type === 'apartment'`

**Szczegóły:**

- `whats_over` - Co znajduje się powyżej mieszkania?
- `whats_under` - Co znajduje się poniżej mieszkania?
- `whats_north` - Co znajduje się na północ od mieszkania?
- `whats_south` - Co znajduje się na południe od mieszkania?
- `whats_east` - Co znajduje się na wschód od mieszkania?
- `whats_west` - Co znajduje się na zachód od mieszkania?

---

### 10. Wybierz strefę klimatyczną budynku ⭐ WYMAGANE

**Pole:** `location_id`
**Typ:** Radio buttons
**Odpowiedzi:**

- `PL_GDANSK` - Strefa I (-16°C) → **Wartość w silniku:** `latitude: 54.3520, longitude: 18.6466` | **θ_e:** `-16°C` (temperatura projektowa zewnętrzna) | **θ_m_e:** `~8°C` (średnia temperatura miesiąca najzimniejszego)
- `PL_KUJAWSKOPOMORSKIE_BYDGOSZCZ` - Strefa II (-18°C) → **Wartość w silniku:** `latitude: 53.1235, longitude: 18.0084` | **θ_e:** `-18°C` | **θ_m_e:** `~7.5°C`
- `PL_DOLNOSLASKIE_WROCLAW` - Strefa III (-20°C) [domyślnie zaznaczone] → **Wartość w silniku:** `latitude: 51.1079, longitude: 17.0385` | **θ_e:** `-20°C` | **θ_m_e:** `7.0°C`
- `PL_STREFA_IV` - Strefa IV (-22°C) → **Wartość w silniku:** `latitude: 49.6216, longitude: 20.6970` | **θ_e:** `-22°C` | **θ_m_e:** `6.0°C`
- `PL_ZAKOPANE` - Strefa V (-24°C) → **Wartość w silniku:** `latitude: 49.2992, longitude: 19.9496` | **θ_e:** `-24°C` | **θ_m_e:** `~5.5°C`

**Wpływ na obliczenia:**

- Temperatura projektowa zewnętrzna (θ_e) wpływa na ΔT: `ΔT = indoor_temperature - θ_e`
- Niższa temperatura zewnętrzna → większe ΔT → większe straty ciepła
- Przykład: przy 21°C wewnątrz, strefa III (-20°C) daje ΔT = 41K, strefa V (-24°C) daje ΔT = 45K (o 10% więcej strat)

**Warunki:**

- Widoczne gdy: `construction_year` jest wybrane
- Zawsze wymagane

---

## 📐 SEKCJA 1: WYMIARY BUDYNKU

### 11. Jaki jest obrys budynku? ⭐ WYMAGANE

**Pole:** `building_shape`
**Typ:** Radio buttons
**Odpowiedzi:**

- `regular` - Regularny (prostokątny) → **Wartość w silniku:** `"regular"` (string, opcjonalne)
- `irregular` - Nieregularny (z wykuszami, wnękami itp.) → **Wartość w silniku:** `"irregular"` (string, wymagane gdy wybrane)

**Warunki:**

- Zawsze widoczne
- Zawsze wymagane

---

### 12. Wybierz sposób podania wymiarów ⭐ WYMAGANE (warunkowo)

**Pole:** `regular_method`
**Typ:** Radio buttons
**Odpowiedzi:**

- `dimensions` - Podam długość i szerokość budynku → **Wartość w silniku:** `building_length` (number, m) + `building_width` (number, m)
- `area` - Podam powierzchnię zabudowy w m² → **Wartość w silniku:** `floor_area` (number, m²)

**Warunki:**

- Widoczne gdy: `building_shape === 'regular'`
- Wymagane gdy: `building_shape === 'regular'`

---

### 13. Długość budynku

**Pole:** `building_length`
**Typ:** Quantity input (suwak z przyciskami +/-)
**Zakres:** min: 0, step: 0.5, domyślnie: 10 m
**Wartość w silniku:** `building_length` (number, m) - wysyłane bezpośrednio

**Warunki:**

- Widoczne gdy: `building_shape === 'regular'` AND `regular_method === 'dimensions'`
- Wymagane gdy: `building_shape === 'regular'` AND `regular_method === 'dimensions'`

---

### 14. Szerokość budynku

**Pole:** `building_width`
**Typ:** Quantity input (suwak z przyciskami +/-)
**Zakres:** min: 0, step: 0.5, domyślnie: 5 m
**Wartość w silniku:** `building_width` (number, m) - wysyłane bezpośrednio

**Warunki:**

- Widoczne gdy: `building_shape === 'regular'` AND `regular_method === 'dimensions'`
- Wymagane gdy: `building_shape === 'regular'` AND `regular_method === 'dimensions'`

---

### 15. Powierzchnia zabudowy (m²) - dla regularnego

**Pole:** `floor_area`
**Typ:** Number input
**Zakres:** step: 1
**Wartość w silniku:** `floor_area` (number, m²) - wysyłane bezpośrednio

**Warunki:**

- Widoczne gdy: `building_shape === 'regular'` AND `regular_method === 'area'`
- Wymagane gdy: `building_shape === 'regular'` AND `regular_method === 'area'`

---

### 16. Powierzchnia zabudowy (m²) - dla nieregularnego

**Pole:** `floor_area_irregular`
**Typ:** Number input
**Zakres:** step: 1

**Warunki:**

- Widoczne gdy: `building_shape === 'irregular'`
- Wymagane gdy: `building_shape === 'irregular'` AND brak `floor_perimeter`

---

### 17. Obwód budynku (m) - dla nieregularnego

**Pole:** `floor_perimeter`
**Typ:** Number input
**Zakres:** step: 0.5
**Wartość w silniku:** `floor_perimeter` (number, m) - wysyłane bezpośrednio (wymagane dla `irregular`)

**Warunki:**

- Widoczne gdy: `building_shape === 'irregular'`
- Wymagane gdy: `building_shape === 'irregular'` AND brak `floor_area_irregular`

---

### 18. Czy w budynku jest piwnica lub podpiwniczenie? ⭐ WYMAGANE

**Pole:** `has_basement`
**Typ:** Karty Tak/Nie
**Odpowiedzi:**

- `yes` - Tak → **Wartość w silniku:** `true` (boolean) | **Wpływ:** Korekta addytywna dla piwnicy (zależnie od `unheated_space_under_type`): `worst: -0.1 kW, poor: -0.2 kW, medium: -0.3 kW, great: -0.4 kW` (blended: -0.23 kW max)
- `no` - Nie → **Wartość w silniku:** `false` (boolean) | **Wpływ:** Brak korekty dla piwnicy

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy: wypełnione wymiary budynku (zależnie od kształtu)

---

### 19. Czy w budynku są balkony? ⭐ WYMAGANE

**Pole:** `has_balcony`
**Typ:** Karty Tak/Nie
**Odpowiedzi:**

- `yes` - Tak
- `no` - Nie

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy: `has_basement` jest wybrane

---

### 20. Ilość balkonów ⭐ WYMAGANE (warunkowo)

**Pole:** `number_balcony_doors`
**Typ:** Custom slider (1-6) z potwierdzeniem
**Zakres:** 1-6, domyślnie: 1
**Wartość w silniku:** `number_balcony_doors` (integer) - wysyłane bezpośrednio. Gdy `has_balcony === false` → `0`

**Wpływ na obliczenia:**

- Powierzchnia drzwi balkonowych: `A_balcony = number_balcony_doors * 2.2 m²` (domyślna powierzchnia na drzwi balkonowe)
- Całkowita powierzchnia drzwi: `A_doors = (number_doors * 2.0) + (number_balcony_doors * 2.2)`

**Warunki:**

- Widoczne gdy: `has_balcony === 'yes'`
- Wymagane gdy: `has_balcony === 'yes'`
- Wymaga potwierdzenia suwaka (bramka `balconyGateSatisfied`)

**Uwaga:** To pole blokuje dalsze pytania w sekcji 1 (bramka `balconyGateSatisfied`)

---

### 21. Ile kondygnacji ma budynek? (bez poddasza) ⭐ WYMAGANE

**Pole:** `building_floors`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `1` - Parter
- `2` - Parter + 1 piętro
- `3` - Parter + 2 piętra
- `4` - Parter + 3 piętra

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy: `balconyGateSatisfied` (czyli `has_balcony === 'no'` LUB suwak `number_balcony_doors` potwierdzony)

---

### 22. Jaki typ dachu ma budynek? ⭐ WYMAGANE

**Pole:** `building_roof`
**Typ:** Karty wyboru (3 opcje)
**Odpowiedzi:**

- `flat` - Płaski (Dach płaski) → **Wartość w silniku:** `"flat"` (string) | **Współczynnik powierzchni dachu:** `1.05` (A_roof = floor_area \* 1.05)
- `steep` - Skośny (Z poddaszem) → **Wartość w silniku:** `"steep"` (string) | **Współczynnik powierzchni dachu:** `1.25` (A_roof = floor_area \* 1.25)
- `oblique` - Skośny niski (Bez poddasza) → **Wartość w silniku:** `"oblique"` (string) | **Współczynnik powierzchni dachu:** `1.15` (A_roof = floor_area \* 1.15)

**Wpływ na obliczenia:**

- Większa powierzchnia dachu → większe straty przez dach: `Φ_roof = A_roof * U_roof * ΔT`
- Dach skośny (steep) ma największą powierzchnię, więc największe straty (przy tym samym U_roof)

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy: `balconyGateSatisfied`

---

### 23. Które kondygnacje są ogrzewane? ⭐ WYMAGANE

**Pole:** `building_heated_floors[]`
**Typ:** Checkboxy (generowane dynamicznie)
**Odpowiedzi:**

- Checkboxy dla każdej kondygnacji (1, 2, 3, 4) + poddasze (jeśli `building_roof === 'steep'`)

**Warunki:**

- Widoczne: zawsze (po wyborze `building_floors` i `building_roof`)
- Wymagane: zawsze (przynajmniej jedna kondygnacja)
- Odblokowane gdy: `balconyGateSatisfied`

---

### 24. Jakie warunki panują na poddaszu? ⭐ WYMAGANE (warunkowo)

**Pole:** `attic_access`
**Typ:** Radio buttons
**Odpowiedzi:**

- `accessible` - Jest użytkowe, z izolacją → **Wartość w silniku:** `"accessible"` (string)
- `inaccessible` - Kiepsko z izolacją - hula tam wiatr → **Wartość w silniku:** `"inaccessible"` (string)

**Warunki:**

- Widoczne gdy: `building_roof === 'steep'` AND poddasze NIE jest ogrzewane
- Wymagane gdy: widoczne
- Odblokowane gdy: widoczne AND `balconyGateSatisfied`

---

### 25. Wysokość pomieszczeń ⭐ WYMAGANE (warunkowo)

**Pole:** `floor_height`
**Typ:** Karty wyboru (4 opcje)
**Odpowiedzi:**

- `2.3` - 2,3 m (Nisko) → **Wartość w silniku:** `2.3` (number, m)
- `2.6` - 2,6 m (Standard) → **Wartość w silniku:** `2.6` (number, m)
- `3.1` - 3,1 m (Wysoko) → **Wartość w silniku:** `3.1` (number, m)
- `4.1` - 4,1 m (Bardzo wysoko) → **Wartość w silniku:** `4.1` (number, m)

**Warunki:**

- Widoczne: zawsze
- Wymagane gdy: `hasHeatedFloors` (czyli przynajmniej jedna kondygnacja ogrzewana)
- Odblokowane gdy: `balconyGateSatisfied`

---

### 26. Czy budynek ma garaż w swojej bryle? ⭐ WYMAGANE

**Pole:** `garage_type`
**Typ:** Radio buttons
**Odpowiedzi:**

- `none` - Brak garażu w bryle budynku → **Wartość w silniku:** `null` (opcjonalne pole)
- `single_unheated` - Jednostanowiskowy - nieogrzewany → **Wartość w silniku:** `"single_unheated"` (string)
- `single_heated` - Jednostanowiskowy - ogrzewany → **Wartość w silniku:** `"single_heated"` (string)
- `double_unheated` - Dwustanowiskowy - nieogrzewany → **Wartość w silniku:** `"double_unheated"` (string)
- `double_heated` - Dwustanowiskowy - ogrzewany → **Wartość w silniku:** `"double_heated"` (string)

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy: `balconyGateSatisfied`

---

## 🧱 SEKCJA 2: KONSTRUKCJA I ŚCIANY ZEWNĘTRZNE

### 27. Wybierz typ konstrukcji budynku ⭐ WYMAGANE

**Pole:** `construction_type`
**Typ:** Radio buttons
**Odpowiedzi:**

- `traditional` - Tradycyjna (murowana lub drewniana) → **Wartość w silniku:** `"traditional"` (string)
- `canadian` - Szkieletowa (dom kanadyjski) → **Wartość w silniku:** `"canadian"` (string)

**Warunki:**

- Zawsze widoczne
- Zawsze wymagane

---

### 28. Z czego wykonane są ściany zewnętrzne? ⭐ WYMAGANE (warunkowo)

**Pole:** `primary_wall_material`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `84` - Porotherm → **Wartość w silniku:** `84` (integer - ID materiału)
- `54` - Beton komórkowy (Ytong, H+H, Termalica) → **Wartość w silniku:** `54` (integer - ID materiału)
- `63` - Pustaki ceramiczne → **Wartość w silniku:** `63` (integer - ID materiału)
- `57` - Cegła pełna → **Wartość w silniku:** `57` (integer - ID materiału)
- `60` - Cegła silikatowa → **Wartość w silniku:** `60` (integer - ID materiału)
- `51` - Beton → **Wartość w silniku:** `51` (integer - ID materiału)
- `52` - Żelbet → **Wartość w silniku:** `52` (integer - ID materiału)
- `56` - Drewno iglaste → **Wartość w silniku:** `56` (integer - ID materiału)
- `55` - Drewno liściaste → **Wartość w silniku:** `55` (integer - ID materiału)
- `53` - Pustak żużlobetonowy → **Wartość w silniku:** `53` (integer - ID materiału)
- `standard` - Nie wiem - standardowe (pustak ceramiczny 25 cm) → **Wartość w silniku:** `"standard"` (string - fallback)

**Warunki:**

- Widoczne gdy: `construction_type === 'traditional'`
- Wymagane gdy: `construction_type === 'traditional'`

---

### 29. Grubość zewnętrznych ścian (łącznie z ociepleniem) ⭐ WYMAGANE

**Pole:** `wall_size`
**Typ:** Custom slider (20-80 cm) z potwierdzeniem
**Zakres:** 20-80 cm, krok: 5 cm, domyślnie: 50 cm
**Wartość w silniku:** `wall_size` (integer, cm) - wysyłane bezpośrednio (tylko gdy slider potwierdzony)

**Wpływ na obliczenia:**

- Używane do obliczenia powierzchni ścian zewnętrznych: `A_walls = wall_size` (jeśli wall_size > 0)
- Jeśli brak lub ≤ 0: `A_walls = perimeter * floor_height * heatedFloorsCount` (fallback)
- Wpływa na straty przez przenikanie: `Φ_T = Σ(U_i * A_i) * ΔT`

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy:
  - `construction_type === 'traditional'` AND `primary_wall_material` wybrane
  - LUB `construction_type === 'canadian'` (od razu)
- Wymaga potwierdzenia suwaka (bramka `wallGateSatisfied`)

**Uwaga:** To pole blokuje dalsze pytania w sekcji 2 (bramka `wallGateSatisfied`)

---

### 30. Jakim materiałem ocieplono ściany od wewnątrz? ⭐ WYMAGANE (warunkowo)

**Pole:** `internal_wall_isolation[material]`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `68` - Wełna mineralna → **Wartość w silniku:** `68` (integer - ID materiału) | **λ:** `0.040 W/(m·K)` | **U obliczane:** `U = 1 / (d/λ + 0.2)` gdzie d = grubość w metrach
- `70` - Styropian (EPS) → **Wartość w silniku:** `70` (integer - ID materiału) | **λ:** `~0.040 W/(m·K)` (szacunkowo) | **U obliczane:** z formuły R = d/λ
- `88` - Styropian grafitowy → **Wartość w silniku:** `88` (integer - ID materiału) | **λ:** `0.036 W/(m·K)` | **U obliczane:** `U = 1 / (d/0.036 + 0.2)` - lepsza izolacyjność niż standardowy EPS
- `71` - Styropian XPS (styrodur) → **Wartość w silniku:** `71` (integer - ID materiału) | **λ:** `~0.035 W/(m·K)` (szacunkowo) | **U obliczane:** z formuły R = d/λ
- `94` - Wełna drzewna → **Wartość w silniku:** `94` (integer - ID materiału) | **λ:** `~0.040 W/(m·K)` (szacunkowo) | **U obliczane:** z formuły R = d/λ
- `95` - PIR → **Wartość w silniku:** `95` (integer - ID materiału) | **λ:** `~0.023 W/(m·K)` (szacunkowo) | **U obliczane:** z formuły R = d/λ - bardzo dobra izolacyjność
- `86` - PUR natryskowy → **Wartość w silniku:** `86` (integer - ID materiału) | **λ:** `~0.025 W/(m·K)` (szacunkowo) | **U obliczane:** z formuły R = d/λ
- `101` - Multipor / inne mineralne → **Wartość w silniku:** `101` (integer - ID materiału) | **λ:** `~0.045 W/(m·K)` (szacunkowo) | **U obliczane:** z formuły R = d/λ
- `82` - Puste powietrze → **Wartość w silniku:** `82` (integer - ID materiału) | **λ:** `~0.025 W/(m·K)` (szacunkowo, z konwekcją) | **U obliczane:** z formuły R = d/λ

**Uwaga:** Dla materiałów izolacyjnych U jest obliczane z formuły: `U = 1 / (R_ins + R0)` gdzie:

- `R_ins = d / λ` (opór cieplny izolacji)
- `d` = grubość w metrach (cm / 100)
- `R0 = 0.2` (stały opór przejmowania)
- U jest ograniczone do zakresu `0.08 - 3.5 W/(m²·K)`

**Warunki:**

- Widoczne gdy: `construction_type === 'canadian'`
- Wymagane gdy: `construction_type === 'canadian'`
- Odblokowane gdy: `construction_type === 'canadian'` AND `wallGateSatisfied`

---

### 31. Grubość izolacji wewnętrznej (cm) ⭐ WYMAGANE (warunkowo)

**Pole:** `internal_wall_isolation[size]`
**Typ:** Custom slider (5-30 cm) z potwierdzeniem
**Zakres:** 5-30 cm, krok: 5 cm, domyślnie: 5 cm
**Wartość w silniku:** `internal_wall_isolation: { material: number, size: number }` - obiekt z ID materiału i grubością (cm)

**Wpływ na obliczenia:**

- Używane tylko dla konstrukcji kanadyjskiej (`construction_type === 'canadian'`)
- U_wall obliczane z formuły: `U = 1 / (d/λ + 0.2)` gdzie d = grubość w metrach
- Wpływa na straty przez ściany: `Φ_walls = A_walls * U_wall * ΔT`

**Warunki:**

- Widoczne gdy: `construction_type === 'canadian'`
- Wymagane gdy: `construction_type === 'canadian'`
- Odblokowane gdy: `construction_type === 'canadian'` AND `wallGateSatisfied` AND `internal_wall_isolation[material]` wybrane
- Wymaga potwierdzenia suwaka (bramka `internalIsolationGateSatisfied`)

**Uwaga:** To pole blokuje dalsze pytania w sekcji 2 dla konstrukcji kanadyjskiej (bramka `internalIsolationGateSatisfied`)

---

### 32. Czy ściany są zbudowane z jakiegoś dodatkowego materiału? ⭐ WYMAGANE

**Pole:** `has_secondary_wall_material`
**Typ:** Karty Tak/Nie
**Odpowiedzi:**

- `yes` - Tak
- `no` - Nie

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy:
  - `construction_type === 'traditional'` AND `wallGateSatisfied`
  - LUB `construction_type === 'canadian'` AND `internalIsolationGateSatisfied`

---

### 33. Dodatkowy materiał ścian zewnętrznych ⭐ WYMAGANE (warunkowo)

**Pole:** `secondary_wall_material`
**Typ:** Select (dropdown)
**Odpowiedzi:** (te same co `primary_wall_material`, bez opcji "standard") → **Wartość w silniku:** `secondary_wall_material` (integer - ID materiału)

**Warunki:**

- Widoczne gdy: `construction_type === 'traditional'` AND `has_secondary_wall_material === 'yes'`
- Wymagane gdy: `has_secondary_wall_material === 'yes'`

---

### 34. Czy budynek jest ocieplony z zewnętrz? ⭐ WYMAGANE

**Pole:** `has_external_isolation`
**Typ:** Karty Tak/Nie
**Odpowiedzi:**

- `yes` - Tak
- `no` - Nie

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy:
  - `construction_type === 'traditional'` AND `wallGateSatisfied`
  - LUB `construction_type === 'canadian'` AND `internalIsolationGateSatisfied`

---

### 35. Jakim materiałem ocieplono ściany zewnętrzne? ⭐ WYMAGANE (warunkowo)

**Pole:** `external_wall_isolation[material]`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `70` - Styropian (EPS) → **Wartość w silniku:** `70` (integer - ID materiału)
- `88` - Styropian grafitowy → **Wartość w silniku:** `88` (integer - ID materiału)
- `71` - Styropian XPS (styrodur) → **Wartość w silniku:** `71` (integer - ID materiału)
- `68` - Wełna mineralna → **Wartość w silniku:** `68` (integer - ID materiału)
- `94` - Wełna drzewna → **Wartość w silniku:** `94` (integer - ID materiału)
- `95` - PIR → **Wartość w silniku:** `95` (integer - ID materiału)
- `86` - PUR natryskowy → **Wartość w silniku:** `86` (integer - ID materiału)
- `101` - Multipor / inne mineralne → **Wartość w silniku:** `101` (integer - ID materiału)
- `82` - Puste powietrze → **Wartość w silniku:** `82` (integer - ID materiału)
- `standard` - Nie wiem - standardowe (styropian 15 cm) → **Wartość w silniku:** `"standard"` (string - fallback)

**Warunki:**

- Widoczne gdy: `has_external_isolation === 'yes'`
- Wymagane gdy: `has_external_isolation === 'yes'`

---

### 36. Grubość warstwy ocieplenia (cm) ⭐ WYMAGANE (warunkowo)

**Pole:** `external_wall_isolation[size]`
**Typ:** Custom slider (5-35 cm) z potwierdzeniem
**Zakres:** 5-35 cm, krok: 5 cm, domyślnie: 15 cm
**Wartość w silniku:** `external_wall_isolation: { material: number, size: number }` - obiekt z ID materiału i grubością (cm)

**Wpływ na obliczenia:**

- U_wall obliczane z formuły: `U = 1 / (d/λ + 0.2)` gdzie d = grubość w metrach
- Przykład dla styropianu grafitowego (λ=0.036): 10cm → U≈0.45, 15cm → U≈0.35, 20cm → U≈0.28
- Większa grubość → mniejsze U → mniejsze straty: `Φ_walls = A_walls * U_wall * ΔT`
- Fallback gdy brak: `U_wall = 0.6 W/(m²·K)`

**Warunki:**

- Widoczne gdy: `has_external_isolation === 'yes'`
- Wymagane gdy: `has_external_isolation === 'yes'`
- Odblokowane gdy: `has_external_isolation === 'yes'` AND `external_wall_isolation[material]` wybrane

---

## 🪟 SEKCJA 3: OKNA I DRZWI

### 37. Jakie okna są w budynku? ⭐ WYMAGANE

**Pole:** `windows_type`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `2021_triple_glass` - Nowoczesne (od 2021), - 3-szybowe → **Wartość w silniku:** `"2021_triple_glass"` (string) | **U_okno:** `0.8 W/(m²·K)` | **Korekta addytywna:** `-0.5 kW` (blended: -0.33 kW)
- `2021_double_glass` - Nowoczesne (od 2021) - 2-szybowe → **Wartość w silniku:** `"2021_double_glass"` (string) | **U_okno:** `1.0 W/(m²·K)` | **Korekta addytywna:** `-0.3 kW` (blended: -0.20 kW)
- `new_triple_glass` - Współczesne - 3-szybowe → **Wartość w silniku:** `"new_triple_glass"` (string) | **U_okno:** `0.9 W/(m²·K)` | **Korekta addytywna:** `-0.3 kW` (blended: -0.20 kW)
- `new_double_glass` - Współczesne - 2-szybowe → **Wartość w silniku:** `"new_double_glass"` (string) | **U_okno:** `1.3 W/(m²·K)` | **Korekta addytywna:** `0 kW` (baseline)
- `semi_new_double_glass` - Starsze zespolone (typowe z lat 90.) → **Wartość w silniku:** `"semi_new_double_glass"` (string) | **U_okno:** `2.0 W/(m²·K)` | **Korekta addytywna:** `+0.9 kW` (blended: +0.59 kW)
- `old_double_glass` - Stare okna 2-szybowe → **Wartość w silniku:** `"old_double_glass"` (string) | **U_okno:** `2.5 W/(m²·K)` | **Korekta addytywna:** `+1.7 kW` (blended: +1.11 kW, clamped: +1.5 kW)
- `old_single_glass` - Stare okna 1-szybowe → **Wartość w silniku:** `"old_single_glass"` (string) | **U_okno:** `2.8 W/(m²·K)` | **Korekta addytywna:** `+2.4 kW` (blended: +1.56 kW, clamped: +1.5 kW)

**Warunki:**

- Zawsze widoczne
- Zawsze wymagane

---

### 38. Ile okien znajduje się w budynku? ⭐ WYMAGANE

**Pole:** `number_windows`
**Typ:** Custom slider (4-24) z potwierdzeniem
**Zakres:** 4-24, krok: 4, domyślnie: 14
**Wartość w silniku:** `number_windows` (integer) - wysyłane bezpośrednio

**Wpływ na obliczenia:**

- Powierzchnia okien: `A_windows = number_windows * 1.6 m²` (domyślna powierzchnia na okno)
- Wpływa na straty: `Φ_windows = A_windows * U_window * ΔT`

**Warunki:**

- Widoczne: zawsze
- Wymagane gdy: `windows_type` wybrane
- Odblokowane gdy: `windows_type` wybrane
- Wymaga potwierdzenia suwaka (bramka `windowsCountGateSatisfied`)

**Uwaga:** To pole blokuje pytanie o duże okna (bramka `windowsCountGateSatisfied`)

---

### 39. Podaj ilość, jeśli budynku są duże przeszklenia (np. okna tarasowe, HS) ⭐ WYMAGANE

**Pole:** `number_huge_windows`
**Typ:** Custom slider (0-5) z potwierdzeniem
**Zakres:** 0-5, domyślnie: 0
**Wartość w silniku:** `number_huge_windows` (integer) - wysyłane bezpośrednio (domyślnie 0)

**Wpływ na obliczenia:**

- Powierzchnia dużych okien: `A_huge = number_huge_windows * 4.0 m²` (domyślna powierzchnia na duże okno)
- Całkowita powierzchnia okien: `A_windows = (number_windows * 1.6) + (number_huge_windows * 4.0)`

**Warunki:**

- Widoczne: zawsze
- Wymagane gdy: `windows_type` wybrane
- Odblokowane gdy: `windows_type` wybrane AND `windowsCountGateSatisfied`
- Wymaga potwierdzenia suwaka (bramka `hugeWindowsGateSatisfied`)

**Uwaga:** To pole blokuje pytanie o drzwi (bramka `hugeWindowsGateSatisfied`)

---

### 40. Jakie są drzwi zewnętrzne? ⭐ WYMAGANE

**Pole:** `doors_type`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `new_pvc` - Nowe PVC → **Wartość w silniku:** `"new_pvc"` (string) | **U_drzwi:** `1.3 W/(m²·K)` | **Korekta addytywna:** `0 kW` (baseline)
- `new_wooden` - Nowe drewniane → **Wartość w silniku:** `"new_wooden"` (string) | **U_drzwi:** `1.8 W/(m²·K)` | **Korekta addytywna:** `0 kW`
- `new_metal` - Nowe metalowe → **Wartość w silniku:** `"new_metal"` (string) | **U_drzwi:** `1.5 W/(m²·K)` | **Korekta addytywna:** `0 kW` (baseline)
- `old_wooden` - Stare drewniane → **Wartość w silniku:** `"old_wooden"` (string) | **U_drzwi:** `3.0 W/(m²·K)` | **Korekta addytywna:** `+0.2 kW` (blended: +0.15 kW)
- `old_metal` - Stare metalowe → **Wartość w silniku:** `"old_metal"` (string) | **U_drzwi:** `3.5 W/(m²·K)` | **Korekta addytywna:** `+0.1 kW` (blended: +0.08 kW)

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy: `hugeWindowsGateSatisfied`

---

### 41. Ile drzwi zewnętrznych (wyjść) znajduje się w budynku? ⭐ WYMAGANE

**Pole:** `number_doors`
**Typ:** Custom slider (1-4)
**Zakres:** 1-4, domyślnie: 1
**Wartość w silniku:** `number_doors` (integer) - wysyłane bezpośrednio

**Wpływ na obliczenia:**

- Powierzchnia drzwi: `A_doors = number_doors * 2.0 m²` (domyślna powierzchnia na drzwi)
- Wpływa na straty: `Φ_doors = A_doors * U_door * ΔT`

**Warunki:**

- Widoczne: zawsze
- Wymagane gdy: `doors_type` wybrane
- Odblokowane gdy: `doors_type` wybrane

---

## 🏠 SEKCJA 4: DOCIEPLENIE DACHU I PODŁOGI

### 42. Czy dach jest ocieplony? ⭐ WYMAGANE

**Pole:** `top_isolation`
**Typ:** Karty Tak/Nie
**Odpowiedzi:**

- `yes` - Tak → **Wartość w silniku:** Jeśli `yes`, to `top_isolation: { material: number, size: number }` | **U_roof:** obliczane z materiału i grubości | **Fallback gdy brak:** `U_roof = 0.3 W/(m²·K)`
- `no` - Nie → **Wartość w silniku:** Pole `top_isolation` nie jest wysyłane | **U_roof:** `0.3 W/(m²·K)` (fallback) | **Wpływ:** Większe straty przez dach

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze

**Uwaga:** Etykieta pytania zmienia się dynamicznie w zależności od typu dachu:

- Dach płaski: "Czy stropodach jest ocieplony?"
- Dach skośny z nieogrzewanym poddaszem dostępnym: "Czy strop/stropodach jest ocieplony?"
- Inne: "Czy dach jest ocieplony?"

---

### 43. Jakim materiałem ocieplono dach? ⭐ WYMAGANE (warunkowo)

**Pole:** `top_isolation[material]`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `68` - Wełna mineralna
- `70` - Styropian (EPS)
- `71` - Styropian XPS (styrodur)
- `88` - Styropian grafitowy
- `95` - PIR
- `86` - PUR natryskowy
- `94` - Wełna drzewna
- `101` - Multipor / inne mineralne
- `82` - Puste powietrze
- `standard` - Nie wiem - standardowe (wełna 20 cm)

**Warunki:**

- Widoczne gdy: `top_isolation === 'yes'`
- Wymagane gdy: `top_isolation === 'yes'`

**Uwaga:** Etykieta zmienia się dynamicznie (dach/stropodach/strop)

---

### 44. Grubość izolacji dachu (cm) ⭐ WYMAGANE (warunkowo)

**Pole:** `top_isolation[size]`
**Typ:** Custom slider (10-45 cm) z potwierdzeniem
**Zakres:** 10-45 cm, krok: 5 cm, domyślnie: 30 cm
**Wartość w silniku:** `top_isolation: { material: number, size: number }` - obiekt z ID materiału i grubością (cm)

**Wpływ na obliczenia:**

- U_roof obliczane z formuły: `U = 1 / (d/λ + 0.2)` gdzie d = grubość w metrach
- Przykład dla wełny mineralnej (λ=0.040): 20cm → U≈0.38, 30cm → U≈0.28, 40cm → U≈0.22
- Większa grubość → mniejsze U → mniejsze straty: `Φ_roof = A_roof * U_roof * ΔT`
- Fallback gdy brak: `U_roof = 0.3 W/(m²·K)`

**Warunki:**

- Widoczne gdy: `top_isolation === 'yes'`
- Wymagane gdy: `top_isolation === 'yes'`
- Odblokowane gdy: `top_isolation === 'yes'` AND `top_isolation[material]` wybrane
- Wymaga potwierdzenia suwaka (bramka `topIsolationGateSatisfied`)

**Uwaga:**

- Etykieta zmienia się dynamicznie (dach/stropodach/strop)
- To pole blokuje pytanie o izolację podłogi (bramka `topIsolationGateSatisfied`)

---

### 45. Czy podłoga jest ocieplona? ⭐ WYMAGANE

**Pole:** `bottom_isolation`
**Typ:** Karty Tak/Nie
**Odpowiedzi:**

- `yes` - Tak
- `no` - Nie

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy: `top_isolation === 'no'` LUB `topIsolationGateSatisfied`

---

### 46. Jakim materiałem ocieplono podłogę? ⭐ WYMAGANE (warunkowo)

**Pole:** `bottom_isolation[material]`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `70` - Styropian (EPS)
- `88` - Styropian grafitowy
- `71` - Styropian XPS (styrodur)
- `68` - Wełna mineralna
- `95` - PIR
- `86` - PUR natryskowy
- `101` - Multipor / inne mineralne
- `82` - Puste powietrze
- `standard` - Nie wiem - standardowe (styropian 15 cm)

**Warunki:**

- Widoczne gdy: `bottom_isolation === 'yes'`
- Wymagane gdy: `bottom_isolation === 'yes'`

---

### 47. Grubość ocieplenia podłogi (cm) ⭐ WYMAGANE (warunkowo)

**Pole:** `bottom_isolation[size]`
**Typ:** Custom slider (5-30 cm)
**Zakres:** 5-30 cm, krok: 5 cm, domyślnie: 15 cm
**Wartość w silniku:** `bottom_isolation: { material: number, size: number }` - obiekt z ID materiału i grubością (cm)

**Wpływ na obliczenia:**

- U_floor obliczane z formuły: `U = 1 / (d/λ + 0.2)` gdzie d = grubość w metrach
- Przykład dla styropianu (λ=0.040): 10cm → U≈0.50, 15cm → U≈0.40, 20cm → U≈0.33
- Większa grubość → mniejsze U → mniejsze straty: `Φ_floor = A_floor * U_floor * ΔT`
- Fallback gdy brak: `U_floor = 0.4 W/(m²·K)`

**Warunki:**

- Widoczne gdy: `bottom_isolation === 'yes'`
- Wymagane gdy: `bottom_isolation === 'yes'`
- Odblokowane gdy: `bottom_isolation === 'yes'` AND `bottom_isolation[material]` wybrane

---

## 🔥 SEKCJA 5: OGRZEWANIE I CIEPŁA WODA

### 48. Główne źródło ogrzewania ⭐ WYMAGANE

**Pole:** `source_type`
**Typ:** Select (dropdown)
**Odpowiedzi:**

- `air_to_water_hp` - Pompa ciepła powietrze-woda
- `gas` - Gaz
- `oil` - Olej
- `biomass` - Biomasa
- `district_heating` - Ciepło sieciowe

**Warunki:**

- Zawsze widoczne
- Zawsze wymagane

---

### 49. Jaka jest Twoja komfortowa temperatura? ⭐ WYMAGANE

**Pole:** `indoor_temperature`
**Typ:** Custom slider (17-25°C) z potwierdzeniem
**Zakres:** 17-25°C, krok: 1°C, domyślnie: 21°C
**Wartość w silniku:** `indoor_temperature` (number, °C) - wysyłane bezpośrednio

**Wpływ na obliczenia:**

- Różnica temperatur: `ΔT = indoor_temperature - theta_e` (gdzie theta_e to temperatura projektowa zewnętrzna, np. -20°C dla strefy III)
- Wpływ liniowy: zmiana o ±2°C powoduje zmianę rzędu ±0.25 kW w mocy szczytowej i ±1.0 MWh/rok w energii rocznej
- Wszystkie straty są proporcjonalne do ΔT: `Φ = HT * ΔT` (przenikanie) i `Φ_V = HV * ΔT * (1 - η_rec)` (wentylacja)

**Warunki:**

- Widoczne: zawsze
- Wymagane gdy: `source_type` wybrane
- Odblokowane gdy: `source_type` wybrane
- Wymaga potwierdzenia suwaka (bramka `indoorTemperatureGateSatisfied`)

**Uwaga:** To pole blokuje pytanie o wentylację (bramka `indoorTemperatureGateSatisfied`)

---

### 50. Typ wentylacji ⭐ WYMAGANE

**Pole:** `ventilation_type`
**Typ:** Karty wyboru (3 opcje)
**Odpowiedzi:**

- `natural` - Naturalna (Grawitacyjna) → **Wartość w silniku:** `"natural"` (string) | **ACH:** `0.8 1/h` | **η_rec:** `0.0` | **Korekta addytywna:** `0 kW` (baseline)
- `mechanical` - Mechaniczna (Bez rekuperacji) → **Wartość w silniku:** `"mechanical"` (string) | **ACH:** `0.6 1/h` | **η_rec:** `0.0` | **Korekta addytywna:** `0 kW`
- `mechanical_recovery` - Rekuperacja (Mechaniczna z odzyskiem) → **Wartość w silniku:** `"mechanical_recovery"` (string) | **ACH:** `0.6 1/h` | **η_rec:** `0.85` | **Korekta addytywna:** `-1.0 kW` (blended: -0.7 kW, clamped: -0.7 kW) | **Wpływ:** Zmniejsza straty wentylacyjne o 85% (formuła: `Φ_V = HV * ΔT * (1 - η_rec)`)

**Warunki:**

- Widoczne: zawsze
- Wymagane gdy: `source_type` wybrane
- Odblokowane gdy: `indoorTemperatureGateSatisfied`

---

### 51. Rodzaj ogrzewania w budynku ⭐ WYMAGANE

**Pole:** `heating_type`
**Typ:** Karty wyboru (3 opcje)
**Odpowiedzi:**

- `underfloor` - Podłogowe (Jedna strefa)
- `radiators` - Grzejniki (Kaloryfery)
- `mixed` - Mieszane (Podłoga + grzejniki)

**Warunki:**

- Widoczne: zawsze
- Wymagane gdy: `ventilation_type` wybrane
- Odblokowane gdy: `ventilation_type` wybrane

---

### 52. Czy pompa ma też podgrzewać wodę użytkową (CWU)? ⭐ WYMAGANE

**Pole:** `include_hot_water`
**Typ:** Karty Tak/Nie
**Odpowiedzi:**

- `yes` - Tak [domyślnie zaznaczone]
- `no` - Nie

**Warunki:**

- Widoczne: zawsze
- Wymagane: zawsze
- Odblokowane gdy: `heating_type` wybrane

---

### 53. Ile osób mieszka w budynku? ⭐ WYMAGANE (warunkowo)

**Pole:** `hot_water_persons`
**Typ:** Custom slider (1-8 osób) z potwierdzeniem
**Zakres:** 2-8 (etykiety: 1-2, 3, 4, 5-6, 7+), domyślnie: 4

**Warunki:**

- Widoczne gdy: `include_hot_water === 'yes'`
- Wymagane gdy: `include_hot_water === 'yes'`
- Odblokowane gdy: `include_hot_water === 'yes'`
- Wymaga potwierdzenia suwaka (bramka `hotWaterPersonsGateSatisfied`)

**Uwaga:** To pole blokuje pytanie o zużycie CWU (bramka `hotWaterPersonsGateSatisfied`)

---

### 54. Jakie jest zużycie ciepłej wody? ⭐ WYMAGANE (warunkowo)

**Pole:** `hot_water_usage`
**Typ:** Karty wyboru (3 opcje)
**Odpowiedzi:**

- `shower` - Małe (Prysznic / umywalka)
- `shower_bath` - Średnie (Prysznic + wanna) [domyślnie zaznaczone]
- `bath` - Duże (Częste kąpiele)

**Warunki:**

- Widoczne gdy: `include_hot_water === 'yes'`
- Wymagane gdy: `include_hot_water === 'yes'`
- Odblokowane gdy: `include_hot_water === 'yes'` AND `hotWaterPersonsGateSatisfied`

---

## 📊 MAPOWANIA DO PARAMETRÓW FIZYCZNYCH - SZCZEGÓŁY

### Współczynniki U (przenikania ciepła)

**Okna:**

- `2021_triple_glass`: U = 0.8 W/(m²·K)
- `2021_double_glass`: U = 1.0 W/(m²·K)
- `new_triple_glass`: U = 0.9 W/(m²·K)
- `new_double_glass`: U = 1.3 W/(m²·K) [baseline]
- `semi_new_double_glass`: U = 2.0 W/(m²·K)
- `old_double_glass`: U = 2.5 W/(m²·K)
- `old_single_glass`: U = 2.8 W/(m²·K)

**Drzwi:**

- `new_pvc`: U = 1.3 W/(m²·K) [baseline]
- `new_metal`: U = 1.5 W/(m²·K) [baseline]
- `new_wooden`: U = 1.8 W/(m²·K)
- `old_wooden`: U = 3.0 W/(m²·K)
- `old_metal`: U = 3.5 W/(m²·K)

**Izolacje (obliczane z λ i grubości):**

- Formuła: `U = 1 / (d/λ + 0.2)` gdzie d = grubość w metrach
- Przykładowe λ:
  - Wełna mineralna (68): λ = 0.040 W/(m·K)
  - Styropian grafitowy (88): λ = 0.036 W/(m·K)
  - Cegła pełna (57): λ = 0.25 W/(m·K)
- Fallback U:
  - U_wall = 0.6 W/(m²·K)
  - U_roof = 0.3 W/(m²·K)
  - U_floor = 0.4 W/(m²·K)

### Wentylacja

**Parametry:**

- `natural`: ACH = 0.8 1/h, η_rec = 0.0
- `mechanical`: ACH = 0.6 1/h, η_rec = 0.0
- `mechanical_recovery`: ACH = 0.6 1/h, η_rec = 0.85

**Obliczenia:**

- `V_dot_m3h = ACH * volume` (przepływ powietrza)
- `HV = 0.34 * V_dot_m3h` (współczynnik strat wentylacyjnych)
- `Φ_V = HV * ΔT * (1 - η_rec)` (straty wentylacyjne)
- Rekuperacja (η_rec=0.85) zmniejsza straty o 85%

### Powierzchnie (domyślne)

- Okno standardowe: 1.6 m²
- Okno duże: 4.0 m²
- Drzwi: 2.0 m²
- Drzwi balkonowe: 2.2 m²
- Dach (współczynniki):
  - Płaski: 1.05 × floor_area
  - Skośny niski: 1.15 × floor_area
  - Skośny: 1.25 × floor_area

### Korekty addytywne (Strategia A')

Korekty są dodawane do podstawowych obliczeń fizycznych:

**Okna (blend: 0.65):**

- `2021_triple_glass`: -0.5 kW → -0.33 kW
- `2021_double_glass`: -0.3 kW → -0.20 kW
- `new_triple_glass`: -0.3 kW → -0.20 kW
- `new_double_glass`: 0 kW (baseline)
- `semi_new_double_glass`: +0.9 kW → +0.59 kW
- `old_double_glass`: +1.7 kW → +1.11 kW (clamped: +1.5 kW)
- `old_single_glass`: +2.4 kW → +1.56 kW (clamped: +1.5 kW)

**Drzwi (blend: 0.75):**

- `new_pvc`, `new_metal`, `new_wooden`: 0 kW (baseline)
- `old_metal`: +0.1 kW → +0.08 kW
- `old_wooden`: +0.2 kW → +0.15 kW

**Wentylacja (blend: 0.7):**

- `natural`, `mechanical`: 0 kW
- `mechanical_recovery`: -1.0 kW → -0.7 kW (clamped: -0.7 kW)

**Piwnica (blend: 0.75, tylko gdy has_basement=true):**

- `worst`: -0.1 kW → -0.08 kW
- `poor`: -0.2 kW → -0.15 kW
- `medium`: -0.3 kW → -0.23 kW
- `great`: -0.4 kW → -0.30 kW

**Maksymalna kumulacja korekt:** ±2.5 kW (clamped)

### Współczynniki korekcyjne

- **Mostki cieplne:** multiplier = 1.10 (zwiększa straty przez przenikanie o 10%)
- **Współczynnik bezpieczeństwa:** multiplier = 1.10 (zwiększa całkowite straty o 10%)

### Formuły obliczeniowe

**Straty przez przenikanie:**

```
HT = Σ(U_i * A_i) = U_wall*A_wall + U_roof*A_roof + U_floor*A_floor + U_window*A_window + U_door*A_door
Φ_T = HT * ΔT
```

**Straty przez mostki cieplne:**

```
Φ_Ψ = Φ_T * (thermalBridgesMultiplier - 1) = Φ_T * 0.1
```

**Straty wentylacyjne:**

```
V_dot_m3h = ACH * volume
HV = 0.34 * V_dot_m3h
Φ_V = HV * ΔT * (1 - η_rec)
```

**Całkowite straty (przed korektami):**

```
Φ_base = Φ_T + Φ_V + Φ_Ψ
```

**Z korektami addytywnymi:**

```
Φ_total = (Φ_base + corrections_additive) * safetyFactor
```

---

## 📊 PODSUMOWANIE

### Statystyki:

- **Łączna liczba pytań:** 54
- **Pytania zawsze wymagane:** ~30
- **Pytania warunkowe:** ~24
- **Pytania z suwakami wymagającymi potwierdzenia:** 8
- **Bramki logiczne (gates):** 7

### Bramki logiczne (kolejność):

1. **`balconyGateSatisfied`** - Odblokowuje sekcję 1 (kondygnacje, dach, etc.)

   - Warunek: `has_balcony === 'no'` LUB suwak `number_balcony_doors` potwierdzony

2. **`wallGateSatisfied`** - Odblokowuje dalsze pytania w sekcji 2

   - Warunek: `construction_type === 'traditional'` LUB `'canadian'` AND suwak `wall_size` potwierdzony

3. **`internalIsolationGateSatisfied`** - Odblokowuje pytania dla konstrukcji kanadyjskiej

   - Warunek: `construction_type === 'canadian'` AND `internal_wall_isolation[material]` wybrane AND suwak `internal_wall_isolation[size]` potwierdzony

4. **`windowsCountGateSatisfied`** - Odblokowuje pytanie o duże okna

   - Warunek: suwak `number_windows` potwierdzony

5. **`hugeWindowsGateSatisfied`** - Odblokowuje pytanie o drzwi

   - Warunek: suwak `number_huge_windows` potwierdzony

6. **`topIsolationGateSatisfied`** - Odblokowuje pytanie o izolację podłogi

   - Warunek: `top_isolation === 'yes'` AND suwak `top_isolation[size]` potwierdzony

7. **`indoorTemperatureGateSatisfied`** - Odblokowuje pytanie o wentylację

   - Warunek: suwak `indoor_temperature` potwierdzony

8. **`hotWaterPersonsGateSatisfied`** - Odblokowuje pytanie o zużycie CWU
   - Warunek: `include_hot_water === 'yes'` AND suwak `hot_water_persons` potwierdzony

---

## 🔍 UWAGI TECHNICZNE

### Typy pól:

- **Karty wyboru** - Wizualne przyciski z ikonami/tekstem
- **Karty Tak/Nie** - Specjalne karty dla pytań binarnych
- **Select (dropdown)** - Lista rozwijana
- **Radio buttons** - Przyciski opcji
- **Number input** - Pole numeryczne
- **Quantity input** - Pole numeryczne z przyciskami +/- i suwakiem
- **Custom slider** - Własny suwak z potwierdzeniem (wymaga kliknięcia "Potwierdź")

### Pola z potwierdzeniem suwaka:

Te pola wymagają kliknięcia przycisku "Potwierdź" po ustawieniu wartości:

1. `number_balcony_doors`
2. `wall_size`
3. `internal_wall_isolation[size]`
4. `number_windows`
5. `number_huge_windows`
6. `top_isolation[size]`
7. `indoor_temperature`
8. `hot_water_persons`

### Dynamiczne etykiety:

Niektóre pytania mają etykiety zmieniające się w zależności od wcześniejszych odpowiedzi:

- `top_isolation` - zmienia się w zależności od typu dachu i ogrzewania poddasza
- Etykiety dla `top_isolation[material]` i `top_isolation[size]` również się zmieniają

---

**Koniec dokumentu**
