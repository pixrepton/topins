# Logika doboru bufora CO do pompy ciepła

## Przegląd

System doboru bufora CO w konfiguratorze TOP-INSTAL wykorzystuje zaawansowaną logikę opartą na **uzupełnieniu brakującego zładu wody instalacji**, zgodnie z praktyką instalacyjną i wytycznymi Panasonic Aquarea.

Bufor **NIE jest zawsze wymagany** — jest stosowany wyłącznie wtedy, gdy rzeczywisty (lub szacowany) zład instalacji nie spełnia minimalnego wymagania producenta pompy.

System uwzględnia:

- Moc pompy ciepła (kW)
- Powierzchnię ogrzewaną (m²)
- Typ instalacji grzewczej (podłogówka, mieszana, grzejniki)
- Fazę pompy (1~ / 3~) i generację (seria K)
- Parametry z kalkulatora cieplo.app

## Zasady doboru

### 1. Reguła nadrzędna — pompy 3-fazowe serii K

**Dla pomp 3-fazowych (400V) o mocy 9/12/16 kW serii K:**

- **Zawsze**: `recommendedCapacity = 200 l`
- **Zawsze**: `required = true`
- **Zawsze**: `allowZeroBuffer = false`

Ta reguła ma **pierwszeństwo** nad wszystkimi innymi obliczeniami.

### 2. Minimalny wymagany zład wody instalacji

`capacityPerKw` oznacza **minimalny wymagany zład wody instalacji [l/kW]**, nie "bufor na kW":

- **Podłogówka (underfloor)**: 10 l/kW
- **Mieszana (mixed)**: 15 l/kW
- **Grzejniki (radiators)**: 20 l/kW

**Przykład:** Pompa 12 kW z grzejnikami wymaga minimum: `12 × 20 = 240 l` zładu wody w instalacji.

### 3. Szacowanie zładu instalacji

System szacuje rzeczywisty zład instalacji na podstawie powierzchni:

- **Podłogówka**: ~1.1 l/m² (duża bezwładność, więcej wody w rurach)
- **Mieszana**: ~0.9 l/m²
- **Grzejniki**: ~0.65 l/m² (mniej wody w grzejnikach)

**Przykład:** Dom 120 m² z grzejnikami: `120 × 0.65 = 78 l` szacowanego zładu.

### 4. Decyzja o buforze — uzupełnienie brakującego zładu

Bufor jest liczony jako **uzupełnienie różnicy** między wymaganym a szacowanym zładem:

```
wymagany_zład = moc_pompy_kW × capacityPerKw[typ_instalacji]
szacowany_zład = powierzchnia_m² × systemVolumePerM2[typ_instalacji]

jeśli szacowany_zład >= wymagany_zład:
  bufor = 0 (nie wymagany)
jeśli szacowany_zład < wymagany_zład:
  bufor = wymagany_zład - szacowany_zład
```

**Przykład:** Pompa 12 kW, grzejniki, 120 m²:

- Wymagany zład: `12 × 20 = 240 l`
- Szacowany zład: `120 × 0.65 = 78 l`
- Brakuje: `240 - 78 = 162 l`
- Bufor: `≈ 150 l` (najbliższa dostępna pojemność)

### 5. Scenariusze priorytetowe

Przed obliczaniem zładu sprawdzane są scenariusze:

- **Podłogówka + budynek nowy (≥2015) + brak poprzedniego źródła**: `bufor = 0`, `required = false`
- **Mieszana**: `bufor = 100 l`, `required = false` (scenariusz uproszczony)
- **Grzejniki**: `bufor = 100 l`, `required = true` (scenariusz uproszczony)

### 6. Minimum i maksimum pojemności

- **Minimum**:

  - Podłogówka: 0 l (można pominąć)
  - Mieszana: 80 l
  - Grzejniki: 100 l

- **Maksimum**: 500 l (największy dostępny bufor)

### 7. Specjalne przypadki

#### Pompy AIO (All-In-One) z podłogówką

- Dla pomp AIO o mocy < 7 kW z instalacją podłogową bufor może być pominięty (0 l)
- Pompy AIO mają wbudowaną hydraulikę, która częściowo zastępuje bufor

## Wzór obliczeniowy

```javascript
// 1. REGUŁA NADRZĘDNA - pompy 3-fazowe 9/12/16 kW serii K
if (phase === 3 && power ∈ {9, 12, 16} && generation === 'K') {
  return { recommendedCapacity: 200, required: true };
}

// 2. SCENARIUSZE PRIORYTETOWE
if (underfloor + nowy_budynek + brak_poprzedniego_źródła) {
  return { recommendedCapacity: 0, required: false };
}
if (mixed) return { recommendedCapacity: 100, required: false };
if (radiators) return { recommendedCapacity: 100, required: true };

// 3. OBLICZENIE ZŁADU WODY
wymagany_zład = moc_pompy_kW × capacityPerKw[typ_instalacji]
szacowany_zład = powierzchnia_m² × systemVolumePerM2[typ_instalacji]

// 4. DECYZJA O BUFORZE
if (szacowany_zład >= wymagany_zład) {
  bufor = 0
} else {
  bufor = wymagany_zład - szacowany_zład
}

// 5. ZAOKRĄGLENIE DO DOSTĘPNYCH POJEMNOŚCI
pojemność_rekomendowana = najbliższa_z_listy([50, 80, 100, 120, 150, 200, 400, 500])
```

## Dostępne pojemności buforów

System oferuje buforów VIQTIS w następujących pojemnościach:

- 80 l
- 100 l
- 120 l
- 150 l
- 200 l
- 400 l
- 500 l

## Przykłady obliczeń

### Przykład 1: Pompa 3-fazowa 9 kW serii K (reguła nadrzędna)

```
Warunek: phase === 3, power === 9, generation === 'K'
Wynik: recommendedCapacity = 200 l, required = true
```

### Przykład 2: Dom 120 m², grzejniki, pompa 12 kW (obliczenie zładu)

```
Wymagany zład: 12 × 20 = 240 l
Szacowany zład: 120 × 0.65 = 78 l
Brakuje: 240 - 78 = 162 l
Bufor: ≈ 150 l (najbliższa dostępna)
required = true (bo bufor > 0)
```

### Przykład 3: Dom 140 m², podłogówka, pompa 7 kW

```
Wymagany zład: 7 × 10 = 70 l
Szacowany zład: 140 × 1.1 = 154 l
Szacowany zład >= wymagany zład → bufor = 0
Wynik: recommendedCapacity = 0, required = false
```

### Przykład 4: Dom 50 m², podłogówka, pompa 7 kW

```
Wymagany zład: 7 × 10 = 70 l
Szacowany zład: 50 × 1.1 = 55 l
Brakuje: 70 - 55 = 15 l
Bufor: ≈ 50 l (najbliższa dostępna)
```

### Przykład 5: Podłogówka + budynek nowy (≥2015) + brak poprzedniego źródła

```
Scenariusz priorytetowy → skipKwCalculation = true
Wynik: recommendedCapacity = 0, required = false, allowZeroBuffer = true
```

## Integracja z konfiguratorem

Logika doboru bufora jest zaimplementowana w:

- `configurator-unified.js` - funkcja `rulesEngine.buffer(state)`

System automatycznie:

- Sprawdza regułę nadrzędną (pompy 3-fazowe 9/12/16 kW serii K)
- Sprawdza scenariusze priorytetowe (underfloor+nowy, mixed, radiators)
- Oblicza wymagany minimalny zład wody instalacji
- Szacuje rzeczywisty zład instalacji na podstawie powierzchni
- Oblicza bufor jako uzupełnienie brakującego zładu
- Ustawia zakres dostępnych pojemności w UI
- Oznacza rekomendowaną pojemność w interfejsie
- Wymusza wybór bufora dla grzejników tylko gdy bufor > 0 (required = true)

## Kluczowe zmiany semantyczne

**PRZED (błędne):**

- `capacityPerKw` = "bufor na kW" → bufor zawsze liczony jako `moc × współczynnik`
- Bufor wymagany "z automatu" dla większości instalacji

**PO (poprawne):**

- `capacityPerKw` = **minimalny wymagany zład wody instalacji [l/kW]**
- Bufor = **uzupełnienie brakującego zładu** (tylko gdy `szacowany_zład < wymagany_zład`)
- Bufor domyślnie = 0 dla podłogówki (jeśli zład wystarczający)

## Źródła i normy

Logika oparta na:

- Praktyce instalacyjnej pomp ciepła
- Wytycznych Panasonic Aquarea (DTR)
- Zasadzie: bufor uzupełnia brakujący zład, nie zwiększa zładu ponad minimum
- Normach dotyczących instalacji grzewczych
- Doświadczeniu serwisowym TOP-INSTAL

---

**Ostatnia aktualizacja**: 2025-01-XX
**Wersja logiki**: 3.0 (semantyka zładu wody + reguła nadrzędna 3-fazowe)
