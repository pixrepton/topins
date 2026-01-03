# 📦 TOP-INSTAL Heat Pump Calculator - WordPress Plugin

**Wersja:** 1.0.0
**Status:** ✅ Gotowe do instalacji
**Wymagania:** WordPress 5.0+, PHP 7.4+

---

## 🚀 INSTALACJA WTYCZKI

### Metoda 1: Instalacja przez panel WordPress

1. **Spakuj wtyczkę do archiwum ZIP:**
   ```bash
   # W katalogu głównym projektu
   zip -r heatpump-calculator.zip heatpump-calculator.php main/
   ```

2. **Zainstaluj wtyczkę:**
   - Zaloguj się do panelu administracyjnego WordPress
   - Przejdź do: **Wtyczki → Dodaj nową**
   - Kliknij: **Wyślij wtyczkę na serwer**
   - Wybierz plik `heatpump-calculator.zip`
   - Kliknij: **Zainstaluj teraz**

3. **Aktywuj wtyczkę:**
   - Po instalacji kliknij: **Aktywuj wtyczkę**

### Metoda 2: Instalacja przez FTP

1. **Prześlij pliki na serwer:**
   - Utwórz katalog: `/wp-content/plugins/heatpump-calculator/`
   - Prześlij pliki:
     - `heatpump-calculator.php` (główny plik wtyczki)
     - Katalog `main/` (z całą zawartością)

2. **Aktywuj wtyczkę:**
   - Zaloguj się do panelu administracyjnego WordPress
   - Przejdź do: **Wtyczki**
   - Znajdź: **TOP-INSTAL Heat Pump Calculator**
   - Kliknij: **Aktywuj**

---

## 📝 UŻYCIE SHORTCODE

### Podstawowe użycie

Wstaw shortcode na dowolnej stronie lub w poście:

```
[heatpump_calc]
```

### Atrybuty shortcode

```
[heatpump_calc mode="full"]
```

**Dostępne atrybuty:**
- `mode` - tryb wyświetlania (domyślnie: `full`)
  - `full` - pełny kalkulator z konfiguratorem
  - `calculator-only` - tylko kalkulator (do zaimplementowania)
  - `configurator-only` - tylko konfigurator (do zaimplementowania)

### Przykłady użycia

**W edytorze Gutenberg:**
1. Dodaj blok: **Shortcode**
2. Wpisz: `[heatpump_calc]`
3. Opublikuj stronę

**W edytorze klasycznym:**
1. Wstaw shortcode bezpośrednio w treści: `[heatpump_calc]`
2. Opublikuj stronę

**W szablonie PHP:**
```php
<?php echo do_shortcode('[heatpump_calc]'); ?>
```

---

## 🏗️ STRUKTURA WTYCZKI

```
heatpump-calculator/
├── heatpump-calculator.php    # Główny plik wtyczki
└── main/                       # Katalog z aplikacją
    ├── kalkulator/
    │   ├── calculator.php      # Template kalkulatora (używany przez shortcode)
    │   ├── calculator.html     # Oryginalny plik HTML (standalone)
    │   ├── css/                # Style CSS
    │   ├── js/                 # Skrypty JavaScript
    │   └── engine/             # Silnik OZC
    ├── konfigurator/
    │   ├── konfigurator.html   # HTML konfiguratora
    │   ├── configurator-unified.js
    │   ├── buffer-engine.js
    │   └── rules/              # Reguły biznesowe
    ├── img/                    # Obrazy
    └── libraries/              # Biblioteki zewnętrzne
```

---

## ⚙️ KONFIGURACJA

### Automatyczna konfiguracja URL

Wtyczka automatycznie generuje poprawne URL do zasobów:
- Style CSS
- Skrypty JavaScript
- Obrazy
- Biblioteki zewnętrzne

Wszystkie ścieżki są dynamicznie generowane przez WordPress API (`plugins_url()`).

### Konfiguracja JavaScript

Wtyczka automatycznie wstrzykuje obiekt `window.HEATPUMP_CONFIG` z konfiguracją:

```javascript
window.HEATPUMP_CONFIG = {
    baseUrl: '...',
    kalkulatorUrl: '...',
    konfiguratorUrl: '...',
    imgUrl: '...',
    librariesUrl: '...',
    ajaxUrl: '...',
    nonce: '...'
};
```

---

## 🔧 WYMAGANIA

### Wymagania systemowe

- **WordPress:** 5.0 lub nowsza wersja
- **PHP:** 7.4 lub nowsza wersja
- **Przeglądarka:** Chrome, Firefox, Edge (najnowsze wersje)

### Wymagania serwera

- Włączone rozszerzenie PHP: `mbstring` (opcjonalnie)
- Włączone rozszerzenie PHP: `json` (standardowo włączone)
- Wystarczająca ilość pamięci PHP (zalecane: 128MB+)

---

## 🐛 ROZWIĄZYWANIE PROBLEMÓW

### Wtyczka nie instaluje się

**Problem:** Błąd podczas instalacji
**Rozwiązanie:**
1. Sprawdź wymagania PHP i WordPress
2. Sprawdź uprawnienia do katalogu `/wp-content/plugins/`
3. Sprawdź logi błędów PHP

### Shortcode nie wyświetla się

**Problem:** Shortcode pokazuje tylko tekst `[heatpump_calc]`
**Rozwiązanie:**
1. Sprawdź czy wtyczka jest aktywowana
2. Sprawdź czy shortcode jest poprawnie zapisany (bez spacji)
3. Sprawdź logi błędów PHP w konsoli przeglądarki

### Style nie ładują się

**Problem:** Kalkulator wyświetla się bez stylów
**Rozwiązanie:**
1. Sprawdź czy pliki CSS istnieją w katalogu `main/kalkulator/css/`
2. Sprawdź uprawnienia do plików
3. Sprawdź logi błędów w konsoli przeglądarki (F12)

### Skrypty nie ładują się

**Problem:** Kalkulator nie działa (brak interakcji)
**Rozwiązanie:**
1. Sprawdź czy pliki JS istnieją w katalogu `main/kalkulator/js/`
2. Sprawdź konsolę przeglądarki pod kątem błędów JavaScript
3. Sprawdź czy `window.HEATPUMP_CONFIG` jest zdefiniowany

---

## 📚 DOKUMENTACJA

### Główne dokumenty

- **[README.md](main/README.md)** - Główna dokumentacja aplikacji
- **[DEVELOPMENT.md](main/dokumentacja/DEVELOPMENT.md)** - Przewodnik dla deweloperów
- **[ARCHITEKTURA.md](main/dokumentacja/ARCHITEKTURA.md)** - Architektura systemu

### Struktura kodu

- **Główny plik wtyczki:** `heatpump-calculator.php`
  - Klasa: `HeatPump_Calculator`
  - Shortcode: `[heatpump_calc]`
  - Hook: `wp_enqueue_scripts`

- **Template kalkulatora:** `main/kalkulator/calculator.php`
  - Renderowany przez shortcode
  - Używa zmiennych z głównego pliku wtyczki

---

## 🔒 BEZPIECZEŃSTWO

### Zabezpieczenia

- ✅ Sprawdzanie `ABSPATH` przed wykonaniem kodu
- ✅ Escapowanie wszystkich outputów (`esc_url()`, `esc_js()`)
- ✅ Nonce dla AJAX requests
- ✅ Walidacja atrybutów shortcode

### Najlepsze praktyki

- Regularnie aktualizuj wtyczkę
- Używaj najnowszej wersji WordPress
- Używaj najnowszej wersji PHP
- Regularnie sprawdzaj logi błędów

---

## 📞 WSPARCIE

### Kontakt

- **Strona:** https://topinstal.com.pl
- **Email:** kontakt@topinstal.com.pl

### Dokumentacja

- **Dokumentacja aplikacji:** `main/README.md`
- **Dokumentacja techniczna:** `main/dokumentacja/`

---

## 📝 CHANGELOG

### 1.0.0 (2025-01-XX)

- ✅ Utworzenie struktury wtyczki WordPress
- ✅ Implementacja shortcode `[heatpump_calc]`
- ✅ Automatyczne enqueue skryptów i stylów
- ✅ Dynamiczne generowanie URL do zasobów
- ✅ Integracja z WordPress API
- ✅ Zabezpieczenia i walidacja

---

**Ostatnia aktualizacja:** 2025-01-XX
**Wersja wtyczki:** 1.0.0

