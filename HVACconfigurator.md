Poniżej masz **ZAKTUALIZOWANĄ, UJEDNOLICONĄ I TECHNICZNIE POPRAWNĄ** wersję specyfikacji **TOP-INSTAL HVAC ENGINE**, uwzględniającą **wszystkie nowe ustalenia** (zład wody, regułę 3-faz 9/12/16 kW, CWU, cyrkulację) oraz **sprawdzoną pod kątem kompatybilności z `kalkulator.html` i danymi z cieplo.app**.

Nie zmieniam filozofii — **porządkuję, doprecyzowuję i zamrażam**.

---

# 🔥 **TOP-INSTAL HVAC ENGINE – pełna specyfikacja (FINAL)**

Silnik HVAC odpowiada za:

* automatyczną ocenę budynku
* automatyczny dobór konfiguracji maszynowni
* auto-selekcję elementów (tam, gdzie dozwolone)
* blokowanie błędnych opcji
* generowanie rekomendacji technicznych
* przekazywanie decyzji do UI kroków
* eksport decyzji do PDF i CRM

Całość opiera się o:

* dane użytkownika z formularza kalkulatora
* dane techniczne z cieplo.app (API OZC)
* model pompy wybrany w kroku 1 konfiguratora
* parametry instalacji (CO, CWU, typ budynku, woda, ciśnienie)

---

# 🧩 **Główne wejścia silnika**

Silnik otrzymuje:

### 1) **calcInput** — dane użytkownika z formularza (`kalkulator.html`)

* `heated_area`
* `heating_type` (underfloor / radiators / mixed)
* `include_hot_water`
* `hot_water_persons`
* `hot_water_usage` (eco / standard / comfort / bath)
* `building_type` (new / modernized)
* `has_other_heat_source`

### 2) **heatLoss** — wynik cieplo.app

* `max_heating_power` / `power_kw_design`
* `recommended_power_kw`
* `flow_temp`
* `heating_type`

### 3) **pumpModel** — wynik kroku 1 konfiguratora

* `model`
* `series` (K / L / T-CAP)
* `power_kw`
* `phase` (1 / 3)

### 4) Dane instalacyjne

* `water_hardness` (°dH)
* `water_pressure` (bar)

---

# 🧠 **GŁÓWNY CEL SILNIKA**

Silnik odpowiada na 3 pytania:

## 1️⃣ Czy **BUDYNEK** wymaga konkretnych komponentów?

(np. CWU, cyrkulacja, reduktor)

## 2️⃣ Czy **INSTALACJA** wymaga konkretnych komponentów?

(np. bufor, sprzęgło, minimalny zład wody)

## 3️⃣ Czy **POMPA CIEPŁA** narzuca dodatkowe wymagania?

(np. bufor dla dużych jednostek 3F)

Wynikiem jest **konfiguracja maszynowni**, która:

* minimalizuje ryzyko błędów instalacyjnych
* zapewnia kulturę pracy
* jest zgodna z wytycznymi Panasonic
* jest optymalna kosztowo
* redukuje zgłoszenia serwisowe

---

# 🧱 1. **DOBÓR ZBIORNIKA CWU**

### Dane wejściowe:

* liczba osób
* profil zużycia: eco / standard / comfort / bath
* materiał zasobnika: inox / emalia

### Logika pojemności (kanon TOP-INSTAL)

| Osoby |  Standard | Wysokie zużycie / wanna |
| ----: | --------: | ----------------------: |
|     1 |     150 L |                   200 L |
|     2 |     150 L |                   200 L |
|     3 |     200 L |                   250 L |
|     4 | 200–250 L |               250–300 L |
|    5+ |     300 L |               300–400 L |

**Twarda reguła bezpieczeństwa:**

> jeśli `hot_water_usage = bath` **i** `persons ≥ 2` → **minimum 200 L**

### Auto-wybór:

* rekomendowana pojemność = opcja główna
* alternatywa:

  * +50 L (inox)
  * +100 L (emalia)

### Wyjście silnika:

```js
cwu: {
  recommended: 200,
  alternative: 250,
  material: "inox"
}
```

---

# 🧱 2. **DOBÓR BUFORA CO – FINALNA LOGIKA**

Bufor **NIE jest domyślny**.
Bufor **uzupełnia brakujący zład wody instalacji**.

---

## 2A. **NADRZĘDNA REGUŁA (ABSOLUTNA)**

Dla pomp:

* **3-fazowych**
* **9 / 12 / 16 kW**
* **serii K**
* niezależnie od: T-CAP / HP / split / AIO

👉 **Zawsze: bufor 200 L**

```js
buffer: {
  required: true,
  capacity: 200
}
```

Ta reguła **ma pierwszeństwo nad wszystkimi innymi**.

---

## 2B. **ZŁAD WODY – REGUŁA PODSTAWOWA**

### Szacowanie zładu instalacji:

* podłogówka: **1.0 l / m²**
* mixed: **0.8 l / m²**
* grzejniki: **0.5 l / m²**

### Wymagany minimalny zład (DTR / praktyka):

* podłogówka: **10 l / kW**
* mixed: **15 l / kW**
* grzejniki: **20 l / kW**

### Decyzja:

```text
jeśli estimatedWater ≥ requiredWater → bufor = 0
jeśli estimatedWater < requiredWater → bufor = różnica (zaokrąglona)
```

---

## 2C. **Scenariusze instalacyjne (interpretacja)**

| Typ instalacji             | Decyzja                         |
| -------------------------- | ------------------------------- |
| Nowy dom, pełna podłogówka | Zazwyczaj **bez bufora**        |
| Podłogówka + grzejniki     | Bufor tylko jeśli brakuje zładu |
| Grzejniki                  | Bufor zazwyczaj wymagany        |
| Dwa źródła ciepła          | Bufor sprzęgający 150–200 L     |

---

# 🧱 3. **CYRKULACJA CWU**

Cyrkulacja **NIGDY nie jest wymagana** — tylko opcjonalna.

### Rekomendowana, gdy:

* ≥ 2 łazienki
* długie trasy (>8–10 m)
* profil `comfort`
* nowy dom w budowie

### Modernizacja:

* tylko jeśli użytkownik **ma lub chce** nitkę cyrkulacyjną
* koszt +1000 zł (pompa + armatura + robocizna)

```js
circulation: {
  enabled: true/false,
  recommended: true/false
}
```

---

# 🧱 4. **Fundament / Konsola**

Brak logiki automatycznej.
Użytkownik wybiera:

* fundament + wibroizolacja
* stojak

---

# 🧱 5. **Reduktor ciśnienia**

* > 4.0 bar → **wymagany**
* zawsze **zalecany**

---

# 🧱 6. **Stacja uzdatniania wody**

Brak logiki automatycznej.
Opcja świadoma użytkownika.

---

# 🧱 7. **Service Cloud**

Zawsze aktywny:

```js
service_cloud: "cloud"
```

---

# 🧱 8. **FINALNY OBIEKT WYJŚCIA SILNIKA**

```js
{
  pump: "KIT-WC05K3E5",
  cwu: { type: "inox", capacity: 200 },
  buffer: { required: false, capacity: 0 },
  circulation: { enabled: false },
  foundation: "foundation",
  reduktor: { required: true },
  water_station: { required: false },
  service_cloud: "cloud",
  price: ...
}
```

---

# ✅ **SPRAWDZENIE KOMPATYBILNOŚCI**

### Z `kalkulator.html`

✔ `heated_area`
✔ `heating_type`
✔ `include_hot_water`
✔ `hot_water_persons`
✔ `hot_water_usage`
✔ `building_type`

### Z `cieplo.app`

✔ `max_heating_power`
✔ `recommended_power_kw`
✔ `flow_temp`

👉 **Pełna kompatybilność. Brak konfliktów logicznych.**

---

## 🏁 STATUS

**Specyfikacja HVAC: ZAMROŻONA (FINAL)**
Każda zmiana od tej chwili = decyzja projektowa, nie poprawka.

Jeśli chcesz:

* mogę wygenerować **`HVAC_RULES.md`** do repo
* albo **checklistę testów akceptacyjnych (QA + serwis)**
