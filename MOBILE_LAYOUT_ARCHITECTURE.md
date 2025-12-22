# 📐 MOBILE LAYOUT ARCHITECTURE - FINALNA WERSJA

**Data:** 18.12.2025
**Status:** ✅ FIXED - Symetria przywrócona

---

## 🏗️ Architektura layoutu (Mobile)

### Hierarchia kontenerów:

```
body (100vw)
  └── .section (100%, padding: 28px 16px)
        ├── .form-row-mosaic (100%, padding: 0 16px)  ✅ NAPRAWIONE
        │     ├── .help-box (100%, no margin)
        │     └── .form-field-item (100%, no margin)
        │           └── .building-type-cards (grid 2col, no margin)
        │
        ├── .form-card (100%, padding: 22px 16px)
        │     └── zawartość...
        │
        ├── .yes-no-cards (100%, no margin)
        │     └── .yes-no-card × 2
        │
        └── .btn-row (100%, no margin)
              └── button × N (szerokość 100%)
```

---

## 🎯 Zasady:

### 1. **Kontenery główne** (pełna szerokość):

```css
.section,
.form-row-mosaic,
.form-card {
  width: 100%;
  padding: X var(--content-pad); /* padding NA KONTENERZE */
  margin-left: 0;
  margin-right: 0;
}
```

### 2. **Dzieci** (bez marginesów bocznych):

```css
.form-field-item,
.building-type-cards,
.help-box,
.yes-no-cards,
.btn-row,
button {
  width: 100%;
  margin-left: 0; /* NO margin - parent ma padding */
  margin-right: 0;
}
```

---

## 📊 Spacing na różnych szerokościach:

| Szerokość  | --content-pad | Efektywny spacing po bokach |
| ---------- | ------------- | --------------------------- |
| ≤480px     | 12px          | 12px left + 12px right      |
| 481-767px  | 16px          | 16px left + 16px right      |
| 768-1023px | 24-48px fluid | clamp(24px, 4vw, 48px)      |
| ≥1024px    | Desktop rules | Desktop rules               |

---

## ✅ Co zostało naprawione (18.12.2025):

### Przed:

```css
.form-row-mosaic {
  padding: 0 !important; /* ❌ brak paddingu */
}
.form-field-item {
  margin-left: var(--content-pad); /* ❌ overflow o 32px */
  margin-right: var(--content-pad);
}
```

### Po:

```css
.form-row-mosaic {
  padding: 0 var(--content-pad) !important; /* ✅ padding na kontenerze */
}
.form-field-item {
  /* ✅ bez margin - parent ma padding */
}
```

---

## 🎨 Visual Result:

✅ Elementy są **symetrycznie oddalone** od krawędzi (16px mobile, 12px small mobile)
✅ Przyciski wyglądają tak samo jak inne elementy (consistent spacing)
✅ Help-boxy, karty, inputy - wszystko symetrycznie
✅ Zero overflow, zero horizontal scroll

---

## 📝 Klucz do zrozumienia:

**Padding = wewnątrz elementu** (zmniejsza dostępną szerokość dla dzieci)
**Margin = na zewnątrz elementu** (dodaje do szerokości, może powodować overflow)

**Dlatego:**

- Kontenery: `padding` (kontroluje spacing dzieci)
- Dzieci: `width: 100%` bez margin (wykorzystują pełną szerokość rodzica)

---

**Architekt:** Zordon AI
**Przejrzane:** 18.12.2025
**Status:** Production-ready ✅
