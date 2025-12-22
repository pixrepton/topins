
# 🔥 TOP-INSTAL HVAC ENGINE — RULES & DECISION LOGIC (FINAL)

Ten dokument jest **jedyną obowiązującą specyfikacją logiki HVAC**
dla projektu **TOP-INSTAL – Wycena 2025**.

Status: **ZAMROŻONY (FINAL)**  
Każda zmiana wymaga świadomej decyzji projektowej.

---

## 🎯 Cel silnika HVAC

Silnik HVAC odpowiada za:
- ocenę budynku i instalacji,
- dobór konfiguracji maszynowni,
- auto-rekomendacje i blokady,
- minimalizację ryzyka serwisowego,
- spójność z wytycznymi Panasonic,
- eksport decyzji do UI, PDF i CRM.

Silnik **nie jest kalkulatorem OZC** — interpretuje wyniki kalkulatora.

---

## 🧩 Dane wejściowe

### Z formularza (`kalkulator.html`)
- `heated_area`
- `heating_type` (underfloor / mixed / radiators)
- `include_hot_water`
- `hot_water_persons`
- `hot_water_usage` (eco / standard / comfort / bath)
- `building_type` (new / modernized)
- `has_other_heat_source`

### Z cieplo.app
- `max_heating_power`
- `recommended_power_kw`
- `flow_temp`

### Z konfiguratora
- `pumpModel.power_kw`
- `pumpModel.series` (K / L / T-CAP)
- `pumpModel.phase` (1 / 3)

---

## 🧱 1. CWU — DOBÓR ZASOBNIKA

### Dane wejściowe
- liczba osób,
- profil zużycia,
- materiał (inox / emalia).

### Reguły pojemności (kanon TOP-INSTAL)

| Osoby | Standard | Wysokie zużycie / wanna |
|------:|---------:|------------------------:|
| 1     | 150 L    | 200 L |
| 2     | 150 L    | 200 L |
| 3     | 200 L    | 250 L |
| 4     | 200–250 L| 250–300 L |
| 5+    | 300 L    | 300–400 L |

### Twarda reguła bezpieczeństwa
> Jeśli `hot_water_usage = bath` **i** `persons ≥ 2` → **minimum 200 L**

### Alternatywy
- inox: +50 L  
- emalia: +100 L  

---

## 🧱 2. BUFOR CO — LOGIKA FINALNA

### Zasada nadrzędna
**Bufor nie jest domyślny.**  
Bufor **uzupełnia brakujący zład wody instalacji**.

---

### 2A. REGUŁA ABSOLUTNA (NADRZĘDNA)

Dla pomp:
- 3-fazowych,
- **9 / 12 / 16 kW**,
- **seria K**,

niezależnie od:
- T-CAP / HP,
- typu instalacji,
- zładu wody,

👉 **Zawsze: bufor 200 L**

```js
buffer = {
  required: true,
  capacity: 200
}
````

Ta reguła **ma pierwszeństwo nad wszystkimi innymi**.

---

### 2B. ZŁAD WODY — REGUŁA PODSTAWOWA

#### Szacowanie zładu instalacji

* podłogówka: **1.0 l / m²**
* mixed: **0.8 l / m²**
* grzejniki: **0.5 l / m²**

#### Minimalny wymagany zład (DTR / praktyka)

* podłogówka: **10 l / kW**
* mixed: **15 l / kW**
* grzejniki: **20 l / kW**

#### Decyzja

```text
jeśli estimatedWater ≥ requiredWater:
  bufor = 0
jeśli estimatedWater < requiredWater:
  bufor = requiredWater − estimatedWater
  → zaokrąglić do dostępnej pojemności
```

---

### 2C. Interpretacja scenariuszy

| Scenariusz                 | Decyzja                         |
| -------------------------- | ------------------------------- |
| Nowy dom, pełna podłogówka | Zazwyczaj bez bufora            |
| Podłogówka + grzejniki     | Bufor tylko jeśli brakuje zładu |
| Grzejniki                  | Bufor zazwyczaj wymagany        |
| Dwa źródła ciepła          | Bufor sprzęgający 150–200 L     |

---

## 🧱 3. CYRKULACJA CWU

Cyrkulacja **nigdy nie jest wymagana**.

### Rekomendowana, gdy:

* ≥2 łazienki,
* długie trasy CWU (>8–10 m),
* profil `comfort`,
* nowy dom w budowie.

### Modernizacja

* tylko świadomy wybór użytkownika,
* koszt +1000 zł (pompa + armatura + robocizna).

```js
circulation = {
  enabled: true / false,
  recommended: true / false
}
```

---

## 🧱 4. FUNDAMENT / KONSOLA

Brak automatyki.
Świadomy wybór użytkownika:

* fundament + wibroizolacja,
* stojak.

---

## 🧱 5. REDUKTOR CIŚNIENIA

* **>4.0 bar → wymagany**
* zawsze zalecany.

---

## 🧱 6. STACJA UZDATNIANIA WODY

Brak logiki automatycznej.
Decyzja użytkownika.

---

## 🧱 7. SERVICE CLOUD

Zawsze aktywny:

```js
service_cloud = "cloud"
```

---

## 🧾 8. FINALNY OBIEKT DECYZYJNY

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

## 🔒 STATUS

**HVAC RULES: FINAL / LOCKED**

* brak rankingów marketingowych,
* brak automatycznych „upselli”,
* decyzje techniczne > estetyka UI,
* zgodność z praktyką instalacyjną i serwisową.

Każda zmiana po tym punkcie = **świadoma zmiana projektu**.

```