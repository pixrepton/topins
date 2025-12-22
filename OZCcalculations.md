Dobra, to jedziemy „silnik OZC dla ludzi”, ale tak, żebyś mógł to potem spokojnie zamienić na kod w JS / TS / PHP.
---
## 1. Co robi silnik – widok z 10 000 m

Silnik obliczeniowy ma zrobić **jedną rzecz**:

> Przyjąć kilka prostych odpowiedzi od użytkownika → „odtworzyć” budynek normowy → policzyć projektowe obciążenie cieplne Φ_HL [kW] wg logiki PN-EN 12831 (z uproszczeniami dopuszczonymi przez normę).

W uproszczeniu jego workflow to:

1. **Znormalizuj odpowiedzi użytkownika** → zbuduj wewnętrzny „model budynku” (typ, standard izolacji, kształt).
2. Na tej bazie policz:

   * **straty przez przenikanie** (ściany, dach, okna, podłoga, grunt),
   * **straty wentylacyjne** (infiltracja + wentylacja/rekuperacja),
   * **dodatki typu mostki cieplne**.
3. Zsumuj wszystko do:

   * Φ_T – straty przez przenikanie,
   * Φ_V – straty wentylacyjne,
   * Φ_G – straty do gruntu (można traktować jako część Φ_T),
   * Φ_ψ – mostki.
4. Policzyć **Φ_HL = Φ_T + Φ_V (+ ewentualna nadwyżka za przerwy w ogrzewaniu)**.
5. Wypluć:

   * **Q_HL,design [kW]** – moc potrzebna dla budynku przy temp. projektowej,
   * ewentualnie **W/m²** dla sanity-check i doboru pomp.

---

## 2. Dane wejściowe z formularza – co z nich robimy „pod maską”

### 2.1. Powierzchnia, kubatura, wysokość

**Pytania do użytkownika:**

* Powierzchnia ogrzewana [m²].
* Liczba kondygnacji / wysokość kondygnacji [m].
* (Opcjonalnie) kształt z grubsza: prostokąt / L / „bardziej rozczłonkowany”.

**Silnik z tego robi:**

* **kubaturę V** = A * h,
* **zastępczy obrys budynku** (np. prostokąt o takim A i rozsądnej proporcji boków),
* **obwód P** (potrzebny do B’ dla strat do gruntu),
* **charakterystyczny wymiar podłogi B’ = A / (0.5 * P)** – norma ISO 13370 / PN-EN 12831.

---

### 2.2. Ocieplenie ścian, dachu, podłogi

**Pytania:**

* „Jak ocieplone są ściany?” (np. brak / słabe / średnie / bardzo dobre + ewentualnie materiał i grubość).
* „Ocieplenie dachu / stropodachu?”.
* „Czy podłoga na gruncie jest ocieplona? Ile cm?”.

**Silnik robi:**

* mapuje odpowiedzi → **U_sciany, U_dach, U_podłoga [W/m²K]**:

  * np. „wełna 20 cm, nowy dom” → U_sciany ≈ 0.18–0.22,
  * „dom lata 80 bez docieplenia” → U_sciany ≈ 1.0–1.3.
* dla podłogi:

  * podstawowe U_podłogi,
  * * później zamieni na **U_equiv** (równoważny) w funkcji B’ (z tabel normowych).

Tu wchodzi **pierwsza warstwa normowych tabel** – ale Ty to schowasz w JSON-ach.

---

### 2.3. Typ dachu

**Pytania:**

* Dach: płaski / dwuspadowy / czterospadowy / „skomplikowany”.

**Silnik robi:**

* przybliża **powierzchnię dachu A_dach**:

  * np. A_dach = A_podłogi * współczynnik (1.05–1.3 zależnie od typu),
* określa, czy dach jest „nad ogrzewanym” czy np. częściowo nad nieogrzewanym poddaszem (wtedy inne bu / U_equiv).

W normie to byłoby zrobione 100% geometrycznie, Ty robisz **typologią**.

---

### 2.4. Rodzaj okien i procent przeszkleń

**Pytania:**

* „Okna: stare / nowe 2-szybowe / nowe 3-szybowe?”.
* „Czy masz duże przeszklenia (np. salon z dużymi oknami)?”.
* (Opcjonalnie) „Jaki % ścian to okna?” albo po prostu „mało / normalnie / dużo”.

**Silnik robi:**

* ustala **U_okna**:

  * stare: 2.5–2.8,
  * 2 szyby: 1.1–1.3,
  * 3 szyby: 0.7–0.9.
* szacuje **A_okien** = A_ścian_zewnętrznych * udział_procentowy,
* **A_ściany_netto** = A_ściany_brutto – A_okien.

Norma chce dokładne wymiary okien → Ty robisz uśredniony miks, który i tak jest bliższy rzeczywistości niż „projekt na czuja”.

---

### 2.5. Strefa klimatyczna

**Pytania:**

* Lokalizacja (miasto / kod pocztowy / klik na mapie) – i tak już to robisz.

**Silnik robi:**

* mapuje lokalizację → strefa klimatyczna PL,
* dobiera:

  * **θ_e** – projektowa temp. zewnętrzna (np. −20, −18, −16),
  * **θ_m,e** – średnia roczna temp. zewnętrzna (do strat do gruntu i sąsiadów).

To jest bezpośrednie użycie normowych tabel.

---

### 2.6. Rok budowy

**Pytania:**

* „Rok budowy” i opcjonalnie „czy docieplony? / termomodernizacja?”.

**Silnik robi:**

* pierwsze przybliżenie U_sciany, U_dachu, U_podłogi jeśli użytkownik nie podaje szczegółów,
* klasy szczelności (wpływ na infiltrację – n50, e).

Możesz mieć np. takie poziomy:

* <1980 – stary, wysokie U, duża infiltracja,
* 1980–2000 – średni standard,
* 2000–2017 – „WT2008 / WT2014”,
* > 2017 – WT2017 / WT2021, bardzo dobry standard.

---

### 2.7. Wentylacja i rekuperacja

**Pytania:**

* „Jaka wentylacja?”: naturalna / mechaniczna wywiewna / nawiewno-wywiewna / nawiewno-wywiewna z rekuperacją.
* „Czy masz rekuperację? Jaka klasa (typowy domowy / premium)?” → możemy domyślnie założyć np. 60% / 80%.
* Ewentualnie: „Dom raczej szczelny / normalny / nieszczelny” (jak nie mamy roku).

**Silnik robi:**

* dla wentylacji naturalnej:

  * ustala **V_min** na osobę / m² (higiena),
  * liczy infiltrację V_inf z n50, szczelności i osłonięcia (tabele → uproszczony wzór),
* dla mechanicznej:

  * ustala **V_su** – strumień nawiewu,
  * **V_ex** – strumień wywiewu,
  * efektywny strumień **V_equiv** = V_inf + (V_su + V_ex przetworzone przez η),
* z tego robi **H_V = 0,34 * V_equiv [W/K]**.

Tu możemy uprościć w stosunku do normy – o tym niżej.

---

### 2.8. Garaż, piwnica, pomieszczenia nieogrzewane

**Pytania:**

* „Czy pod domem lub obok jest nieogrzewany garaż / piwnica / strych?”.
* „Garaż w bryle / oddzielny?”.

**Silnik robi:**

* stosuje **współczynniki bu (reduction factor)** jak w normie:

  * ściana do garażu → nie pełna różnica (θ_int − θ_e), ale bu * (θ_int − θ_e),
  * podłoga nad piwnicą → inne U_equiv / bu.

Można to zrobić mega-prosto:

* brak takich pomieszczeń → ignorujemy specjalne przypadki,
* garaż / piwnica / strych → przypisujemy typ (z tabel bu).

---

### 2.9. Użycie (zamieszkanie, temperatura zadana)

**Pytania:**

* „Do jakiej temperatury chcesz ogrzać dom?” (20 / 21 / 22 / 23°C).
* Ewentualnie: „Czy sypialnie chłodniejsze?” (dla bardziej dokładnych trybów).

**Silnik robi:**

* ustala **θ_int** dla całego budynku (w trybie uproszczonym one-zone),
* używa jej do wszystkich wzorów: Δθ = θ_int − θ_e.

W wersji PRO możesz też liczyć osobne strefy: np. parter 22°C, poddasze 21°C.

---

## 3. Rdzeń obliczeń wg PN-EN 12831 – w wersji „bez bólu głowy”

Silnik potrzebuje de facto kilku bloków:

---

### 3.1. Straty przez przenikanie Φ_T

Dla **całego budynku** (jedna strefa):

1. Wyznaczasz pola przegród:

   * A_scian_zewn,
   * A_dach,
   * A_okien,
   * A_podłogi na gruncie / nad nieogrzewanym.

2. Przypisujesz U:

   * ze struktury budynku + odpowiedzi użytkownika.

3. Liczysz transmisyjne H_T (bez mostków):

   ```text
   H_T = Σ (A_k * U_k)   [W/K]
   ```

4. Straty przez przenikanie:

   ```text
   Φ_T = H_T * (θ_int − θ_e)   [W]
   ```

---

### 3.2. Straty wentylacyjne Φ_V

1. Ustal strumień powietrza efektywny V_equiv:

   * dla wentylacji naturalnej:

     ```text
     V_equiv ≈ max(V_min_higieniczne, V_inf)
     ```
   * dla mechanicznej + rekuperacji:

     ```text
     V_equiv ≈ V_inf + V_mech * (1 − η)
     ```

     gdzie η to efektywność odzysku (np. 0,6 lub 0,8).

2. Licz H_V:

   ```text
   H_V = 0,34 * V_equiv   [W/K]
   ```

3. Straty wentylacyjne:

   ```text
   Φ_V = H_V * (θ_int − θ_e)   [W]
   ```

---

### 3.3. Straty do gruntu Φ_G (część Φ_T)

Dla podłogi na gruncie:

1. Licz **B’**:

   ```text
   B' = A_podłogi / (0,5 * P)   [m]
   ```

2. Znajdź z tabel (norma / nasze JSONy) **U_equiv** dla:

   * danej izolacji podłogi (U_podłogi),
   * typu: na terenie / podpiwniczona / poziom z = 1,5 / 3 m,
   * B’.

3. **H_G = A_podłogi * U_equiv**.

4. To jest część H_T. Czyli:

   ```text
   H_T_total = H_przegrod_nad_ziemią + H_G
   ```

---

### 3.4. Mostki cieplne Φ_ψ

W naszej „ludzkiej” wersji:

* nie pytasz klienta o detale,
* przyjmujesz **proste modele**:

1. Obwód okien:

   * L_okien ≈ obwód jednego „modelowego” okna * liczba okien,
   * ψ_okno ≈ 0,04–0,06 W/mK (zależnie od standardu).

2. Naroża zewnętrzne:

   * liczba naroży ≈ 4–8 w zależności od kształtu,
   * ψ_naroże ~ −0,05 do +0,1 (często niewielka korekta – może być nawet pomijana, jeśli chcesz uprościć).

Sumarycznie:

```text
Φ_ψ = Σ (ψ_j * L_j * (θ_int − θ_e))   [W]
```

Możemy mieć to po prostu jako:

* „dom prosty” → dodaj 3–5% do Φ_T,
* „dom skomplikowany, dużo załamań i balkonów” → 5–10%.

To jest w pełni defensywne uproszczenie.

---

### 3.5. Strata całkowita i „nadwyżka mocy”

Norma rozróżnia:

* **całkowita projektowa strata ciepła** Φ_T + Φ_V,
* **projektowe obciążenie cieplne** Φ_HL = Φ_T + Φ_V + Φ_RH (nadwyżka mocy na przerwy).

Ty możesz to zrobić tak:

```text
Φ_loss = Φ_T + Φ_V + Φ_ψ   [W]
Φ_HL = Φ_loss * safety_factor
```

Gdzie:

* safety_factor ~ 1,05–1,15 w zależności od:

  * typu budynku (lekki / ciężki),
  * tego, czy klient robi nocne obniżki,
  * Twojej strategii sprzedażowej (czy chcesz dobierać pompy minimalne, czy trochę „bezpieczne”).

To jest **twój „dodatkowy parametr biznesowy”**, nie koniecznie stricte normowy.

---

## 4. Minimalny zestaw pytań, żeby silnik liczył dobrze

Jeżeli celem jest **jak najmniej pytań**, a **wynik wystarczająco normowy**, to minimalny set wygląda tak:

1. **Budynek:**

   * Powierzchnia ogrzewana [m²].
   * Liczba kondygnacji / standardowa wysokość [m].
   * Rodzaj zabudowy: wolnostojący / bliźniak / segment / mieszkanie w bloku.

2. **Konstrukcja / ocieplenie:**

   * Rok budowy.
   * Czy budynek był docieplany? (tak/nie + w przybliżeniu kiedy).
   * Jak ocieplone są ściany? (brak / średnie / bardzo dobre).
   * Jak ocieplony dach?
   * Podłoga na gruncie: brak / X cm styro/wełny.

3. **Okna:**

   * Typ okien: stare drewniane / nowe 2-szybowe / nowe 3-szybowe.
   * Orientacyjnie: mało / normalnie / dużo okien (np. 10–15 / 15–25 / 25–35% powierzchni ścian).

4. **Lokalizacja / klimat:**

   * Adres / miejscowość (mapa → strefa klimatyczna).
   * domyślnie przyjmujesz θ_int = 21–22°C, ale można dać slider.

5. **Wentylacja:**

   * Wentylacja: naturalna / mechaniczna / mechaniczna z rekuperacją.
   * Rekuperacja: standard (η≈60%) / lepsza (η≈80%).

6. **Dodatkowe:**

   * Czy jest piwnica / garaż nieogrzewany pod częścią domu?
   * Czy część domu jest nieużywana / nieogrzewana (np. poddasze)?

**I to wystarczy**, żeby:

* policzyć całą geometrię w tle,
* przypisać U wg rok+ocieplenie,
* dobrać U_eq dla gruntu,
* policzyć wentylację/infiltrację,
* dodać prosty model mostków.

---

## 5. Gdzie widzę uproszczenia względem cieplo.app (i normy) – świadome, kontrolowane

### 5.1. Geometria

* **cieplo.app** może mieć bardziej szczegółowy model geometryczny, jeżeli dostanie więcej danych (np. kilka brył).
* My: robimy **jeden modelowy prostokąt** z tej samej powierzchni i rozsądnej proporcji boków.

Efekt: różnice rzędu kilku procent w A_ścian i P.
W praktyce kompletnie akceptowalne.

---

### 5.2. Rozkład okien

* Norma chciałaby dokładne okna per ściana.
* cieplo.app ma swoje heurystyki rozkładu przeszkleń.
* My: przyjmujemy **procent szacunkowy** i typ okien.

Różnice są głównie w **udziale okien vs ściana** – wpływ na Φ nie jest dramatyczny, a Twoje UX jest nieporównywalnie lepsze.

---

### 5.3. Mostki cieplne

* Norma: ψ z tabel / obliczeń numerycznych, każdy detal.
* cieplo.app: wbudowane U_eq + korekty statystyczne.
* My: **albo proste ψ na obwodzie okien + parę naroży, albo po prostu „+X% do Φ_T”** zależnie od złożoności budynku.

To jest w pełni defensywne uproszczenie.

---

### 5.4. Wentylacja + infiltracja

* Norma ma rozbudowany mechanizm:

  * n50, osłonięcie, wysokość, liczba kondygnacji, klasy szczelności, itd.
* cieplo.app bazuje na podobnej logice.
* My:

  * łączymy rok budowy + typ okien + „szczelny / normalny / nieszczelny” → n50,
  * uproszczony wzór na V_inf,
  * rekuperacja → V_equiv = V_inf + V_mech * (1 − η).

Z punktu widzenia doboru pomp – w zupełności wystarczy.

---

### 5.5. Sąsiednie lokale / strefy

* Norma dla mieszkań / lokali bawi się w temperatury sąsiadów, średnie roczne itd.
* Ty w 99% przypadków robisz **domy jednorodzinne** → temat marginalny.
* My:

  * dla domów jednorodzinnych ignorujemy to prawie całkowicie,
  * dla segmentów/bloków dajemy prostą korektę: część ścian zewnętrznych, część „wspólnych”.

---

## 6. Co dalej mogę dla Ciebie zrobić

Następny logiczny krok (bez gadania, tylko output) to:

1. Rozrysować **strukturę danych** wewnętrznych silnika:

   * `BuildingInput`,
   * `NormalizedBuildingModel`,
   * `HeatLossResult`.

2. Rozpisać **pseudokod / flow**:

   * krok po kroku, jak z `BuildingInput` dojść do `Φ_HL`.

3. Przygotować **mapy normowe** jako struktury JSON:

   * strefy klimatyczne → θ_e, θ_m,
   * rok budowy + ocieplenie → U_sciany, U_dach, U_podłogi,
   * B’ + U_podłogi → U_equiv,
   * typ okien → U_okna,
   * typ budynku + rok → n50, infiltracja.


## 1. Architektura silnika – z czego ma się składać

Proponuję taki podział:

1. `norm-tables/` – **same dane normowe w JSON**:

   * `climate_zones.json` – θ_e, θ_m,e,
   * `u_values_envelope.json` – U dla ścian/dachu/podłogi wg roku/ocieplenia,
   * `u_values_windows.json` – U okien wg typu,
   * `ground_u_equiv.json` – U_equiv podłóg vs B’ i poziom,
   * `infiltration_profiles.json` – n50 / infiltracja wg: rok + szczelność,
   * `ventilation_profiles.json` – strumienie higieniczne, η rekuperacji,
   * (opcjonalnie) `safety_factors.json`.

2. `ozc-engine/` – logika:

   * `normalizeInput.ts` – z Twojego formularza → model normowy,
   * `geometry.ts` – liczenie pól A, obwodu P, B’, udział przeszkleń,
   * `transmission.ts` – H_T, Φ_T (ściany, dach, okna, grunt),
   * `ventilation.ts` – H_V, Φ_V (wentylacja + infiltracja + reku),
   * `thermal_bridges.ts` – Φ_ψ (prosty model),
   * `heatload.ts` – składanie do Φ_HL + safety factor,
   * `types.ts` – definicje TS.

3. `ozc-api.ts` – **pojedynczy publiczny entrypoint**:

   ```ts
   import { calculateHeatLoad } from './ozc-engine/heatload';

   export function calculateHeatLoadFromForm(formData: WycenaFormInput): HeatLoadResult { ... }
   ```

---

## 2. Typy danych – wejście, model, wynik

### 2.1. Wejście z Twojego formularza (upraszczam, ale w duchu Twojego flow)

```ts
// To jest to, co już masz z frontu (po walidacji)
export interface WycenaFormInput {
  // 1) Budynek
  heatedAreaM2: number;           // powierzchnia ogrzewana
  floors: number;                 // liczba kondygnacji
  floorHeightM?: number;          // jeśli nie ma -> założenie np. 2.7
  buildingType: 'detached' | 'semi_detached' | 'row' | 'apartment';
  buildingShape: 'simple' | 'L' | 'complex'; // do mostków i geometrii

  // 2) Lokalizacja / klimat
  city?: string;
  postalCode?: string;
  climateZoneId?: string;         // jak już masz mapowanie
  designIndoorTempC?: number;     // zadana przez usera, default 21

  // 3) Rok budowy / modernizacja
  buildYear: number;
  isThermoModernized: boolean;
  thermoYearApprox?: number;

  // 4) Ocieplenie przegród
  wallInsulationLevel: 'none' | 'weak' | 'medium' | 'good' | 'very_good';
  wallInsulationMaterial?: 'eps' | 'mineral_wool' | 'other';
  wallInsulationThicknessCm?: number;

  roofInsulationLevel: 'none' | 'weak' | 'medium' | 'good' | 'very_good';
  roofInsulationMaterial?: 'eps' | 'mineral_wool' | 'other';
  roofInsulationThicknessCm?: number;

  floorInsulationLevel: 'none' | 'weak' | 'medium' | 'good' | 'very_good';
  floorInsulationMaterial?: 'eps' | 'xps' | 'mineral_wool' | 'other';
  floorInsulationThicknessCm?: number;

  roofType: 'flat' | 'gabled' | 'hip' | 'complex';

  // 5) Okna
  windowType: 'old_single' | 'old_double' | 'modern_double' | 'modern_triple';
  glazingShare: 'low' | 'medium' | 'high'; // np. ~10 / 20 / 30% ścian

  // 6) Wentylacja
  ventilationType: 'natural' | 'mech_exhaust' | 'mech_supply_exhaust' | 'mech_with_hr';
  rekuEfficiencyLevel?: 'standard' | 'premium'; // 0.6 vs 0.8
  envelopeTightness?: 'leaky' | 'normal' | 'tight'; // jeśli nie mamy -> z roku

  // 7) Nieogrzewane sąsiedztwo
  hasUnheatedBasement: boolean;
  hasGarageInBuilding: boolean;
  hasUnheatedAttic: boolean;

  // 8) Użytkowanie / obniżki
  nightSetback?: 'none' | 'mild' | 'strong'; // do safety factor
}
```

### 2.2. Znormalizowany model budynku (to, na czym pracuje silnik)

```ts
export interface NormalizedBuildingModel {
  // Geometria
  heatedAreaM2: number;
  heatedVolumeM3: number;
  floors: number;
  floorHeightM: number;

  // Klimat
  climateZoneId: string;
  theta_e_C: number;    // projektowa zewnętrzna
  theta_m_e_C: number;  // średnia roczna
  theta_int_C: number;  // projektowa wewnętrzna

  // U (przegrody)
  U_wall: number;
  U_roof: number;
  U_floor: number;      // podstawowy
  U_window: number;

  // Powierzchnie geometryczne
  wallAreaGrossM2: number;
  wallAreaNetM2: number;
  roofAreaM2: number;
  windowAreaM2: number;
  floorOnGroundAreaM2: number;
  perimeterOnGroundM: number;
  Bprime_M: number;     // wymiar charakterystyczny podłogi

  // Grunt
  floorDepthZ_M: 0 | 1.5 | 3; // poziom posadowienia w sensie normy
  U_equiv_floor: number;      // z tabel, używany do gruntu

  // Wentylacja
  ventilationType: WycenaFormInput['ventilationType'];
  rekuEfficiency: number;     // 0..1
  n50: number;                // h-1
  V_inf_m3h: number;          // infiltracja
  V_min_m3h: number;          // higieniczny
  V_mech_m3h: number;         // mechaniczny (jeśli jest)

  // Mostki / złożoność
  thermalBridgeFactor: number; // np. 0.03–0.08 -> dodamy do Φ_T
  buildingComplexity: WycenaFormInput['buildingShape'];

  // Bezpieczeństwo
  safetyFactor: number;        // 1.05–1.15
}
```

### 2.3. Wynik silnika

```ts
export interface HeatLoadResult {
  phi_T_W: number;        // straty przez przenikanie
  phi_V_W: number;        // straty wentylacyjne
  phi_psi_W: number;      // mostki (jeśli liczone osobno)
  phi_loss_W: number;     // suma strat = T + V + psi
  phi_HL_W: number;       // projektowe obciążenie = phi_loss * safetyFactor

  phi_HL_kW: number;
  phi_HL_W_per_m2: number;

  // Dane pomocnicze (do PDF / UZASADNIENIA)
  theta_e_C: number;
  theta_int_C: number;
  climateZoneId: string;
  notes: string[];        // np. uproszczenia, założenia
}
```

---

## 3. Dane normowe jako JSON – przykłady struktur

### 3.1. Strefy klimatyczne

`norm-tables/climate_zones.json`

```json
[
  {
    "id": "PL_I",
    "cities": ["Szczecin", "Gorzów Wielkopolski", "Zielona Góra"],
    "theta_e_C": -16,
    "theta_m_e_C": 7.5
  },
  {
    "id": "PL_II",
    "cities": ["Poznań", "Warszawa", "Łódź", "Wrocław"],
    "theta_e_C": -18,
    "theta_m_e_C": 7.0
  },
  {
    "id": "PL_V",
    "cities": ["Suwałki", "Zakopane"],
    "theta_e_C": -24,
    "theta_m_e_C": 5.5
  }
]
```

W kodzie możesz mieć funkcję:

```ts
function resolveClimateZone(form: WycenaFormInput): { climateZoneId: string; theta_e: number; theta_m_e: number } { ... }
```

---

### 3.2. U dla ścian / dachów / podłogi

`norm-tables/u_values_envelope.json` (przykład ideowy)

```json
{
  "walls": [
    { "period": "<1980", "insulation": "none", "U": 1.3 },
    { "period": "<1980", "insulation": "weak", "U": 0.9 },
    { "period": "1980-2000", "insulation": "medium", "U": 0.6 },
    { "period": "2000-2017", "insulation": "good", "U": 0.25 },
    { "period": ">2017", "insulation": "very_good", "U": 0.18 }
  ],
  "roofs": [
    { "period": "<1980", "insulation": "none", "U": 1.0 },
    { "period": "<1980", "insulation": "weak", "U": 0.7 },
    { "period": "1980-2000", "insulation": "medium", "U": 0.4 },
    { "period": "2000-2017", "insulation": "good", "U": 0.18 },
    { "period": ">2017", "insulation": "very_good", "U": 0.12 }
  ],
  "floors": [
    { "period": "<1980", "insulation": "none", "U": 0.8 },
    { "period": "<1980", "insulation": "weak", "U": 0.5 },
    { "period": "1980-2000", "insulation": "medium", "U": 0.35 },
    { "period": "2000-2017", "insulation": "good", "U": 0.25 },
    { "period": ">2017", "insulation": "very_good", "U": 0.20 }
  ]
}
```

* możesz mieć korektę po grubości ocieplenia, jeśli user poda.

---

### 3.3. U dla okien

`norm-tables/u_values_windows.json`

```json
[
  { "type": "old_single", "U": 2.8 },
  { "type": "old_double", "U": 2.5 },
  { "type": "modern_double", "U": 1.2 },
  { "type": "modern_triple", "U": 0.8 }
]
```

---

### 3.4. U_equiv dla podłogi (B’, U_podłogi) – z tabel podobnych do 5.1–5.3

`norm-tables/ground_u_equiv.json` – to jest uproszczona wersja:

```json
[
  {
    "z_m": 0,
    "Ufloor_nominal": 2.0,
    "Bprime_M": 2,
    "U_equiv": 1.30
  },
  {
    "z_m": 0,
    "Ufloor_nominal": 0.5,
    "Bprime_M": 10,
    "U_equiv": 0.30
  },
  {
    "z_m": 1.5,
    "Ufloor_nominal": 0.25,
    "Bprime_M": 10,
    "U_equiv": 0.21
  }
]
```

W praktyce:

* zrobisz to jako siatkę (B’ = 2,4,6,...,20; U_floor = 2.0, 1.0, 0.5, 0.25; z = 0/1.5/3),
* w kodzie: najbliższy wpis / prosta interpolacja.

---

### 3.5. Infiltracja

`norm-tables/infiltration_profiles.json` (n50)

```json
[
  {
    "period": "<1980",
    "tightness": "leaky",
    "n50": 7.0
  },
  {
    "period": "1980-2000",
    "tightness": "normal",
    "n50": 4.0
  },
  {
    "period": ">2017",
    "tightness": "tight",
    "n50": 1.5
  }
]
```

W kodzie: z tego + wzór (w stylu normy, ale uproszczony) liczysz **V_inf_m3h** jako funkcję:

* n50,
* kubatury,
* ekspozycji (tu możesz przyjąć stałe współczynniki zależnie od: wolnostojący vs segment vs blok).

Może być wręcz:

```ts
V_inf = heatedVolumeM3 * airChangeRateInUse; // np. 0.3–0.7 h-1
```

gdzie `airChangeRateInUse` wynika z n50 + tabeli.

---

### 3.6. Wentylacja / rekuperacja

`norm-tables/ventilation_profiles.json`

```json
{
  "natural": {
    "baseAirChange_h": 0.5
  },
  "mech_exhaust": {
    "baseAirChange_h": 0.6
  },
  "mech_supply_exhaust": {
    "baseAirChange_h": 0.7
  },
  "mech_with_hr": {
    "baseAirChange_h": 0.7,
    "hrEfficiency": {
      "standard": 0.6,
      "premium": 0.8
    }
  }
}
```

---

### 3.7. Safety factor / mostki / złożoność

`norm-tables/safety_and_bridges.json`

```json
{
  "thermalBridgeFactor": {
    "simple": 0.03,
    "L": 0.05,
    "complex": 0.08
  },
  "safetyFactor": {
    "none": 1.05,
    "mild": 1.08,
    "strong": 1.12
  }
}
```

---

## 4. Algorytm – krok po kroku (pseudokod)

### 4.1. Entry point

```ts
export function calculateHeatLoadFromForm(input: WycenaFormInput): HeatLoadResult {
  const model = normalizeInputToModel(input);
  const phi_T = calculateTransmissionLoss(model);
  const phi_V = calculateVentilationLoss(model);
  const phi_psi = calculateThermalBridgeLoss(model, phi_T);

  const phi_loss = phi_T + phi_V + phi_psi;
  const phi_HL = phi_loss * model.safetyFactor;

  return {
    phi_T_W: phi_T,
    phi_V_W: phi_V,
    phi_psi_W: phi_psi,
    phi_loss_W: phi_loss,
    phi_HL_W: phi_HL,
    phi_HL_kW: phi_HL / 1000,
    phi_HL_W_per_m2: phi_HL / model.heatedAreaM2,
    theta_e_C: model.theta_e_C,
    theta_int_C: model.theta_int_C,
    climateZoneId: model.climateZoneId,
    notes: buildNotes(model)
  };
}
```

---

### 4.2. Normalizacja wejścia

```ts
function normalizeInputToModel(input: WycenaFormInput): NormalizedBuildingModel {
  const floorHeightM = input.floorHeightM ?? 2.7;
  const heatedVolumeM3 = input.heatedAreaM2 * floorHeightM * input.floors;

  const { climateZoneId, theta_e, theta_m_e } = resolveClimateZone(input);
  const theta_int = input.designIndoorTempC ?? 21;

  const U_wall = resolveUWall(input);
  const U_roof = resolveURoof(input);
  const U_floor = resolveUFloor(input);
  const U_window = resolveUWindow(input);

  const {
    wallAreaGrossM2,
    wallAreaNetM2,
    roofAreaM2,
    windowAreaM2,
    floorOnGroundAreaM2,
    perimeterOnGroundM,
    Bprime_M
  } = calculateGeometry(input, floorHeightM);

  const floorDepthZ_M = input.hasUnheatedBasement ? 1.5 : 0; // uproszczenie
  const U_equiv_floor = resolveGroundUEquiv(U_floor, Bprime_M, floorDepthZ_M);

  const { n50, V_inf_m3h } = resolveInfiltration(input, heatedVolumeM3);
  const { rekuEfficiency, V_min_m3h, V_mech_m3h } = resolveVentilation(input, heatedVolumeM3);

  const thermalBridgeFactor = resolveThermalBridgeFactor(input.buildingShape);
  const safetyFactor = resolveSafetyFactor(input.nightSetback);

  return {
    heatedAreaM2: input.heatedAreaM2,
    heatedVolumeM3,
    floors: input.floors,
    floorHeightM,

    climateZoneId,
    theta_e_C: theta_e,
    theta_m_e_C: theta_m_e,
    theta_int_C: theta_int,

    U_wall,
    U_roof,
    U_floor,
    U_window,

    wallAreaGrossM2,
    wallAreaNetM2,
    roofAreaM2,
    windowAreaM2,
    floorOnGroundAreaM2,
    perimeterOnGroundM,
    Bprime_M,

    floorDepthZ_M,
    U_equiv_floor,

    ventilationType: input.ventilationType,
    rekuEfficiency,
    n50,
    V_inf_m3h,
    V_min_m3h,
    V_mech_m3h,

    thermalBridgeFactor,
    buildingComplexity: input.buildingShape,
    safetyFactor
  };
}
```

---

### 4.3. Geometria (prosty model bryły)

```ts
function calculateGeometry(input: WycenaFormInput, floorHeightM: number) {
  const A = input.heatedAreaM2;

  // Przyjmij proporcję boków w zależności od shape
  const ratio =
    input.buildingShape === 'simple' ? 1.3 :
    input.buildingShape === 'L' ? 1.6 :
    2.0;

  const width = Math.sqrt(A / ratio);
  const length = A / width;
  const perimeter = 2 * (width + length);

  const wallAreaGross = perimeter * floorHeightM * input.floors;

  const glazingFactor =
    input.glazingShare === 'low' ? 0.1 :
    input.glazingShare === 'high' ? 0.3 : 0.2;

  const windowArea = wallAreaGross * glazingFactor;
  const wallAreaNet = wallAreaGross - windowArea;

  const roofFactor =
    input.roofType === 'flat' ? 1.05 :
    input.roofType === 'gabled' ? 1.15 :
    input.roofType === 'hip' ? 1.2 : 1.25;

  const roofArea = A * roofFactor;

  const floorArea = A; // zakładamy 1:1

  const Bprime = floorArea / (0.5 * perimeter);

  return {
    wallAreaGrossM2: wallAreaGross,
    wallAreaNetM2: wallAreaNet,
    roofAreaM2: roofArea,
    windowAreaM2: windowArea,
    floorOnGroundAreaM2: floorArea,
    perimeterOnGroundM: perimeter,
    Bprime_M: Bprime
  };
}
```

---

### 4.4. Straty przez przenikanie Φ_T

```ts
function calculateTransmissionLoss(m: NormalizedBuildingModel): number {
  const dTheta = m.theta_int_C - m.theta_e_C;

  // Ściany nadziemne
  const HT_walls = m.wallAreaNetM2 * m.U_wall;
  const HT_roof = m.roofAreaM2 * m.U_roof;
  const HT_windows = m.windowAreaM2 * m.U_window;
  const HT_ground = m.floorOnGroundAreaM2 * m.U_equiv_floor;

  const HT_total = HT_walls + HT_roof + HT_windows + HT_ground;

  return HT_total * dTheta; // [W]
}
```

---

### 4.5. Straty wentylacyjne Φ_V

```ts
function calculateVentilationLoss(m: NormalizedBuildingModel): number {
  const dTheta = m.theta_int_C - m.theta_e_C;

  // W uproszczeniu:
  // - V_equiv = max(V_min, V_inf) dla naturalnej
  // - V_equiv = V_inf + V_mech * (1 - η) dla reku
  let V_equiv = 0;

  switch (m.ventilationType) {
    case 'natural':
      V_equiv = Math.max(m.V_min_m3h, m.V_inf_m3h);
      break;
    case 'mech_exhaust':
    case 'mech_supply_exhaust':
      V_equiv = m.V_inf_m3h + m.V_mech_m3h; // brak odzysku
      break;
    case 'mech_with_hr':
      V_equiv = m.V_inf_m3h + m.V_mech_m3h * (1 - m.rekuEfficiency);
      break;
  }

  const HV = 0.34 * V_equiv; // [W/K]

  return HV * dTheta;
}
```

---

### 4.6. Mostki cieplne Φ_ψ (wersja „% od T”)

```ts
function calculateThermalBridgeLoss(
  m: NormalizedBuildingModel,
  phi_T_W: number
): number {
  return phi_T_W * m.thermalBridgeFactor; // np. 3–8%
}
```

---

### 4.7. Safety factor

```ts
function resolveSafetyFactor(setback: WycenaFormInput['nightSetback'] = 'none'): number {
  switch (setback) {
    case 'none':
      return 1.05;
    case 'mild':
      return 1.08;
    case 'strong':
      return 1.12;
  }
}
```

---

## 5. Podsumowanie – co konkretnie masz „na talerzu”

1. **Strukturę modułów** – jak to fizycznie poukładać w pluginie / bundle.
2. **TS-owe typy**:

   * `WycenaFormInput` – mapujesz 1:1 z Twojego formularza,
   * `NormalizedBuildingModel` – wewnętrzny model normowy,
   * `HeatLoadResult` – wynik do wykorzystania w:

     * doborze pomp,
     * PDF,
     * sliderze wyników.
3. **Struktury JSON** pod normy:

   * klimat,
   * U przegród,
   * U okien,
   * U_equiv gruntu,
   * infiltracja,
   * wentylacja,
   * mostki i safety factor.
4. **Pseudokod / funkcje**, które Cursorowi możesz kazać od razu zamienić na:

   * `ozc-engine.ts` / `ozc-engine/index.ts`,
   * plus testy do sanity-check (np. porównanie z cieplo.app na kilku case’ach).






# ✅ Co MUSIMY dodać, żeby Cursor napisał silnik bez błędów

### 1. **Dokładna struktura plików** (foldery + nazwy)

Bo bez tego Cursor zacznie improwizować.

### 2. **Opis funkcji publicznych**

Czyli: jaka funkcja jest “główną”, jaki input, jaki output.

### 3. **Specyfikacja uproszczeń** — żebys nie próbował wracać do pełnej normy.

* **nie liczy pomieszczeń**,
* **nie liczy przegród pojedynczo**,
* **nie liczy strat do sąsiadów**,
* **nie liczy przepływu ciepła dynamicznie**,
* **nie liczy Htr,tot pomieszczeniami**,
* **nie robi B’ dla segmentów podzielonych**,
* **nie robi infiltracji pełną PN-EN metodą**.

Gdy to damy, nie odejdzie od naszej wersji uproszczonej.

### 4. **Zakres odpowiedzialności silnika**

Musimy dopisać:
✔ czego *nie robi* silnik (np. nie oblicza sezonowego zapotrzebowania).
✔ czego *nie bierze pod uwagę*, mimo że norma to przewiduje.

### 5. **Test cases**

Cursor bez testów będzie uważał projekt za niekompletny.

---

# ✅ Czy dane, które mamy, wystarczą?

Tak — **to pełny komplet do stworzenia silnika OZC v1.0 (uproszczonego, zgodnego koncepcyjnie z 12831, wystarczającego do doboru pomp)**.

Twoje obecne dane pokrywają:

## ✔ Geometrię budynku

– powierzchnia
– wysokość
– liczba kondygnacji
– kształt
– procent okien

## ✔ Ocieplenie

– ściany
– dach
– podłoga
– okna

## ✔ Klimat

– strefa klimatyczna
– temp. obliczeniowa

## ✔ Wentylacja

– naturalna
– mech
– mech + reku
– infiltracja

## ✔ Grunt

– B’
– U_equiv

## ✔ Mostki

– prosty współczynnik

## ✔ Safety factor

## ✔ Dane wynikowe, które wyjdą z silnika

– Φ_T
– Φ_V
– Φ_ψ
– Φ_HL

## 2) **JSON-y z danymi normowymi**

Cursor potrzebuje *przynajmniej szkicowych* tabel:

* `climate_zones.json`
* `u_values_envelope.json`
* `u_values_windows.json`
* `ground_u_equiv.json`
* `infiltration_profiles.json`
* `ventilation_profiles.json`
* `safety_and_bridges.json`


---

## 0. Założenia filozofii silnika

* **Poziom obliczeń:** *budynek jako całość*, nie pomieszczenia.
* **Cel:** dobrać *moc pompy ciepła / źródła ciepła* + ładne dane do PDF.
* **Norma:** inspirowane PN-EN 12831, ale z **świadomymi uproszczeniami**:

  * uśrednione przegrody,
  * uproszczone mostki cieplne,
  * uproszczone straty do gruntu z U_equiv,
  * wentylacja + infiltracja uproszczona,
  * “sąsiad” → opcjonalnie stałe 16°C.
* **Wejście:** dane z Twojego formularza / cieplo.app-mindset, ale wstępnie przeliczone na:

  * **powierzchnie przegród**,
  * **typ izolacji / rok budowy**,
  * **wentylacja**,
  * **strefa klimatyczna**,
  * **kubatura**.
* **Wyjście:**

  * obciążenie cieplne budynku Φ_HL [W, kW],
  * Φ_T (przenikanie), Φ_V (wentylacja), Φ_G (grunt), Φ_ψ (mostki),
  * zestaw pośrednich współczynników (HT, HV),
  * tagi/komentarze jakościowe (“budynek słabo/średnio/dobrze ocieplony”).

---

# 1. Struktura katalogów

Proponuję taki moduł do wklejenia w plugin:

```text
wp-content/plugins/wycena-2025/
└── engine/
    └── ozc/
        ├── README_OZC_ENGINE.md
        ├── src/
        │   ├── ozc-engine.ts
        │   ├── types.ts
        │   ├── geometry.ts
        │   ├── u-values.ts
        │   ├── ground-loss.ts
        │   ├── ventilation.ts
        │   ├── thermal-bridges.ts
        │   └── safety.ts
        ├── data/
        │   ├── climate_zones.json
        │   ├── u_values_envelope.json
        │   ├── u_values_windows.json
        │   ├── ground_u_equiv.json
        │   ├── infiltration_profiles.json
        │   ├── ventilation_profiles.json
        │   └── safety_and_bridges.json
        └── tests/
            └── ozc-engine.test.ts
```

---

# 2. README_OZC_ENGINE.md (gotowiec dla Cursora)

````markdown
# OZC Engine v1.0 – uproszczony silnik obliczeniowy wg PN-EN 12831 (building-level)

## Cel

Silnik liczy **projektowe obciążenie cieplne budynku jednorodzinnego lub małego budynku** na potrzeby:
- doboru pompy ciepła / źródła ciepła,
- generowania raportu do PDF.

Nie liczymy pomieszczeń, grzejników, rur, ani sezonowego zapotrzebowania. Tylko **moc szczytową** budynku jako całości.

## Główna funkcja

```ts
import { OzceInput, OzceResult } from "./types";

export function computeHeatLoad(input: OzceInput): OzceResult
````

* `input` – dane zebrane z formularza frontendowego (lub pośrednio z cieplo.app), w formacie opisanym w `types.ts`.
* `result` – pełny zestaw wyników, który można:

  * pokazać w UI,
  * serializować do JSON,
  * wykorzystać w PDF.

## Zakres obliczeń

Silnik liczy:

1. **Temperatury:**

   * dobiera temperaturę zewnętrzną θ_e i średnią roczną θ_m,e z `data/climate_zones.json` na podstawie `climateZoneId`,
   * używa zadanej temperatury wewnętrznej `thetaInt` (np. 20°C).

2. **Straty przez przenikanie Φ_T:**

   * ściany zewnętrzne, dach, podłoga na gruncie, okna, drzwi, strop nad/ pod nieogrzewanym,
   * korzysta z:

     * `data/u_values_envelope.json`,
     * `data/u_values_windows.json`,
   * liczy współczynnik HT jako sumę `U * A` (z korektą na grunt / przestrzeń nieogrzewaną).

3. **Straty do gruntu Φ_G:**

   * liczy wymiar charakterystyczny B' = A_floor / (0.5 * P_footprint),
   * dobiera `U_equiv` z `data/ground_u_equiv.json`,
   * liczy:

     * fg1 = 1.45,
     * fg2 = (θ_int - θ_m,e) / (θ_int - θ_e),
     * Gw z `ground_u_equiv.json` (1.0 lub 1.15),
   * HT_g = fg1 * fg2 * Gw * U_equiv * A_floor.

4. **Straty przez przestrzenie nieogrzewane Φ_u (opcjonalnie):**

   * korzysta z redukcji temperatury `b_u` na podstawie typu przestrzeni (garaż, strych),
   * `b_u` z `safety_and_bridges.json` (sekcja `unheatedSpaces`),
   * HT_u = Σ (U * A * b_u).

5. **Straty do sąsiada (opcjonalne, uproszczone):**

   * jeżeli `neighbor` jest aktywny, przyjmuje temp. sąsiada jako:

     * albo średnia (θ_int + θ_m,e)/2,
     * albo minimalnie 16°C,
   * liczy HT_neighbor = Σ(U * A * f_ij),
   * domyślnie **nie wlicza tego do obciążenia całego budynku**, tylko opcjonalnie do `debug`.

6. **Wentylacja Φ_V:**

   * na podstawie:

     * `ventilation.type` – `"natural" | "mechanical" | "mechanical_with_HR"`,
     * kubatury `volume`,
     * szczelności `infiltrationClass` (`tight | medium | leaky`),
   * używa:

     * `data/infiltration_profiles.json` (n50 / ACH),
     * `data/ventilation_profiles.json` (min ACH higieniczne i typowe przepływy),
   * liczy:

     * V_inf = ACH_inf * volume,
     * V_hyg = ACH_hyg * volume,
     * V_eff:

       * natural: `V_eff = max(V_inf, V_hyg)`,
       * mech bez odzysku: `V_eff = max(V_mech, V_hyg)`,
       * mech z odzyskiem: `V_eff = (1 - eta_HR) * max(V_mech, V_hyg)`,
     * HV = 0.34 * V_eff (W/K),
     * Φ_V = HV * (θ_int - θ_e).

7. **Mostki cieplne Φ_ψ:**

   * uproszczone podejście:

     * albo globalny procent `psiPercent` (np. 5–10% strat przez przenikanie),
     * albo globalny dodany współczynnik ΔU_tb na przegrody (metoda uproszczona),
   * używa danych z `safety_and_bridges.json`.

8. **Nadwyżka mocy / safety-factor:**

   * zamiast pełnego Φ_RH,i, stosujemy:

     * globalny współczynnik bezpieczeństwa `safetyFactor` (np. 0.1–0.15),
     * albo progi minimalnej mocy z `safety_and_bridges.json` (dla bardzo starych/zimnych budynków),
   * Φ_HL = (Φ_T + Φ_G + Φ_u + Φ_V + Φ_ψ) * (1 + safetyFactor).

## Świadome uproszczenia vs PN-EN 12831

Świadomie NIE robimy:

* metod pomieszczeniowych,
* pełnego liczenia mostków cieplnych z katalogu detali,
* dynamicznych efektów nagrzewania po obniżeniu temperatury (Φ_RH),
* dokładnego rozkładu infiltracji po elewacjach,
* obciążenia cieplnego pojedynczych lokali w budynku wielorodzinnym.

Ten silnik ma być:

* **szybki, deterministyczny, prosty w utrzymaniu,**
* wystarczająco dokładny do:

  * doboru pompy,
  * raportu dla klienta.

## Dane wejściowe

Szczegółowy typ `OzceInput` jest zdefiniowany w `src/types.ts`.
Warstwa mapująca formularz → `OzceInput` powstaje poza tym modułem (w pluginie / frontendzie).

## Testy

W `tests/ozc-engine.test.ts` są przykładowe testy:

* “dobrze ocieplony dom 120 m², rekuperacja, strefa III” → wynik rzędu 5–7 kW,
* “stary dom 150 m², brak ocieplenia, wentylacja naturalna, strefa IV” → wynik rzędu 12–18 kW.

Te testy nie są “prawem fizyki”, tylko sanity-check, żeby silnik się nie wykoleił.

````

---

# 3. Typy wejścia/wyjścia – `src/types.ts`

```ts
// src/types.ts

export type ClimateZoneId = "I" | "II" | "III" | "IV" | "V";

export type BuildingType = "single_family" | "semi_detached" | "multi_family_small";
export type ConstructionEra =
  | "before_1985"
  | "1985_2000"
  | "2001_2014"
  | "after_2014";

export type InsulationLevel = "none" | "basic" | "good" | "very_good";

export type VentilationType =
  | "natural"
  | "mechanical"
  | "mechanical_with_HR";

export type InfiltrationClass = "tight" | "medium" | "leaky";

export interface EnvelopeArea {
  area: number;          // [m2]
  uValue?: number;       // [W/m2K] jeśli znamy dokładnie
  uPresetKey?: string;   // klucz do tabeli z u_values_envelope.json
  insulationLevel?: InsulationLevel;
}

export interface GroundData {
  floorArea: number;        // A_floor [m2]
  footprintPerimeter: number; // P [m]
  floorUValueNominal?: number;  // U podłogi wg WT lub szacunku
  basementDepth?: number;   // [m], 0 = na gruncie, 1.5, 3.0
  groundwaterDepth?: number; // [m] poniżej posadzki (opcjonalne)
}

export interface VentilationData {
  type: VentilationType;
  infiltrationClass: InfiltrationClass;
  hasUserDefinedMechFlow?: boolean;
  mechSupplyFlow?: number;     // [m3/h] – jeśli znane
  mechExtractFlow?: number;    // [m3/h]
  heatRecoveryEfficiency?: number; // 0–1 (np. 0.6)
}

export interface ThermalBridgesData {
  strategy: "percent" | "deltaU";
  psiPercent?: number;   // np. 0.05 = 5% strat przez przenikanie
  deltaUFactor?: number; // np. 0.05 W/m2K dodane do wszystkich przegród
}

export interface SafetyData {
  globalFactor?: number;     // np. 0.1
  minPowerKw?: number;       // minimalna moc pompy
}

export interface OzceInput {
  meta: {
    projectId?: string;
    source?: "form" | "cieplo_app_bridge";
  };
  location: {
    climateZoneId: ClimateZoneId;
  };
  building: {
    type: BuildingType;
    constructionEra: ConstructionEra;
    heatedArea: number;    // [m2]
    heatedVolume: number;  // [m3]
    avgStoreyHeight: number; // [m]
  };
  temperatures: {
    thetaInt: number;             // np. 20
    thetaNeighborMin?: number;    // np. 16 (opcjonalnie)
  };
  envelope: {
    wallsExternal: EnvelopeArea;
    roof: EnvelopeArea;
    windows: EnvelopeArea;
    doors: EnvelopeArea;
    floorOnGround: EnvelopeArea;
    // opcjonalnie strop nad/ pod nieogrzewanym:
    ceilingToUnheated?: EnvelopeArea;
    floorAboveUnheated?: EnvelopeArea;
  };
  ground: GroundData;
  ventilation: VentilationData;
  thermalBridges: ThermalBridgesData;
  safety: SafetyData;
}

export interface OzceResultBreakdown {
  deltaTheta: number;      // [K] thetaInt - theta_e
  thetaExternal: number;   // [°C]
  thetaMeanYear: number;   // [°C]

  HT_transmission: number; // [W/K] przenikanie (bez mostków)
  HT_ground: number;       // [W/K]
  HT_unheated: number;     // [W/K]
  HT_total: number;        // [W/K] suma powyższych

  HV_ventilation: number;  // [W/K]

  Phi_T: number;           // [W]
  Phi_G: number;           // [W]
  Phi_u: number;           // [W]
  Phi_V: number;           // [W]
  Phi_psi: number;         // [W] mostki (upr.)
  Phi_base: number;        // [W] suma przed safety
  Phi_HL: number;          // [W] po safety
}

export interface OzceResult {
  heatLoadW: number;   // [W]
  heatLoadKw: number;  // [kW]
  breakdown: OzceResultBreakdown;
  meta: {
    safetyFactorUsed: number;
    comments: string[];
  };
}
````

---

# 4. Dane normowe – JSON-y (szkielety z przykładowymi wpisami)

Te pliki są **przykładowe** – możesz je później dopalić dokładnymi wartościami.

### `data/climate_zones.json`

```json
{
  "I": {
    "theta_e": -16,
    "theta_m_e": 7
  },
  "II": {
    "theta_e": -18,
    "theta_m_e": 7
  },
  "III": {
    "theta_e": -20,
    "theta_m_e": 7
  },
  "IV": {
    "theta_e": -22,
    "theta_m_e": 6
  },
  "V": {
    "theta_e": -24,
    "theta_m_e": 5
  }
}
```

---

### `data/u_values_envelope.json`

```json
{
  "wall": {
    "before_1985": {
      "none": 1.0,
      "basic": 0.7,
      "good": 0.4,
      "very_good": 0.25
    },
    "1985_2000": {
      "none": 0.9,
      "basic": 0.6,
      "good": 0.35,
      "very_good": 0.23
    },
    "2001_2014": {
      "none": 0.6,
      "basic": 0.4,
      "good": 0.25,
      "very_good": 0.20
    },
    "after_2014": {
      "none": 0.4,
      "basic": 0.25,
      "good": 0.20,
      "very_good": 0.15
    }
  },
  "roof": {
    "before_1985": {
      "none": 0.9,
      "basic": 0.6,
      "good": 0.25,
      "very_good": 0.18
    },
    "1985_2000": {
      "none": 0.7,
      "basic": 0.4,
      "good": 0.22,
      "very_good": 0.16
    },
    "2001_2014": {
      "none": 0.5,
      "basic": 0.3,
      "good": 0.20,
      "very_good": 0.15
    },
    "after_2014": {
      "none": 0.4,
      "basic": 0.25,
      "good": 0.18,
      "very_good": 0.13
    }
  },
  "floor_on_ground": {
    "before_1985": {
      "none": 0.9,
      "basic": 0.6,
      "good": 0.35,
      "very_good": 0.25
    },
    "1985_2000": {
      "none": 0.7,
      "basic": 0.45,
      "good": 0.3,
      "very_good": 0.22
    },
    "2001_2014": {
      "none": 0.6,
      "basic": 0.4,
      "good": 0.25,
      "very_good": 0.20
    },
    "after_2014": {
      "none": 0.5,
      "basic": 0.35,
      "good": 0.22,
      "very_good": 0.18
    }
  }
}
```

---

### `data/u_values_windows.json`

```json
{
  "old_double": 2.6,
  "double_2000": 1.8,
  "double_2010": 1.3,
  "triple_modern": 0.9
}
```

---

### `data/ground_u_equiv.json`

Minimalny subset tabel 5.1–5.3 z normy, uproszczony.

```json
{
  "z0": {
    "B_values": [2, 4, 6, 8, 10, 12, 16, 20],
    "U_equiv_for_Ufloor": {
      "2.0": [1.30, 0.88, 0.68, 0.55, 0.47, 0.41, 0.33, 0.28],
      "1.0": [0.77, 0.59, 0.48, 0.41, 0.36, 0.32, 0.26, 0.22],
      "0.5": [0.55, 0.45, 0.38, 0.33, 0.30, 0.27, 0.22, 0.19],
      "0.25": [0.33, 0.30, 0.27, 0.25, 0.23, 0.21, 0.18, 0.16]
    }
  },
  "z1_5": {
    "B_values": [2, 4, 6, 8, 10, 12, 16, 20],
    "U_equiv_for_Ufloor": {
      "2.0": [0.86, 0.64, 0.52, 0.44, 0.38, 0.34, 0.28, 0.24],
      "1.0": [0.58, 0.48, 0.40, 0.35, 0.31, 0.28, 0.23, 0.20],
      "0.5": [0.44, 0.38, 0.33, 0.29, 0.26, 0.24, 0.20, 0.18]
    }
  }
}
```

---

### `data/infiltration_profiles.json`

```json
{
  "single_family": {
    "tight": {
      "n50": 1.0,
      "ach_at_design": 0.2
    },
    "medium": {
      "n50": 3.0,
      "ach_at_design": 0.4
    },
    "leaky": {
      "n50": 5.0,
      "ach_at_design": 0.6
    }
  },
  "multi_family_small": {
    "tight": {
      "n50": 0.8,
      "ach_at_design": 0.15
    },
    "medium": {
      "n50": 2.5,
      "ach_at_design": 0.3
    },
    "leaky": {
      "n50": 4.0,
      "ach_at_design": 0.5
    }
  }
}
```

---

### `data/ventilation_profiles.json`

```json
{
  "single_family": {
    "natural": {
      "ach_hygienic": 0.5
    },
    "mechanical": {
      "ach_hygienic": 0.4
    },
    "mechanical_with_HR": {
      "ach_hygienic": 0.4,
      "default_hr_efficiency": 0.6
    }
  }
}
```

---

### `data/safety_and_bridges.json`

```json
{
  "thermalBridges": {
    "defaultPsiPercent": 0.07,
    "defaultDeltaU": 0.05
  },
  "unheatedSpaces": {
    "garage_attached": 0.5,
    "unheated_basement": 0.5,
    "cold_attic": 0.7
  },
  "safetyFactors": {
    "default": 0.1,
    "old_leaky_building": 0.15,
    "very_good_building": 0.05
  },
  "minPowerKw": {
    "single_family": {
      "small": 4,
      "medium": 6,
      "large": 8
    }
  }
}
```

---

# 5. Implementacja silnika – `src/ozc-engine.ts`

To jest **rdzeń**, który Cursor może dalej refaktorować / uszczegóławiać.

```ts
// src/ozc-engine.ts
import { OzceInput, OzceResult, OzceResultBreakdown } from "./types";
import climateZones from "../data/climate_zones.json";
import uValuesEnvelope from "../data/u_values_envelope.json";
import uValuesWindows from "../data/u_values_windows.json";
import groundUequiv from "../data/ground_u_equiv.json";
import infiltrationProfiles from "../data/infiltration_profiles.json";
import ventilationProfiles from "../data/ventilation_profiles.json";
import safetyAndBridges from "../data/safety_and_bridges.json";

type ClimateZonesData = typeof climateZones;

function pickClimate(zoneId: string): { theta_e: number; theta_m_e: number } {
  const z = (climateZones as ClimateZonesData)[zoneId as keyof ClimateZonesData];
  if (!z) throw new Error(`Unknown climate zone: ${zoneId}`);
  return z;
}

function resolveUEnvelope(
  element: "wall" | "roof" | "floor_on_ground",
  era: string,
  insulation: string | undefined,
  explicitU?: number
): number {
  if (typeof explicitU === "number") return explicitU;
  const lvl = insulation ?? "basic";
  const table = (uValuesEnvelope as any)[element]?.[era];
  if (!table) throw new Error(`Missing U-values for ${element}, era ${era}`);
  const u = table[lvl];
  if (typeof u !== "number") throw new Error(`Missing U for ${element}, era ${era}, insulation ${lvl}`);
  return u;
}

function resolveWindowU(uPresetKey?: string, explicitU?: number): number {
  if (typeof explicitU === "number") return explicitU;
  const key = uPresetKey ?? "double_2010";
  const u = (uValuesWindows as any)[key];
  if (typeof u !== "number") throw new Error(`Missing window U for key ${key}`);
  return u;
}

function computeGroundUequiv(
  A_floor: number,
  P_footprint: number,
  Ufloor_nominal: number,
  basementDepth: number | undefined,
  thetaInt: number,
  theta_e: number,
  theta_m_e: number,
  groundwaterDepth?: number
): { U_equiv: number; HT_ground: number } {
  if (A_floor <= 0 || P_footprint <= 0) return { U_equiv: 0, HT_ground: 0 };
  const B = A_floor / (0.5 * P_footprint);
  const depthKey = basementDepth && basementDepth >= 1 ? "z1_5" : "z0";
  const gData = (groundUequiv as any)[depthKey];
  const B_values: number[] = gData.B_values;
  const map = gData.U_equiv_for_Ufloor;
  const candidateUFloors = Object.keys(map)
    .map(parseFloat)
    .sort((a, b) => Math.abs(a - Ufloor_nominal) - Math.abs(b - Ufloor_nominal));
  const chosenUF = candidateUFloors[0].toFixed(2);
  const row = map[chosenUF];
  const idx = B_values.reduce((bestIdx: number, val: number, i: number) => {
    const bestVal = B_values[bestIdx];
    return Math.abs(val - B) < Math.abs(bestVal - B) ? i : bestIdx;
  }, 0);
  const U_equiv = row[idx];
  const fg1 = 1.45;
  const fg2 = (thetaInt - theta_m_e) / (thetaInt - theta_e);
  const Gw =
    typeof groundwaterDepth === "number" && groundwaterDepth < 1 ? 1.15 : 1.0;
  const HT_ground = fg1 * fg2 * Gw * U_equiv * A_floor;
  return { U_equiv, HT_ground };
}

function computeVentilationHV(input: OzceInput, thetaInt: number, theta_e: number): { HV: number; Phi_V: number } {
  const vol = input.building.heatedVolume;
  const buildingType = input.building.type;
  const vType = input.ventilation.type;
  const infClass = input.ventilation.infiltrationClass;

  const infProf = (infiltrationProfiles as any)[buildingType]?.[infClass];
  const vProf = (ventilationProfiles as any)[buildingType]?.[vType];

  const ach_inf = infProf?.ach_at_design ?? 0.3;
  const ach_hyg = vProf?.ach_hygienic ?? 0.5;
  const V_inf = ach_inf * vol;
  const V_hyg = ach_hyg * vol;

  let V_mech = 0;
  if (input.ventilation.hasUserDefinedMechFlow && input.ventilation.mechSupplyFlow) {
    V_mech = input.ventilation.mechSupplyFlow;
  } else if (vType === "mechanical" || vType === "mechanical_with_HR") {
    V_mech = V_hyg;
  }

  let V_eff: number;
  if (vType === "natural") {
    V_eff = Math.max(V_inf, V_hyg);
  } else if (vType === "mechanical") {
    V_eff = Math.max(V_mech, V_hyg);
  } else {
    const eta = input.ventilation.heatRecoveryEfficiency ??
      vProf?.default_hr_efficiency ?? 0.6;
    V_eff = (1 - eta) * Math.max(V_mech, V_hyg);
  }

  const HV = 0.34 * V_eff; // W/K
  const dT = thetaInt - theta_e;
  const Phi_V = HV * dT;
  return { HV, Phi_V };
}

export function computeHeatLoad(input: OzceInput): OzceResult {
  const { theta_e, theta_m_e } = pickClimate(input.location.climateZoneId);
  const thetaInt = input.temperatures.thetaInt;
  const deltaTheta = thetaInt - theta_e;

  const era = input.building.constructionEra;
  const wallA = input.envelope.wallsExternal.area;
  const roofA = input.envelope.roof.area;
  const floorA = input.envelope.floorOnGround.area;
  const windowA = input.envelope.windows.area;
  const doorA = input.envelope.doors.area;

  // U-values
  const U_wall = resolveUEnvelope("wall", era, input.envelope.wallsExternal.insulationLevel, input.envelope.wallsExternal.uValue);
  const U_roof = resolveUEnvelope("roof", era, input.envelope.roof.insulationLevel, input.envelope.roof.uValue);
  const U_floorNominal = resolveUEnvelope("floor_on_ground", era, input.envelope.floorOnGround.insulationLevel, input.envelope.floorOnGround.uValue);
  const U_window = resolveWindowU(input.envelope.windows.uPresetKey, input.envelope.windows.uValue);
  const U_door = input.envelope.doors.uValue ?? 1.3;

  // Transmission without ground/unheated
  let HT_transmission = 0;
  HT_transmission += U_wall * wallA;
  HT_transmission += U_roof * roofA;
  HT_transmission += U_window * windowA;
  HT_transmission += U_door * doorA;

  // Ground
  const ground = input.ground;
  const { U_equiv, HT_ground } = computeGroundUequiv(
    ground.floorArea,
    ground.footprintPerimeter,
    U_floorNominal,
    ground.basementDepth,
    thetaInt,
    theta_e,
    theta_m_e
  );

  // Optional: unheated spaces (przez strop itp.)
  let HT_unheated = 0;
  if (input.envelope.ceilingToUnheated?.area) {
    const f_u =
      (safetyAndBridges as any).unheatedSpaces?.["cold_attic"] ?? 0.7;
    const U = input.envelope.ceilingToUnheated.uValue ??
      U_roof;
    HT_unheated += U * input.envelope.ceilingToUnheated.area * f_u;
  }
  if (input.envelope.floorAboveUnheated?.area) {
    const f_u =
      (safetyAndBridges as any).unheatedSpaces?.["unheated_basement"] ?? 0.5;
    const U = input.envelope.floorAboveUnheated.uValue ??
      U_floorNominal;
    HT_unheated += U * input.envelope.floorAboveUnheated.area * f_u;
  }

  const HT_total = HT_transmission + HT_ground + HT_unheated;

  // Ventilation
  const { HV, Phi_V } = computeVentilationHV(input, thetaInt, theta_e);

  // Transmission losses
  const Phi_T = HT_transmission * deltaTheta;
  const Phi_G = HT_ground * deltaTheta;
  const Phi_u = HT_unheated * deltaTheta;

  // Thermal bridges (upraszczamy)
  let Phi_psi = 0;
  if (input.thermalBridges.strategy === "percent") {
    const p = input.thermalBridges.psiPercent ??
      (safetyAndBridges as any).thermalBridges.defaultPsiPercent ??
      0.07;
    Phi_psi = (Phi_T + Phi_G + Phi_u) * p;
  } else if (input.thermalBridges.strategy === "deltaU") {
    const deltaU =
      input.thermalBridges.deltaUFactor ??
      (safetyAndBridges as any).thermalBridges.defaultDeltaU ??
      0.05;
    const A_total = wallA + roofA + floorA;
    const HT_psi = deltaU * A_total;
    Phi_psi = HT_psi * deltaTheta;
  }

  const Phi_base = Phi_T + Phi_G + Phi_u + Phi_V + Phi_psi;

  // Safety factor
  let safetyFactor =
    input.safety.globalFactor ??
    (safetyAndBridges as any).safetyFactors.default ??
    0.1;

  const Phi_HL = Phi_base * (1 + safetyFactor);
  let heatLoadW = Phi_HL;
  let heatLoadKw = heatLoadW / 1000;

  // Minimalna moc (opcjonalnie)
  if (input.safety.minPowerKw) {
    if (heatLoadKw < input.safety.minPowerKw) {
      heatLoadKw = input.safety.minPowerKw;
      heatLoadW = heatLoadKw * 1000;
    }
  }

  const breakdown: OzceResultBreakdown = {
    deltaTheta,
    thetaExternal: theta_e,
    thetaMeanYear: theta_m_e,
    HT_transmission,
    HT_ground,
    HT_unheated,
    HT_total,
    HV_ventilation: HV,
    Phi_T,
    Phi_G,
    Phi_u,
    Phi_V,
    Phi_psi,
    Phi_base,
    Phi_HL
  };

  const comments: string[] = [];
  if (heatLoadKw < 6) {
    comments.push("Budynek o niskim zapotrzebowaniu – możliwa mała pompa ciepła.");
  } else if (heatLoadKw > 15) {
    comments.push("Wysokie obciążenie cieplne – rozważ docieplenie przegród.");
  }

  return {
    heatLoadW,
    heatLoadKw,
    breakdown,
    meta: {
      safetyFactorUsed: safetyFactor,
      comments
    }
  };
}
```

---

# 6. Prosty test – `tests/ozc-engine.test.ts`

```ts
// tests/ozc-engine.test.ts
import { computeHeatLoad } from "../src/ozc-engine";
import { OzceInput } from "../src/types";

function baseInput(): OzceInput {
  return {
    meta: {},
    location: { climateZoneId: "III" },
    building: {
      type: "single_family",
      constructionEra: "after_2014",
      heatedArea: 120,
      heatedVolume: 300,
      avgStoreyHeight: 2.5
    },
    temperatures: {
      thetaInt: 21
    },
    envelope: {
      wallsExternal: { area: 140, insulationLevel: "good" },
      roof: { area: 120, insulationLevel: "good" },
      floorOnGround: { area: 120, insulationLevel: "good" },
      windows: { area: 20, uPresetKey: "triple_modern" },
      doors: { area: 3, uValue: 1.3 }
    },
    ground: {
      floorArea: 120,
      footprintPerimeter: 44,
      basementDepth: 0
    },
    ventilation: {
      type: "mechanical_with_HR",
      infiltrationClass: "tight",
      hasUserDefinedMechFlow: false
    },
    thermalBridges: {
      strategy: "percent",
      psiPercent: 0.07
    },
    safety: {
      globalFactor: 0.1
    }
  };
}

test("modern 120m2 house in zone III should be ~5-8 kW", () => {
  const input = baseInput();
  const res = computeHeatLoad(input);
  expect(res.heatLoadKw).toBeGreaterThan(4);
  expect(res.heatLoadKw).toBeLessThan(9);
});

test("weakly insulated, leaky building should have much higher load", () => {
  const input = baseInput();
  input.building.constructionEra = "before_1985";
  input.envelope.wallsExternal.insulationLevel = "none";
  input.envelope.roof.insulationLevel = "none";
  input.envelope.floorOnGround.insulationLevel = "none";
  input.ventilation.infiltrationClass = "leaky";
  input.ventilation.type = "natural";
  const res = computeHeatLoad(input);
  expect(res.heatLoadKw).toBeGreaterThan(12);
});
```

---

## Co dalej?

1. Możesz ten pakiet wkleić jako **oddzielny moduł** w repo.
2. W Cursorze dajesz mu to README i mówisz:

   * “doprecyzuj JSON-y wg normy”
   * “napisz mapper z mojego formularza do `OzceInput`”
   * “podłącz silnik do istniejącego flow zamiast cieplo.app lub równolegle do porównań”.

Jeśli chcesz, w kolejnym kroku mogę dorobić:

* **mapper**: `formToOzceInput.ts` na bazie Twoich realnych pól formularza,
* **adapter**: `ozc-engine-bridge.ts`, który weźmie wyniki z cieplo.app i porówna z naszym silnikiem (Delta % + sanity check).



