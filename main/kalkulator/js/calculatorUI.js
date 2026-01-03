/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CALCULATOR UI - Wszystkie skrypty UI przeniesione z calculator.html
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Ten plik zawiera wszystkie inline skrypty JavaScript z calculator.html
 * przeniesione do dedykowanego pliku .js dla lepszej organizacji kodu.
 *
 * REFACTOR: Przeniesione z calculator.html (2025)
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. KONFIGURACJA STANDALONE
  // ═══════════════════════════════════════════════════════════════════════════
  window.topinstal_config = {
    ajax_url: '#',
    plugin_url: './',
    nonce: 'dev-local',
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. OPTION CARDS
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    function initOptionCards() {
      const optionCards = document.querySelectorAll('.option-card');
      if (optionCards.length === 0) {
        setTimeout(initOptionCards, 100);
        return;
      }

      const cardsByField = {};
      optionCards.forEach(card => {
        const fieldName = card.dataset.field;
        if (!fieldName) return;
        if (!cardsByField[fieldName]) {
          cardsByField[fieldName] = [];
        }
        cardsByField[fieldName].push(card);
      });

      Object.keys(cardsByField).forEach(fieldName => {
        const cards = cardsByField[fieldName];
        const hiddenInput = document.getElementById(fieldName);
        if (!hiddenInput) {
          console.warn(`Nie znaleziono ukrytego inputa dla ${fieldName}`);
          return;
        }

        const updateCardsFromInput = () => {
          const value = hiddenInput.value;
          cards.forEach(card => {
            if (card.dataset.value === value) {
              card.classList.add('option-card--selected');
            } else {
              card.classList.remove('option-card--selected');
            }
          });
        };

        const triggerOptionChange = value => {
          hiddenInput.value = value;
          updateCardsFromInput();

          // formEngine automatycznie zareaguje na te eventy
          const changeEvent = new Event('change', { bubbles: true, cancelable: true });
          hiddenInput.dispatchEvent(changeEvent);

          const inputEvent = new Event('input', { bubbles: true, cancelable: true });
          hiddenInput.dispatchEvent(inputEvent);
        };

        cards.forEach(card => {
          card.addEventListener('click', function () {
            const value = this.dataset.value;
            if (!value || this.classList.contains('option-card--disabled')) return;
            triggerOptionChange(value);
          });

          card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              const value = this.dataset.value;
              if (!value || this.classList.contains('option-card--disabled')) return;
              triggerOptionChange(value);
            }
          });
        });

        hiddenInput.addEventListener('change', updateCardsFromInput);
        updateCardsFromInput();
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initOptionCards);
    } else {
      setTimeout(initOptionCards, 100);
    }

    window.addEventListener('load', function () {
      setTimeout(initOptionCards, 200);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CONFIGURATOR LOADER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    // Dynamiczne wczytywanie HTML konfiguratora z osobnego pliku
    function loadConfiguratorView() {
      var container = document.getElementById('configurator-view');
      if (!container) return;

      // Użyj dynamicznego URL z konfiguracji WordPress
      const configUrl = window.HEATPUMP_CONFIG?.konfiguratorUrl || '../konfigurator';
      fetch(`${configUrl}/konfigurator.html`, { cache: 'no-cache' })
        .then(function (response) {
          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }
          return response.text();
        })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var remoteView = doc.getElementById('configurator-view') || doc.body;
          if (!remoteView) {
            console.error(
              '[Configurator] Nie znaleziono #configurator-view w konfigurator.html'
            );
            return;
          }

          console.log('[Configurator] Wstrzykiwanie HTML do #configurator-view');
          container.innerHTML = remoteView.innerHTML;

          // ✅ CZEKAJ aż DOM się zaktualizuje (requestAnimationFrame dla pewności)
          return new Promise(function (resolve) {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                resolve();
              });
            });
          });
        })
        .then(function () {
          // ✅ SPRAWDŹ czy #configurator-app istnieje
          var app = document.getElementById('configurator-app');
          if (!app) {
            console.error(
              '[Configurator] ❌ #configurator-app nie został znaleziony po wstrzyknięciu HTML!'
            );
            var container = document.getElementById('configurator-view');
            if (container) {
              console.log(
                '[Configurator] Zawartość container:',
                container.innerHTML.substring(0, 200)
              );
            }
            return;
          }

          console.log('[Configurator] ✅ #configurator-app znaleziony');

          // ✅ NIE INICJALIZUJ TUTAJ - inicjalizacja będzie wywołana przez resultsRenderer.js
          // po obliczeniach z pełnymi danymi z kalkulatora
          console.log('[Configurator] ℹ️ HTML załadowany - inicjalizacja będzie wywołana po obliczeniach');
        })
        .catch(function (error) {
          console.warn('[Configurator] Nie udało się załadować konfigurator.html:', error);
        });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadConfiguratorView);
    } else {
      loadConfiguratorView();
    }
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. COLLAPSIBLE INSTRUCTION
  // ═══════════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', function () {
    const toggle = document.querySelector('.instruction-toggle');
    const content = document.querySelector('.instruction-content');

    if (toggle && content) {
      toggle.addEventListener('click', function () {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          // Zwiń
          content.style.display = 'none';
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          // Rozwiń
          content.style.display = 'block';
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. BUILDING TYPE CARDS
  // ═══════════════════════════════════════════════════════════════════════════
  // Globalna funkcja pomocnicza do odczytu wartości building_type z hidden inputa
  window.getBuildingType = function () {
    const hidden = document.getElementById('building_type');
    return hidden ? hidden.value || '' : '';
  };

  // Inicjalizacja kart building_type
  let buildingTypeCardsInitialized = false; // ✅ Flaga zapobiegająca wielokrotnej inicjalizacji
  function initBuildingTypeCards() {
    // ✅ Zapobiegaj wielokrotnej inicjalizacji
    if (buildingTypeCardsInitialized) {
      return;
    }

    const buildingTypeCards = document.querySelectorAll('.building-type-card');
    const hiddenInput = document.getElementById('building_type');

    if (buildingTypeCards.length === 0 || !hiddenInput) {
      if (!hiddenInput) {
        console.warn('Nie znaleziono ukrytego pola building_type');
      }
      // Jeśli elementy jeszcze nie istnieją, spróbuj ponownie (tylko raz)
      if (!buildingTypeCardsInitialized) {
        setTimeout(initBuildingTypeCards, 100);
      }
      return;
    }

    // ✅ Oznacz jako zainicjalizowane PRZED dodaniem event listenerów
    buildingTypeCardsInitialized = true;

    function updateCardsFromValue(value) {
      buildingTypeCards.forEach(card => {
        if (card.dataset.value === value) {
          card.classList.add('building-type-card--selected');
        } else {
          card.classList.remove('building-type-card--selected');
        }
      });
    }

    // Funkcja wywołująca wszystkie potrzebne eventy i aktualizacje
    function triggerBuildingTypeChangeInternal(value) {
      // 🔒 Ochrona: nigdy nie ustawiaj building_type na undefined / null / pusty
      if (value === undefined || value === null) {
        console.warn(
          '[BuildingType] Ignoruję próbę ustawienia building_type na undefined/null'
        );
        return;
      }
      if (typeof value === 'string') {
        value = value.trim();
        if (!value) {
          console.warn(
            '[BuildingType] Ignoruję próbę ustawienia building_type na pusty string'
          );
          return;
        }
      }

      // Aktualizuj wizualny stan kart
      updateCardsFromValue(value);

      if (hiddenInput.value !== value) {
        hiddenInput.value = value;

        // formEngine automatycznie zareaguje na te eventy
        const changeEventHidden = new Event('change', {
          bubbles: true,
          cancelable: true,
        });
        hiddenInput.dispatchEvent(changeEventHidden);

        const inputEventHidden = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        hiddenInput.dispatchEvent(inputEventHidden);
      }

      // Utwórz wirtualny event change dla kompatybilności z istniejącymi skryptami (np. urlManager.js)
      const changeEvent = new CustomEvent('building_type_change', {
        bubbles: true,
        cancelable: true,
        detail: { value: value },
      });
      document.dispatchEvent(changeEvent);
    }

    // Eksportuj funkcję globalnie dla urlManager.js i innych skryptów
    window.triggerBuildingTypeChange = triggerBuildingTypeChangeInternal;

    // Obsługa kliknięć na karty
    buildingTypeCards.forEach(card => {
      card.addEventListener('click', function () {
        const value = this.dataset.value;
        triggerBuildingTypeChangeInternal(value);
      });

      // Obsługa klawiatury (Enter, Space)
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const value = this.dataset.value;
          triggerBuildingTypeChangeInternal(value);
        }
      });
    });

    hiddenInput.addEventListener('change', () => {
      updateCardsFromValue(hiddenInput.value);
    });

    // Zsynchronizuj początkowy stan
    updateCardsFromValue(hiddenInput.value);
  }

  // ✅ Inicjalizuj tylko raz - użyj jednego mechanizmu
  // Poczekaj aż calculatorInit.js wypełni DOM z appState
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Poczekaj aż calculatorInit.js zakończy inicjalizację (min. 400ms)
      setTimeout(initBuildingTypeCards, 500);
    });
  } else {
    // DOM już załadowany - poczekaj na calculatorInit.js
    setTimeout(initBuildingTypeCards, 500);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. CONSTRUCTION YEAR CHECKMARK
  // ═══════════════════════════════════════════════════════════════════════════
  function initConstructionYearCheckmark() {
    const constructionYearSelect = document.getElementById('construction_year');
    const wrapper = document.querySelector('.construction-year-wrapper');
    if (!constructionYearSelect || !wrapper) {
      setTimeout(initConstructionYearCheckmark, 100);
      return;
    }

    function updateCheckmark() {
      const value = constructionYearSelect.value;
      // Sprawdź czy select ma wartość
      if (value && value !== '' && value !== '-- Wybierz --') {
        // Stan zakończony pojawia się natychmiast po wybraniu opcji
        wrapper.classList.add('has-value');
        wrapper.classList.add('completed');
      } else {
        wrapper.classList.remove('has-value');
        wrapper.classList.remove('completed');
      }
    }

    // Nasłuchuj na zmiany wartości
    constructionYearSelect.addEventListener('change', () => {
      // Zaktualizuj stan (has-value + completed)
      updateCheckmark();
      // Po wybraniu opcji natychmiast „wyjdź z pola”,
      // żeby nie dało się przypadkowo zmienić wyboru scrollowaniem itp.
      constructionYearSelect.blur();
    });
    constructionYearSelect.addEventListener('input', updateCheckmark);

    // Stany focus/blur – sterują tylko klasą is-active (completed ustawia updateCheckmark)
    constructionYearSelect.addEventListener('focus', () => {
      wrapper.classList.add('is-active');
    });

    constructionYearSelect.addEventListener('blur', () => {
      wrapper.classList.remove('is-active');
    });

    // Obserwuj zmiany wartości
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
          updateCheckmark();
        }
      });
      updateCheckmark();
    });
    observer.observe(constructionYearSelect, {
      attributes: true,
      attributeFilter: ['value', 'selectedIndex'],
    });

    // Inicjalizuj stan na starcie
    updateCheckmark();
  }

  // Inicjalizuj gdy DOM jest gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConstructionYearCheckmark);
  } else {
    setTimeout(initConstructionYearCheckmark, 100);
  }

  // Dodatkowo zainicjalizuj po załadowaniu wszystkich skryptów
  window.addEventListener('load', function () {
    setTimeout(initConstructionYearCheckmark, 200);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. UNIVERSAL SELECT CHECKMARKS
  // ═══════════════════════════════════════════════════════════════════════════
  // Uniwersalny system checkmarków dla wszystkich selectów (oprócz construction_year)
  function initSelectCheckmarks() {
    // Znajdź wszystkie selecty (oprócz construction_year)
    const allSelects = document.querySelectorAll('select.form-select:not(#construction_year)');

    function updateSelectCheckmark(select) {
      const formFieldItem = select.closest('.form-field-item');
      if (!formFieldItem) return;

      const value = select.value;
      const isEmpty =
        !value ||
        value === '' ||
        value === '-- Wybierz --' ||
        value === '-- Wybierz rok budowy --' ||
        value === '-- Wybierz rodzaj budynku --';

      // Dodaj/usuń klasę w zależności od stanu
      if (isEmpty) {
        formFieldItem.classList.remove('has-selected-value');
      } else {
        formFieldItem.classList.add('has-selected-value');
      }
    }

    allSelects.forEach(select => {
      // Nasłuchuj na zmiany
      select.addEventListener('change', function () {
        updateSelectCheckmark(this);
        // Po wybraniu opcji natychmiast „wyjdź z pola”,
        // żeby nie dało się przypadkowo zmienić wyboru scrollowaniem itp.
        this.blur();
      });

      // Focus / blur – sterują klasą is-active-select (stan niebieskiej ramki)
      select.addEventListener('focus', function () {
        const formFieldItem = this.closest('.form-field-item');
        if (!formFieldItem) return;
        formFieldItem.classList.add('is-active-select');
      });

      select.addEventListener('blur', function () {
        const formFieldItem = this.closest('.form-field-item');
        if (!formFieldItem) return;
        formFieldItem.classList.remove('is-active-select');
      });

      // Obserwuj zmiany wartości
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            updateSelectCheckmark(select);
          }
        });
      });
      observer.observe(select, {
        attributes: true,
        attributeFilter: ['value', 'selectedIndex'],
      });

      // Inicjalizuj stan na starcie
      updateSelectCheckmark(select);
    });
  }

  // Inicjalizuj gdy DOM jest gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSelectCheckmarks);
  } else {
    setTimeout(initSelectCheckmarks, 100);
  }

  // Dodatkowo zainicjalizuj po załadowaniu wszystkich skryptów
  window.addEventListener('load', function () {
    setTimeout(initSelectCheckmarks, 200);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. UNIVERSAL NUMBER INPUT CHECKMARKS
  // ═══════════════════════════════════════════════════════════════════════════
  // Uniwersalny system checkmarków dla wszystkich input[type="number"]
  function initNumberInputCheckmarks() {
    // Znajdź wszystkie inputy numeryczne (oprócz tych w quantity-input i custom-slider)
    const allNumberInputs = document.querySelectorAll(
      'input[type="number"]:not(.quantity-input input):not([data-slider-value])'
    );

    // Wartości domyślne dla pól które mają je w HTML
    const defaultValues = {
      building_length: '10',
      building_width: '5',
    };

    function updateNumberInputCheckmark(input) {
      const formFieldItem = input.closest('.form-field-item');
      if (!formFieldItem) return;

      const value = input.value;
      const fieldName = input.name || input.id;
      const defaultValue = defaultValues[fieldName];

      // Sprawdź czy wartość jest rzeczywiście wpisana przez użytkownika
      const isEmpty = !value || value === '' || value === null || value === undefined;
      const isDefaultValue = defaultValue && value === defaultValue;

      // Dodaj/usuń klasę w zależności od stanu
      // Checkmark tylko gdy: nie jest puste, i nie jest wartością domyślną (jeśli istnieje)
      // Uwaga: 0 jest ważną wartością, więc pokazujemy checkmark dla 0 jeśli użytkownik ją wpisał
      if (isEmpty || isDefaultValue) {
        formFieldItem.classList.remove('has-number-value');
      } else {
        formFieldItem.classList.add('has-number-value');
      }
    }

    allNumberInputs.forEach(input => {
      // Zapisz wartość początkową dla pól z wartościami domyślnymi
      const fieldName = input.name || input.id;
      if (defaultValues[fieldName] && !input.dataset.originalValue) {
        input.dataset.originalValue = input.value || defaultValues[fieldName];
      }

      // Nasłuchuj na zmiany
      input.addEventListener('input', function () {
        updateNumberInputCheckmark(this);
      });

      input.addEventListener('change', function () {
        updateNumberInputCheckmark(this);
      });

      // Obserwuj zmiany wartości
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            updateNumberInputCheckmark(input);
          }
        });
      });
      observer.observe(input, {
        attributes: true,
        attributeFilter: ['value'],
      });

      // Inicjalizuj stan na starcie
      updateNumberInputCheckmark(input);
    });
  }

  // Inicjalizuj gdy DOM jest gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNumberInputCheckmarks);
  } else {
    setTimeout(initNumberInputCheckmarks, 100);
  }

  // Dodatkowo zainicjalizuj po załadowaniu wszystkich skryptów
  window.addEventListener('load', function () {
    setTimeout(initNumberInputCheckmarks, 200);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. YES/NO CARDS
  // ═══════════════════════════════════════════════════════════════════════════
  // Uniwersalny system kart Tak/Nie
  function initYesNoCards() {
    const yesNoCards = document.querySelectorAll('.yes-no-card');
    if (yesNoCards.length === 0) {
      setTimeout(initYesNoCards, 100);
      return;
    }

    // Grupuj karty według pola (data-field)
    const cardsByField = {};
    yesNoCards.forEach(card => {
      const fieldName = card.dataset.field;
      if (!cardsByField[fieldName]) {
        cardsByField[fieldName] = [];
      }
      cardsByField[fieldName].push(card);
    });

    // Inicjalizuj każdą grupę kart
    Object.keys(cardsByField).forEach(fieldName => {
      const cards = cardsByField[fieldName];
      const hiddenInput = document.getElementById(fieldName);

      if (!hiddenInput) {
        console.warn(`Nie znaleziono inputa dla pola: ${fieldName}`);
        return;
      }

      // Funkcja aktualizująca stan kart na podstawie inputa
      function updateCardsFromInput() {
        const selectedValue = hiddenInput.value;
        cards.forEach(card => {
          if (card.dataset.value === selectedValue) {
            card.classList.add('yes-no-card--selected');
          } else {
            card.classList.remove('yes-no-card--selected');
          }
        });
      }

      // Funkcja wywołująca wszystkie potrzebne eventy i aktualizacje
      function triggerYesNoChange(value) {
        // Aktualizuj ukryty input
        hiddenInput.value = value;

        // Aktualizuj wizualny stan kart
        updateCardsFromInput();

        // Wywołaj natywny event change
        const changeEvent = new Event('change', {
          bubbles: true,
          cancelable: true,
        });
        hiddenInput.dispatchEvent(changeEvent);

        // Wywołaj również input event
        const inputEvent = new Event('input', {
          bubbles: true,
          cancelable: true,
        });
        hiddenInput.dispatchEvent(inputEvent);

        // formEngine automatycznie zareaguje na te eventy
      }

      // Obsługa kliknięć na karty
      cards.forEach(card => {
        card.addEventListener('click', function () {
          // Sprawdź czy karta nie jest disabled
          if (this.classList.contains('yes-no-card--disabled')) {
            return;
          }
          const value = this.dataset.value;
          triggerYesNoChange(value);
        });

        // Obsługa klawiatury (Enter, Space)
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Sprawdź czy karta nie jest disabled
            if (this.classList.contains('yes-no-card--disabled')) {
              return;
            }
            const value = this.dataset.value;
            triggerYesNoChange(value);
          }
        });
      });

      // Obsługa zmian w input (na wypadek, gdyby coś innego zmieniło wartość)
      hiddenInput.addEventListener('change', function () {
        updateCardsFromInput();
      });

      // Inicjalizuj stan na starcie
      updateCardsFromInput();
    });
  }

  // Inicjalizuj gdy DOM jest gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initYesNoCards);
  } else {
    setTimeout(initYesNoCards, 100);
  }

  // Dodatkowo zainicjalizuj po załadowaniu wszystkich skryptów
  window.addEventListener('load', function () {
    setTimeout(initYesNoCards, 200);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. HELP-BOX VISIBILITY FOR HOT WATER USAGE
  // ═══════════════════════════════════════════════════════════════════════════
  function updateHotWaterUsageHelpBox() {
    const includeHotWaterInput = document.getElementById('include_hot_water');
    const helpBox = document.getElementById('hotWaterUsageHelpBox');

    if (!includeHotWaterInput || !helpBox) {
      return;
    }

    // Pokaż help-box tylko gdy CWU = "yes"
    if (includeHotWaterInput.value === 'yes') {
      helpBox.style.display = 'block';
    } else {
      helpBox.style.display = 'none';
    }
  }

  // Inicjalizuj przy załadowaniu
  function initHotWaterUsageHelpBox() {
    const includeHotWaterInput = document.getElementById('include_hot_water');
    if (!includeHotWaterInput) {
      setTimeout(initHotWaterUsageHelpBox, 100);
      return;
    }

    // Ustaw początkowy stan
    updateHotWaterUsageHelpBox();

    // Nasłuchuj zmian
    includeHotWaterInput.addEventListener('change', updateHotWaterUsageHelpBox);
    includeHotWaterInput.addEventListener('input', updateHotWaterUsageHelpBox);
  }

  // Inicjalizuj gdy DOM jest gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHotWaterUsageHelpBox);
  } else {
    setTimeout(initHotWaterUsageHelpBox, 100);
  }

  // Dodatkowo zainicjalizuj po załadowaniu wszystkich skryptów
  window.addEventListener('load', function () {
    setTimeout(initHotWaterUsageHelpBox, 200);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. PROGRESS LABEL ANIMATION
  // ═══════════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', function () {
    const progressFill = document.getElementById('top-progress-fill');
    const progressLabel = document.querySelector('.form-progress-label');
    const progressPercentage = document.getElementById('progress-percentage');

    if (progressFill && progressLabel && progressPercentage) {
      // Obserwuj zmiany w szerokości progress-bara
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const dataProgress = parseFloat(progressFill.dataset.progress || '0');
            const progressValue = Number.isNaN(dataProgress) ? 0 : dataProgress;

            // Aktualizuj procent
            progressPercentage.textContent = Math.round(progressValue) + '%';

            if (progressValue > 0) {
              // Przesuń napis razem z paskiem (maksymalnie ~16px w prawo)
              const translateX = Math.min(progressValue * 0.18, 16);
              progressLabel.style.transform = `translateX(${translateX}px)`;
              progressLabel.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
              // Reset pozycji gdy progress = 0
              progressLabel.style.transform = 'translateX(0)';
            }
          }
        });
      });

      // Rozpocznij obserwację
      observer.observe(progressFill, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. HELPER FUNCTION FOR UNLOCKING FIELDS
  // ═══════════════════════════════════════════════════════════════════════════
  // Uniwersalna funkcja do odblokowywania pól (używana przez slidery)
  window.unlockFields = function (fieldNames) {
    if (!Array.isArray(fieldNames)) return;

    fieldNames.forEach(fieldName => {
      // Znajdź elementy pola
      let elements;
      try {
        if (fieldName.includes('[')) {
          elements = document.querySelectorAll(`[name="${fieldName}"]`);
        } else {
          elements = document.querySelectorAll(`[name="${fieldName}"], #${fieldName}`);
        }
      } catch (e) {
        console.warn('[unlockFields] Błąd selektora dla:', fieldName, e);
        return;
      }

      elements.forEach(el => {
        el.classList.remove('field-disabled');

        const container =
          el.closest('.form-field-item') ||
          el.closest('.form-field__radio-group') ||
          el.closest('.option-cards') ||
          el.closest('.form-field');
        if (container) {
          container.classList.remove('field-disabled');
        }
      });

      // Odblokuj karty Tak/Nie jeśli są
      const yesNoCards = document.querySelectorAll(`.yes-no-card[data-field="${fieldName}"]`);
      yesNoCards.forEach(card => {
        card.classList.remove('yes-no-card--disabled');
      });
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. PROGRESS STEPS UPDATER
  // ═══════════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', function () {
    // Funkcja do aktualizacji progress steps na podstawie aktywnej sekcji
    function updateProgressSteps() {
      const activeSection = document.querySelector('.section.active');
      if (!activeSection) return;

      const currentTab = parseInt(activeSection.getAttribute('data-tab')) || 0;
      const allSteps = document.querySelectorAll('.progress-step');

      allSteps.forEach((step, index) => {
        const stepNumber = index + 1;

        // Usuń wszystkie klasy
        step.classList.remove('active', 'completed');

        if (stepNumber < currentTab + 1) {
          // Ukończone kroki
          step.classList.add('completed');
          step.textContent = ''; // Checkmark będzie z CSS ::after
        } else if (stepNumber === currentTab + 1) {
          // Aktywny krok
          step.classList.add('active');
          step.textContent = stepNumber;
        } else {
          // Przyszłe kroki
          step.textContent = stepNumber;
        }
      });
    }

    // Aktualizuj na starcie
    updateProgressSteps();

    // Obserwuj zmiany w klasie 'active' na sekcjach
    const sections = document.querySelectorAll('.section');
    const sectionObserver = new MutationObserver(updateProgressSteps);

    sections.forEach(section => {
      sectionObserver.observe(section, {
        attributes: true,
        attributeFilter: ['class'],
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. AKORDEONY DLA WSZYSTKICH SEKCJI WYNIKÓW
  // ═══════════════════════════════════════════════════════════════════════════
  document.addEventListener('DOMContentLoaded', function () {
    // Akordeon dla profilu energetycznego
    const energyProfileSections = document.querySelectorAll('.energy-profile-section');
    energyProfileSections.forEach(section => {
      const title = section.querySelector('.result-title');
      if (title) {
        title.addEventListener('click', function () {
          section.classList.toggle('collapsed');
          const content = section.querySelector('.result-grid');
          const subtitle = section.querySelector('.result-subtitle');
          const dataComment = section.nextElementSibling; // .data-comment jest zaraz po sekcji

          if (section.classList.contains('collapsed')) {
            if (content) content.style.display = 'none';
            if (subtitle) subtitle.style.display = 'none';
            if (dataComment && dataComment.classList.contains('data-comment')) {
              dataComment.style.display = 'none';
            }
          } else {
            if (content) content.style.display = 'table';
            if (subtitle) subtitle.style.display = 'block';
            if (dataComment && dataComment.classList.contains('data-comment')) {
              dataComment.style.display = 'block';
            }
          }
        });
      }
    });

    // Akordeon dla extended-section
    const extendedSections = document.querySelectorAll('.extended-section.accordion-section');
    extendedSections.forEach(section => {
      const title = section.querySelector('.section-title');
      if (title) {
        title.addEventListener('click', function () {
          section.classList.toggle('collapsed');
        });
      }
    });

    // Akordeon dla sekcji rekomendacji pomp
    const pumpRecommendationSection = document.querySelector(
      '.pump-recommendation-section.accordion-section'
    );
    if (pumpRecommendationSection) {
      const header = pumpRecommendationSection.querySelector('.slider-header h3');
      if (header) {
        header.addEventListener('click', function () {
          pumpRecommendationSection.classList.toggle('collapsed');
        });
      }
    }

    // Akordeon dla haier-slider-wrapper
    const pumpSections = document.querySelectorAll('.haier-slider-wrapper.accordion-section');
    pumpSections.forEach(section => {
      const header = section.querySelector('.slider-header h3');
      if (header) {
        header.addEventListener('click', function () {
          section.classList.toggle('collapsed');
        });
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 15. CUSTOM BALCONY SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    let currentValue = 1;
    const MIN = 1;
    const MAX = 6;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customSliderTrack');
      const thumb = document.getElementById('customSliderThumb');
      const bubble = document.getElementById('customBalconyBubble');
      const hiddenInput = document.getElementById('number_balcony_doors');
      const container = track ? track.closest('.custom-slider-container') : null;
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) {
        console.warn('[Slider Balkonów] Brak wymaganych elementów:', {
          track: !!track,
          thumb: !!thumb,
          bubble: !!bubble,
          hiddenInput: !!hiddenInput,
        });
        return;
      }

      if (window.__DEBUG_SLIDER_BALCONY) {
        console.log('[Slider Balkonów] Inicjalizacja rozpoczęta');
      }

      // Funkcja do ustawienia wartości i pozycji
      function setValue(value) {
        // Ogranicz wartość do zakresu MIN-MAX
        value = Math.max(MIN, Math.min(MAX, Math.round(value)));
        currentValue = value;

        if (window.__DEBUG_SLIDER_BALCONY) {
          console.log('[Slider Balkonów] setValue:', value);
        }

        // Oblicz pozycję w procentach (0% dla MIN, 100% dla MAX)
        const percent = ((value - MIN) / (MAX - MIN)) * 100;

        // Ustaw pozycję thumba i bąbelka
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';

        // Aktualizuj tekst w bąbelku i hidden input
        bubble.textContent = value;
        hiddenInput.value = value;

        if (window.__DEBUG_SLIDER_BALCONY) {
          console.log('[Slider Balkonów] Wartość inputa ustawiona na:', hiddenInput.value);
        }

        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);
        if (window.__DEBUG_SLIDER_BALCONY) {
          console.log('[Slider Balkonów] Event input wywołany');
        }

        // Odblokuj pola poniżej slidera (bez wywoływania recompute)
        if (typeof window.unlockFields === 'function') {
          window.unlockFields([
            'building_floors',
            'building_roof',
            'building_heated_floors[]',
            'attic_access',
            'floor_height',
            'garage_type',
          ]);
        }

        // Zaznacz aktywny tick
        ticks.forEach(tick => {
          if (parseInt(tick.dataset.value) === value) {
            tick.classList.add('active');
          } else {
            tick.classList.remove('active');
          }
        });
      }

      // Funkcja do obliczenia wartości na podstawie pozycji kliknięcia
      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const value = Math.round((percent / 100) * (MAX - MIN) + MIN);
        return value;
      }

      // Obsługa przeciągania thumba
      let isDragging = false;

      thumb.addEventListener('mousedown', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        const value = getValueFromPosition(e.clientX);
        setValue(value);
      });

      document.addEventListener('mouseup', function () {
        if (isDragging) {
          isDragging = false;
        }
      });

      // Obsługa kliknięcia na track
      track.addEventListener('click', function (e) {
        if (e.target === thumb) return;
        const value = getValueFromPosition(e.clientX);
        setValue(value);
      });

      // Obsługa kliknięcia na ticki
      ticks.forEach(tick => {
        tick.addEventListener('click', function () {
          const value = parseInt(this.dataset.value);
          setValue(value);
        });
      });

      // Touch support dla urządzeń mobilnych
      thumb.addEventListener('touchstart', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        const value = getValueFromPosition(touch.clientX);
        setValue(value);
      });

      document.addEventListener('touchend', function () {
        if (isDragging) {
          isDragging = false;
        }
      });

      // Inicjalizacja - ustaw wartość 1 na starcie
      setValue(1);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 16. CUSTOM WINDOWS SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    let currentValue = 14;
    const MIN = 4;
    const MAX = 24;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customWindowsTrack');
      const thumb = document.getElementById('customWindowsThumb');
      const bubble = document.getElementById('customWindowsBubble');
      const hiddenInput = document.getElementById('number_windows');
      const container = track.closest('.custom-slider-container');
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value)));
        currentValue = value;
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);

        // Odblokuj pola poniżej slidera (jeśli są zdefiniowane)
        const unlockMap = {
          number_windows: ['number_huge_windows'],
          number_huge_windows: ['doors_type'],
          wall_size: [
            'has_secondary_wall_material',
            'has_external_isolation',
            'internal_wall_isolation[material]',
          ],
          internal_wall_isolation_size: [
            'has_secondary_wall_material',
            'has_external_isolation',
          ],
          top_isolation_size: ['bottom_isolation'],
          indoor_temperature: ['ventilation_type'],
          hot_water_persons: ['hot_water_usage'],
        };

        if (
          hiddenInput &&
          hiddenInput.id &&
          unlockMap[hiddenInput.id] &&
          typeof window.unlockFields === 'function'
        ) {
          window.unlockFields(unlockMap[hiddenInput.id]);
        }

        ticks.forEach(tick => {
          if (parseInt(tick.dataset.value) === value) {
            tick.classList.add('active');
          } else {
            tick.classList.remove('active');
          }
        });
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const value = Math.round((percent / 100) * (MAX - MIN) + MIN);
        return value;
      }

      let isDragging = false;

      thumb.addEventListener('mousedown', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        const value = getValueFromPosition(e.clientX);
        setValue(value);
      });

      document.addEventListener('mouseup', function () {
        if (isDragging) isDragging = false;
      });

      track.addEventListener('click', function (e) {
        if (e.target === thumb) return;
        const value = getValueFromPosition(e.clientX);
        setValue(value);
      });

      ticks.forEach(tick => {
        tick.addEventListener('click', function () {
          const value = parseInt(this.dataset.value);
          setValue(value);
        });
      });

      thumb.addEventListener('touchstart', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        const value = getValueFromPosition(touch.clientX);
        setValue(value);
      });

      document.addEventListener('touchend', function () {
        if (isDragging) isDragging = false;
      });

      setValue(14);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 17. CUSTOM DOORS SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    let currentValue = 1;
    const MIN = 1;
    const MAX = 4;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customDoorsTrack');
      const thumb = document.getElementById('customDoorsThumb');
      const bubble = document.getElementById('customDoorsBubble');
      const hiddenInput = document.getElementById('number_doors');
      const container = track.closest('.custom-slider-container');
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value)));
        currentValue = value;
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);

        // Odblokuj pola poniżej slidera (jeśli są zdefiniowane)
        const unlockMap = {
          number_windows: ['number_huge_windows'],
          number_huge_windows: ['doors_type'],
          wall_size: [
            'has_secondary_wall_material',
            'has_external_isolation',
            'internal_wall_isolation[material]',
          ],
          internal_wall_isolation_size: [
            'has_secondary_wall_material',
            'has_external_isolation',
          ],
          top_isolation_size: ['bottom_isolation'],
          indoor_temperature: ['ventilation_type'],
          hot_water_persons: ['hot_water_usage'],
        };

        if (
          hiddenInput &&
          hiddenInput.id &&
          unlockMap[hiddenInput.id] &&
          typeof window.unlockFields === 'function'
        ) {
          window.unlockFields(unlockMap[hiddenInput.id]);
        }

        ticks.forEach(tick => {
          if (parseInt(tick.dataset.value) === value) {
            tick.classList.add('active');
          } else {
            tick.classList.remove('active');
          }
        });
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const value = Math.round((percent / 100) * (MAX - MIN) + MIN);
        return value;
      }

      let isDragging = false;

      thumb.addEventListener('mousedown', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        const value = getValueFromPosition(e.clientX);
        setValue(value);
      });

      document.addEventListener('mouseup', function () {
        if (isDragging) isDragging = false;
      });

      track.addEventListener('click', function (e) {
        if (e.target === thumb) return;
        const value = getValueFromPosition(e.clientX);
        setValue(value);
      });

      ticks.forEach(tick => {
        tick.addEventListener('click', function () {
          const value = parseInt(this.dataset.value);
          setValue(value);
        });
      });

      thumb.addEventListener('touchstart', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        const value = getValueFromPosition(touch.clientX);
        setValue(value);
      });

      document.addEventListener('touchend', function () {
        if (isDragging) isDragging = false;
      });

      setValue(1);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 18. CUSTOM HUGE WINDOWS SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    let currentValue = 0;
    const MIN = 0;
    const MAX = 5;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customHugeWindowsTrack');
      const thumb = document.getElementById('customHugeWindowsThumb');
      const bubble = document.getElementById('customHugeWindowsBubble');
      const hiddenInput = document.getElementById('number_huge_windows');
      const container = track.closest('.custom-slider-container');
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value)));
        currentValue = value;
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);

        // Odblokuj pola poniżej slidera (jeśli są zdefiniowane)
        const unlockMap = {
          number_windows: ['number_huge_windows'],
          number_huge_windows: ['doors_type'],
          wall_size: [
            'has_secondary_wall_material',
            'has_external_isolation',
            'internal_wall_isolation[material]',
          ],
          internal_wall_isolation_size: [
            'has_secondary_wall_material',
            'has_external_isolation',
          ],
          top_isolation_size: ['bottom_isolation'],
          indoor_temperature: ['ventilation_type'],
          hot_water_persons: ['hot_water_usage'],
        };

        if (
          hiddenInput &&
          hiddenInput.id &&
          unlockMap[hiddenInput.id] &&
          typeof window.unlockFields === 'function'
        ) {
          window.unlockFields(unlockMap[hiddenInput.id]);
        }

        ticks.forEach(tick => {
          if (parseInt(tick.dataset.value) === value) {
            tick.classList.add('active');
          } else {
            tick.classList.remove('active');
          }
        });
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const value = Math.round((percent / 100) * (MAX - MIN) + MIN);
        return value;
      }

      let isDragging = false;

      thumb.addEventListener('mousedown', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        const value = getValueFromPosition(e.clientX);
        setValue(value);
      });

      document.addEventListener('mouseup', function () {
        if (isDragging) isDragging = false;
      });

      track.addEventListener('click', function (e) {
        if (e.target === thumb) return;
        const value = getValueFromPosition(e.clientX);
        setValue(value);
      });

      ticks.forEach(tick => {
        tick.addEventListener('click', function () {
          const value = parseInt(this.dataset.value);
          setValue(value);
        });
      });

      thumb.addEventListener('touchstart', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        const value = getValueFromPosition(touch.clientX);
        setValue(value);
      });

      document.addEventListener('touchend', function () {
        if (isDragging) isDragging = false;
      });

      setValue(0);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 19. CUSTOM PERSONS SLIDER (niestandardowe wartości)
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    // Mapowanie pozycji slidera na wartości formularza
    const VALUES = [2, 3, 4, 6, 8]; // Odpowiada pozycjom 0, 1, 2, 3, 4
    const LABELS = ['1-2', '3', '4', '5-6', '7+'];
    let currentPosition = 2; // Domyślnie pozycja 2 (wartość 4)

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customPersonsTrack');
      const thumb = document.getElementById('customPersonsThumb');
      const bubble = document.getElementById('customPersonsBubble');
      const hiddenInput = document.getElementById('hot_water_persons');
      const container = track.closest('.custom-slider-container');
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(position) {
        position = Math.max(0, Math.min(VALUES.length - 1, Math.round(position)));
        currentPosition = position;

        const percent = (position / (VALUES.length - 1)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';

        const actualValue = VALUES[position];
        const label = LABELS[position];

        bubble.textContent = label;
        hiddenInput.value = actualValue;

        ticks.forEach((tick, index) => {
          if (index === position) {
            tick.classList.add('active');
          } else {
            tick.classList.remove('active');
          }
        });
      }

      function getPositionFromClick(clientX) {
        const rect = track.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        const position = Math.round((percent / 100) * (VALUES.length - 1));
        return position;
      }

      let isDragging = false;

      thumb.addEventListener('mousedown', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        const position = getPositionFromClick(e.clientX);
        setValue(position);
      });

      document.addEventListener('mouseup', function () {
        if (isDragging) isDragging = false;
      });

      track.addEventListener('click', function (e) {
        if (e.target === thumb) return;
        const position = getPositionFromClick(e.clientX);
        setValue(position);
      });

      ticks.forEach((tick, index) => {
        tick.addEventListener('click', function () {
          setValue(index);
        });
      });

      thumb.addEventListener('touchstart', function (e) {
        isDragging = true;
        e.preventDefault();
      });

      document.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        const position = getPositionFromClick(touch.clientX);
        setValue(position);
      });

      document.addEventListener('touchend', function () {
        if (isDragging) isDragging = false;
      });

      setValue(2); // Domyślnie pozycja 2 (4 osoby)
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 20. CUSTOM WALL INSULATION SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    const MIN = 5,
      MAX = 35,
      STEP = 5,
      DEFAULT = 15;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customWallInsulationTrack');
      const thumb = document.getElementById('customWallInsulationThumb');
      const bubble = document.getElementById('customWallInsulationBubble');
      const hiddenInput = document.getElementById('external_wall_isolation_size');
      const container = track ? track.closest('.custom-slider-container') : null;
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value / STEP) * STEP));
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);
        // formEngine automatycznie obsłuży event input (updateFieldState → recompute)

        ticks.forEach(tick =>
          tick.classList.toggle('active', parseInt(tick.dataset.value) === value)
        );
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        return Math.round((percent / 100) * (MAX - MIN) + MIN);
      }

      let isDragging = false;
      thumb.addEventListener('mousedown', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'mousemove',
        e => isDragging && setValue(getValueFromPosition(e.clientX))
      );
      document.addEventListener('mouseup', () => (isDragging = false));
      track.addEventListener(
        'click',
        e => e.target !== thumb && setValue(getValueFromPosition(e.clientX))
      );
      ticks.forEach(tick =>
        tick.addEventListener('click', () => setValue(parseInt(tick.dataset.value)))
      );
      thumb.addEventListener('touchstart', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'touchmove',
        e => isDragging && setValue(getValueFromPosition(e.touches[0].clientX))
      );
      document.addEventListener('touchend', () => (isDragging = false));
      setValue(DEFAULT);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 21. CUSTOM ROOF INSULATION SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    const MIN = 10,
      MAX = 45,
      STEP = 5,
      DEFAULT = 30;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customRoofInsulationTrack');
      const thumb = document.getElementById('customRoofInsulationThumb');
      const bubble = document.getElementById('customRoofInsulationBubble');
      const hiddenInput = document.getElementById('top_isolation_size');
      const container = track ? track.closest('.custom-slider-container') : null;
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value / STEP) * STEP));
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);
        // formEngine automatycznie obsłuży event input (updateFieldState → recompute)

        ticks.forEach(tick =>
          tick.classList.toggle('active', parseInt(tick.dataset.value) === value)
        );
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        return Math.round((percent / 100) * (MAX - MIN) + MIN);
      }

      let isDragging = false;
      thumb.addEventListener('mousedown', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'mousemove',
        e => isDragging && setValue(getValueFromPosition(e.clientX))
      );
      document.addEventListener('mouseup', () => (isDragging = false));
      track.addEventListener(
        'click',
        e => e.target !== thumb && setValue(getValueFromPosition(e.clientX))
      );
      ticks.forEach(tick =>
        tick.addEventListener('click', () => setValue(parseInt(tick.dataset.value)))
      );
      thumb.addEventListener('touchstart', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'touchmove',
        e => isDragging && setValue(getValueFromPosition(e.touches[0].clientX))
      );
      document.addEventListener('touchend', () => (isDragging = false));
      setValue(DEFAULT);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 22. CUSTOM FLOOR INSULATION SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    const MIN = 5,
      MAX = 30,
      STEP = 5,
      DEFAULT = 15;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customFloorInsulationTrack');
      const thumb = document.getElementById('customFloorInsulationThumb');
      const bubble = document.getElementById('customFloorInsulationBubble');
      const hiddenInput = document.getElementById('bottom_isolation_size');
      const container = track ? track.closest('.custom-slider-container') : null;
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value / STEP) * STEP));
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);
        // formEngine automatycznie obsłuży event input (updateFieldState → recompute)

        ticks.forEach(tick =>
          tick.classList.toggle('active', parseInt(tick.dataset.value) === value)
        );
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        return Math.round((percent / 100) * (MAX - MIN) + MIN);
      }

      let isDragging = false;
      thumb.addEventListener('mousedown', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'mousemove',
        e => isDragging && setValue(getValueFromPosition(e.clientX))
      );
      document.addEventListener('mouseup', () => (isDragging = false));
      track.addEventListener(
        'click',
        e => e.target !== thumb && setValue(getValueFromPosition(e.clientX))
      );
      ticks.forEach(tick =>
        tick.addEventListener('click', () => setValue(parseInt(tick.dataset.value)))
      );
      thumb.addEventListener('touchstart', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'touchmove',
        e => isDragging && setValue(getValueFromPosition(e.touches[0].clientX))
      );
      document.addEventListener('touchend', () => (isDragging = false));
      setValue(DEFAULT);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 23. CUSTOM INTERNAL WALL INSULATION SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    const MIN = 5,
      MAX = 30,
      STEP = 5,
      DEFAULT = 5;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customInternalInsulationTrack');
      const thumb = document.getElementById('customInternalInsulationThumb');
      const bubble = document.getElementById('customInternalInsulationBubble');
      const hiddenInput = document.getElementById('internal_wall_isolation_size');
      const container = track ? track.closest('.custom-slider-container') : null;
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value / STEP) * STEP));
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);
        // formEngine automatycznie obsłuży event input (updateFieldState → recompute)

        ticks.forEach(tick =>
          tick.classList.toggle('active', parseInt(tick.dataset.value) === value)
        );
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        return Math.round((percent / 100) * (MAX - MIN) + MIN);
      }

      let isDragging = false;
      thumb.addEventListener('mousedown', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'mousemove',
        e => isDragging && setValue(getValueFromPosition(e.clientX))
      );
      document.addEventListener('mouseup', () => (isDragging = false));
      track.addEventListener(
        'click',
        e => e.target !== thumb && setValue(getValueFromPosition(e.clientX))
      );
      ticks.forEach(tick =>
        tick.addEventListener('click', () => setValue(parseInt(tick.dataset.value)))
      );
      thumb.addEventListener('touchstart', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'touchmove',
        e => isDragging && setValue(getValueFromPosition(e.touches[0].clientX))
      );
      document.addEventListener('touchend', () => (isDragging = false));
      setValue(DEFAULT);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 24. CUSTOM TEMPERATURE SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    const MIN = 17,
      MAX = 25,
      DEFAULT = 21;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customTemperatureTrack');
      const thumb = document.getElementById('customTemperatureThumb');
      const bubble = document.getElementById('customTemperatureBubble');
      const hiddenInput = document.getElementById('indoor_temperature');
      const container = track ? track.closest('.custom-slider-container') : null;
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value)));
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);
        // formEngine automatycznie obsłuży event input (updateFieldState → recompute)

        ticks.forEach(tick =>
          tick.classList.toggle('active', parseInt(tick.dataset.value) === value)
        );
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        return Math.round((percent / 100) * (MAX - MIN) + MIN);
      }

      let isDragging = false;
      thumb.addEventListener('mousedown', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'mousemove',
        e => isDragging && setValue(getValueFromPosition(e.clientX))
      );
      document.addEventListener('mouseup', () => (isDragging = false));
      track.addEventListener(
        'click',
        e => e.target !== thumb && setValue(getValueFromPosition(e.clientX))
      );
      ticks.forEach(tick =>
        tick.addEventListener('click', () => setValue(parseInt(tick.dataset.value)))
      );
      thumb.addEventListener('touchstart', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'touchmove',
        e => isDragging && setValue(getValueFromPosition(e.touches[0].clientX))
      );
      document.addEventListener('touchend', () => (isDragging = false));
      setValue(DEFAULT);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 25. CUSTOM WALL SIZE SLIDER
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    const MIN = 20,
      MAX = 80,
      STEP = 5,
      DEFAULT = 50;

    document.addEventListener('DOMContentLoaded', function () {
      const track = document.getElementById('customWallSizeTrack');
      const thumb = document.getElementById('customWallSizeThumb');
      const bubble = document.getElementById('customWallSizeBubble');
      const hiddenInput = document.getElementById('wall_size');
      const container = track ? track.closest('.custom-slider-container') : null;
      const ticks = container ? container.querySelectorAll('.custom-slider-ticks .tick') : [];

      if (!track || !thumb || !bubble || !hiddenInput) return;

      function setValue(value) {
        value = Math.max(MIN, Math.min(MAX, Math.round(value / STEP) * STEP));
        const percent = ((value - MIN) / (MAX - MIN)) * 100;
        thumb.style.left = percent + '%';
        bubble.style.left = percent + '%';
        bubble.textContent = value;
        hiddenInput.value = value;
        const sliderInputEvent = new Event('input', { bubbles: true, cancelable: true });
        hiddenInput.dispatchEvent(sliderInputEvent);
        // formEngine automatycznie obsłuży event input (updateFieldState → recompute)

        ticks.forEach(tick =>
          tick.classList.toggle('active', parseInt(tick.dataset.value) === value)
        );
      }

      function getValueFromPosition(clientX) {
        const rect = track.getBoundingClientRect();
        const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        return Math.round((percent / 100) * (MAX - MIN) + MIN);
      }

      let isDragging = false;
      thumb.addEventListener('mousedown', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'mousemove',
        e => isDragging && setValue(getValueFromPosition(e.clientX))
      );
      document.addEventListener('mouseup', () => (isDragging = false));
      track.addEventListener(
        'click',
        e => e.target !== thumb && setValue(getValueFromPosition(e.clientX))
      );
      ticks.forEach(tick =>
        tick.addEventListener('click', () => setValue(parseInt(tick.dataset.value)))
      );
      thumb.addEventListener('touchstart', e => {
        isDragging = true;
        e.preventDefault();
      });
      document.addEventListener(
        'touchmove',
        e => isDragging && setValue(getValueFromPosition(e.touches[0].clientX))
      );
      document.addEventListener('touchend', () => (isDragging = false));
      setValue(DEFAULT);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 26. QUANTITY INPUT
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    function initQuantityInputs() {
      const quantityInputs = document.querySelectorAll('.quantity-input');

      quantityInputs.forEach(fieldset => {
        const input = fieldset.querySelector('input[type="number"]');
        const subBtn = fieldset.querySelector('.quantity-btn--sub');
        const addBtn = fieldset.querySelector('.quantity-btn--add');

        if (!input || !subBtn || !addBtn) return;

        const step = parseFloat(input.getAttribute('step')) || 0.5;
        const min = parseFloat(input.getAttribute('min')) || 0;
        const max = parseFloat(input.getAttribute('max')) || Infinity;

        function updateButtons() {
          const value = parseFloat(input.value) || 0;
          subBtn.disabled = value <= min;
          addBtn.disabled = value >= max;
        }

        function changeValue(delta) {
          const currentValue = parseFloat(input.value) || 0;
          const newValue = Math.max(min, Math.min(max, currentValue + delta));

          input.value = newValue;

          // Wywołaj event change dla progressive disclosure
          const changeEvent = new Event('change', { bubbles: true, cancelable: true });
          input.dispatchEvent(changeEvent);

          const inputEvent = new Event('input', { bubbles: true, cancelable: true });
          input.dispatchEvent(inputEvent);

          updateButtons();
        }

        subBtn.addEventListener('click', () => changeValue(-step));
        addBtn.addEventListener('click', () => changeValue(step));

        input.addEventListener('input', updateButtons);
        input.addEventListener('change', updateButtons);

        updateButtons();
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initQuantityInputs);
    } else {
      initQuantityInputs();
    }

    window.addEventListener('load', () => {
      setTimeout(initQuantityInputs, 100);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 27. SLIDER CONFIRM BUTTONS
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    function initSliderConfirmButtons() {
      const containers = document.querySelectorAll('.custom-slider-container');
      containers.forEach(container => {
        if (container.dataset.sliderConfirmInit === 'true') {
          return;
        }
        const hiddenInput = container.querySelector('input[type="hidden"][id]');
        const button = container.querySelector('.slider-confirm-card');
        if (!hiddenInput || !button) {
          // Ciche pominięcie - niektóre slidery mogą nie mieć przycisku potwierdzenia
          return;
        }

        container.dataset.sliderConfirmInit = 'true';
        hiddenInput.dataset.requiresConfirm = hiddenInput.dataset.requiresConfirm || 'true';
        hiddenInput.dataset.sliderConfirmed = hiddenInput.dataset.sliderConfirmed || 'false';

        const targetId = button.dataset.sliderTarget || hiddenInput.id;
        if (targetId && targetId !== hiddenInput.id) {
          console.warn(
            `Przycisk potwierdzenia slidera wskazuje ${targetId}, ale znaleziono ${hiddenInput.id}`
          );
        }

        const syncState = () => {
          const isConfirmed = hiddenInput.dataset.sliderConfirmed === 'true';

          // Przycisk zawsze enabled
          button.disabled = false;

          button.setAttribute('aria-pressed', isConfirmed ? 'true' : 'false');
          container.classList.toggle('slider-confirmed', isConfirmed);
          button.classList.toggle('slider-confirm-card--confirmed', isConfirmed);
        };

        button.addEventListener('click', () => {
          // Log tylko w trybie debug
          if (window.__DEBUG_SLIDER_CONFIRM) {
            console.log(
              '[Slider Confirm] Kliknięto przycisk potwierdzenia dla:',
              hiddenInput.id,
              'wartość:',
              hiddenInput.value
            );
          }

          // Zaznacz slider jako potwierdzony
          hiddenInput.dataset.sliderConfirmed = 'true';
          hiddenInput.dataset.lastConfirmedValue = hiddenInput.value;
          syncState();

          // BEZPOŚREDNIE ODBLOKOWANIE PÓL - bez refresh, bez recompute, bez dotykania innych wartości
          const fieldId = hiddenInput.id;

          // Mapowanie: który slider odblokowuje które pola
          const unlockMap = {
            number_balcony_doors: [
              'building_floors',
              'building_roof',
              'building_heated_floors[]',
              'attic_access',
              'floor_height',
              'garage_type',
            ],
            wall_size: [
              'has_secondary_wall_material',
              'has_external_isolation',
              'internal_wall_isolation[material]',
            ],
            internal_wall_isolation_size: [
              'has_secondary_wall_material',
              'has_external_isolation',
            ],
            number_windows: ['number_huge_windows'],
            number_huge_windows: ['doors_type'],
            number_doors: [], // Odblokowuje przycisk "Dalej" w sekcji 3
            top_isolation_size: ['bottom_isolation'],
            indoor_temperature: ['ventilation_type'],
            hot_water_persons: ['hot_water_usage'],
          };

          const fieldsToUnlock = unlockMap[fieldId] || [];

          fieldsToUnlock.forEach(fieldName => {
            // Znajdź elementy pola (obsługa nazw z [] jak building_heated_floors[])
            let elements;
            try {
              // Dla pól z [] w nazwie używaj tylko [name="..."]
              if (fieldName.includes('[')) {
                elements = document.querySelectorAll(`[name="${fieldName}"]`);
              } else {
                elements = document.querySelectorAll(`[name="${fieldName}"], #${fieldName}`);
              }
            } catch (e) {
              console.warn('[Slider Confirm] Błąd selektora dla:', fieldName, e);
              elements = [];
            }

            elements.forEach(el => {
              // Usuń klasę disabled
              el.classList.remove('field-disabled');

              // Odblokuj kontener
              const container =
                el.closest('.form-field-item') ||
                el.closest('.form-field__radio-group') ||
                el.closest('.option-cards') ||
                el.closest('.form-field');
              if (container) {
                container.classList.remove('field-disabled');
              }
            });

            // Odblokuj karty Tak/Nie jeśli są
            const yesNoCards = document.querySelectorAll(
              `.yes-no-card[data-field="${fieldName}"]`
            );
            yesNoCards.forEach(card => {
              card.classList.remove('yes-no-card--disabled');
            });
          });

          // Dla number_doors: odśwież przycisk "Dalej" w sekcji 3
          if (fieldId === 'number_doors') {
            if (window.formEngine && typeof window.formEngine.updateSectionButtons === 'function') {
              setTimeout(() => {
                window.formEngine.updateSectionButtons();
              }, 100);
            }
          }

          // NIE wywołuj updateSectionButtons() dla innych sliderów - może resetować wartości przez cache
          // Przyciski sekcji będą zaktualizowane przy następnej zmianie pola

          // Log tylko w trybie debug
          if (window.__DEBUG_SLIDER_CONFIRM) {
            console.log('[Slider Confirm] Odblokowano pola:', fieldsToUnlock);
          }
        });

        hiddenInput.addEventListener('input', () => {
          // Log tylko w trybie debug
          if (window.__DEBUG_SLIDER_CONFIRM) {
            console.log(
              '[Slider Confirm] Event input otrzymany dla:',
              hiddenInput.id,
              'wartość:',
              hiddenInput.value
            );
          }
          // NIE resetuj potwierdzenia - po pierwszym potwierdzeniu pole pozostaje odblokowane
          // Aktualizuj tylko lastConfirmedValue dla informacji
          hiddenInput.dataset.lastConfirmedValue = hiddenInput.value;
          // Jeśli slider był już potwierdzony, upewnij się że pozostaje potwierdzony
          if (hiddenInput.dataset.sliderConfirmed === 'true') {
            // Pozostaw potwierdzony - nie resetuj
            syncState();
          }
          // formEngine automatycznie zareaguje na event input
        });

        const observer = new MutationObserver(() => {
          syncState();
        });
        observer.observe(hiddenInput, { attributes: true, attributeFilter: ['value'] });

        // Obserwuj zmiany widoczności kontenera
        const containerObserver = new MutationObserver(() => {
          syncState();
        });
        containerObserver.observe(container, {
          attributes: true,
          attributeFilter: ['style', 'class'],
        });

        syncState();
      });
    }

    // Funkcja pomocnicza dla zewnętrznych wywołań (zachowana dla kompatybilności)
    window.handleSliderConfirm = function (fieldName) {
      const hiddenInput = document.getElementById(fieldName);
      if (!hiddenInput) return;

      // formEngine automatycznie zareaguje na te eventy
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      hiddenInput.dispatchEvent(changeEvent);

      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      hiddenInput.dispatchEvent(inputEvent);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSliderConfirmButtons);
    } else {
      initSliderConfirmButtons();
    }

    window.addEventListener('load', () => {
      setTimeout(initSliderConfirmButtons, 100);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 27B. DIMENSIONS CONFIRM BUTTON
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    function initDimensionsConfirmButton() {
      const dimensionsContainer = document.querySelector('#dimensionsFields');
      const confirmButton = document.querySelector('#dimensions-confirm-btn');

      if (!dimensionsContainer || !confirmButton) {
        return;
      }

      // Inicjalizuj stan
      dimensionsContainer.dataset.dimensionsConfirmed =
        dimensionsContainer.dataset.dimensionsConfirmed || 'false';
      confirmButton.dataset.dimensionsConfirmed =
        confirmButton.dataset.dimensionsConfirmed || 'false';

      const syncState = () => {
        const isConfirmed = dimensionsContainer.dataset.dimensionsConfirmed === 'true';
        confirmButton.setAttribute('aria-pressed', isConfirmed ? 'true' : 'false');
        confirmButton.classList.toggle('slider-confirm-card--confirmed', isConfirmed);
        confirmButton.dataset.dimensionsConfirmed = isConfirmed ? 'true' : 'false';
      };

      confirmButton.addEventListener('click', () => {
        const lengthInput = document.querySelector('#building_length');
        const widthInput = document.querySelector('#building_width');

        if (!lengthInput || !widthInput) {
          console.warn('[Dimensions Confirm] Brak pól wymiarów');
          return;
        }

        const length = parseFloat(lengthInput.value);
        const width = parseFloat(widthInput.value);

        if (!length || !width || length <= 0 || width <= 0) {
          console.warn('[Dimensions Confirm] Wymiary nie są poprawne');
          return;
        }

        // Oznacz jako potwierdzone
        dimensionsContainer.dataset.dimensionsConfirmed = 'true';
        syncState();

        // Odśwież formEngine aby odblokować has_basement
        // Użyj setTimeout aby upewnić się, że DOM jest zaktualizowany
        setTimeout(() => {
          if (window.formEngine) {
            // Wywołaj softRefresh - to przeliczy enablement na podstawie aktualnego stanu
            // (dimensionsConfirmed() sprawdzi data-dimensions-confirmed w DOM)
            if (typeof window.formEngine.softRefresh === 'function') {
              window.formEngine.softRefresh();
            }
            // Dodatkowo wywołaj refreshField dla has_basement (dla pewności)
            if (typeof window.formEngine.refreshField === 'function') {
              window.formEngine.refreshField('has_basement');
            }
          }

          if (window.progressiveDisclosure) {
            if (typeof window.progressiveDisclosure.updateButton === 'function') {
              window.progressiveDisclosure.updateButton();
            }
          }
        }, 10);

        console.log('[Dimensions Confirm] Wymiary potwierdzone:', { length, width });
      });

      // Obserwuj zmiany w polach wymiarów - resetuj potwierdzenie jeśli się zmienią
      const lengthInput = document.querySelector('#building_length');
      const widthInput = document.querySelector('#building_width');

      if (lengthInput) {
        lengthInput.addEventListener('input', () => {
          if (dimensionsContainer.dataset.dimensionsConfirmed === 'true') {
            dimensionsContainer.dataset.dimensionsConfirmed = 'false';
            syncState();
            if (window.formEngine) {
              if (typeof window.formEngine.refreshField === 'function') {
                window.formEngine.refreshField('has_basement');
              }
              if (typeof window.formEngine.softRefresh === 'function') {
                window.formEngine.softRefresh();
              }
            }
          }
        });
      }

      if (widthInput) {
        widthInput.addEventListener('input', () => {
          if (dimensionsContainer.dataset.dimensionsConfirmed === 'true') {
            dimensionsContainer.dataset.dimensionsConfirmed = 'false';
            syncState();
            if (window.formEngine) {
              if (typeof window.formEngine.refreshField === 'function') {
                window.formEngine.refreshField('has_basement');
              }
              if (typeof window.formEngine.softRefresh === 'function') {
                window.formEngine.softRefresh();
              }
            }
          }
        });
      }

      syncState();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDimensionsConfirmButton);
    } else {
      initDimensionsConfirmButton();
    }

    window.addEventListener('load', () => {
      setTimeout(initDimensionsConfirmButton, 100);
    });
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 28. FORCE VISIBILITY OF BALCONY FIELDS
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    function forceBalconyVisibility() {
      // Wymuś widoczność pola balkonów
      const balconyFieldItem = document
        .querySelector('#has_balcony')
        ?.closest('.form-field-item');
      if (balconyFieldItem) {
        balconyFieldItem.style.display = 'block';
        balconyFieldItem.classList.remove('hidden');
        if (window.__DEBUG_FORCE_VISIBILITY) {
          console.log('[forceVisibility] Wymuszono widoczność pola balkonów');
        }
      }

      // Wymuś widoczność kontenera balconyFields (slider) - tylko jeśli has_balcony === 'yes'
      // To jest OK, że jest ukryty na początku
    }

    // Wykonaj natychmiast
    forceBalconyVisibility();

    // Wykonaj po załadowaniu DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', forceBalconyVisibility);
    }

    // Wykonaj po załadowaniu wszystkich skryptów
    window.addEventListener('load', function () {
      setTimeout(forceBalconyVisibility, 100);
    });

    // Wykonaj po inicjalizacji formEngine
    const checkFormEngine = setInterval(function () {
      if (window.formEngine && window.formEngine.init) {
        setTimeout(forceBalconyVisibility, 200);
        clearInterval(checkFormEngine);
      }
    }, 100);

    // Zatrzymaj sprawdzanie po 5 sekundach
    setTimeout(function () {
      clearInterval(checkFormEngine);
    }, 5000);
  })();

  // ═══════════════════════════════════════════════════════════════════════════
  // 29. UPROSZCZONY TRYB IZOLACJI - przełączanie trybów dla single_house
  // ═══════════════════════════════════════════════════════════════════════════
  (function () {
    'use strict';

    // NOWA FUNKCJA: Per-field przełączanie trybu izolacji
    function setupPerFieldInsulationMode() {
      const wallsCheckbox = document.getElementById('walls_insulation_detailed_mode');
      const roofCheckbox = document.getElementById('roof_insulation_detailed_mode');
      const floorCheckbox = document.getElementById('floor_insulation_detailed_mode');

      if (!wallsCheckbox || !roofCheckbox || !floorCheckbox) {
        // Jeśli checkboxy nie istnieją, spróbuj ponownie później
        setTimeout(setupPerFieldInsulationMode, 100);
        return;
      }

      // Funkcja do przełączania widoczności pola (uproszczone vs szczegółowe)
      function toggleFieldVisibility(fieldType, isDetailed) {
        const simplifiedField = document.getElementById(`${fieldType}-simplified-field`);
        const detailedField = document.getElementById(`${fieldType}-detailed-field`);

        if (simplifiedField && detailedField) {
          if (isDetailed) {
            simplifiedField.classList.add('hidden');
            simplifiedField.style.display = 'none';
            detailedField.classList.remove('hidden');
            detailedField.style.display = '';
          } else {
            detailedField.classList.add('hidden');
            detailedField.style.display = 'none';
            simplifiedField.classList.remove('hidden');
            simplifiedField.style.display = '';
          }
        }
      }

      // Funkcja do aktualizacji widoczności wszystkich pól
      function updateAllFieldsVisibility() {
        toggleFieldVisibility('walls', wallsCheckbox.checked);
        toggleFieldVisibility('roof', roofCheckbox.checked);
        toggleFieldVisibility('floor', floorCheckbox.checked);

        // Odśwież formEngine
        if (window.formEngine && window.formEngine.softRefresh) {
          setTimeout(() => {
            window.formEngine.softRefresh();
          }, 100);
        }
      }

      // Listenery dla każdego checkboxa
      wallsCheckbox.addEventListener('change', function () {
        const value = this.checked ? 'yes' : 'no';
        if (window.formEngine && window.formEngine.state && window.formEngine.state.setValue) {
          window.formEngine.state.setValue('walls_insulation_detailed_mode', value);
          if (window.formEngine.refreshField) {
            window.formEngine.refreshField('walls_insulation_detailed_mode');
          }
        }
        toggleFieldVisibility('walls', this.checked);
        updateAllFieldsVisibility();
      });

      roofCheckbox.addEventListener('change', function () {
        const value = this.checked ? 'yes' : 'no';
        if (window.formEngine && window.formEngine.state && window.formEngine.state.setValue) {
          window.formEngine.state.setValue('roof_insulation_detailed_mode', value);
          if (window.formEngine.refreshField) {
            window.formEngine.refreshField('roof_insulation_detailed_mode');
          }
        }
        toggleFieldVisibility('roof', this.checked);
        updateAllFieldsVisibility();
      });

      floorCheckbox.addEventListener('change', function () {
        const value = this.checked ? 'yes' : 'no';
        if (window.formEngine && window.formEngine.state && window.formEngine.state.setValue) {
          window.formEngine.state.setValue('floor_insulation_detailed_mode', value);
          if (window.formEngine.refreshField) {
            window.formEngine.refreshField('floor_insulation_detailed_mode');
          }
        }
        toggleFieldVisibility('floor', this.checked);
        updateAllFieldsVisibility();
      });

      // Inicjalizacja widoczności przy załadowaniu
      updateAllFieldsVisibility();
    }

    // STARA FUNKCJA - zachowana dla kompatybilności, ale nieaktywna
    function setupSimplifiedInsulationMode() {
      const checkbox = document.getElementById('detailed_insulation_mode');
      if (!checkbox) return;

      // Mapowanie poziomów izolacji na wartości domyślne dla trybu szczegółowego
      const INSULATION_LEVEL_MAP = {
        walls: {
          poor: { material: 'standard', size: 10 },
          average: { material: 'standard', size: 15 },
          good: { material: 'standard', size: 20 },
          very_good: { material: 'standard', size: 25 },
        },
        roof: {
          poor: { material: '68', size: 10 }, // Wełna mineralna
          average: { material: '68', size: 15 },
          good: { material: '68', size: 20 },
          very_good: { material: '68', size: 30 },
        },
        floor: {
          poor: { material: '70', size: 5 }, // Styropian EPS
          average: { material: '70', size: 10 },
          good: { material: '70', size: 15 },
          very_good: { material: '70', size: 20 },
        },
      };

      // Funkcja do zachowania danych przy przełączaniu z uproszczonego na szczegółowy
      function preserveSimplifiedData() {
        const state = window.formEngine ? window.formEngine.getState() : {};
        const wallsLevel = state.walls_insulation_level;
        const roofLevel = state.roof_insulation_level;
        const floorLevel = state.floor_insulation_level;

        // Jeśli przełączamy na szczegółowy i mamy dane z uproszczonego trybu
        if (checkbox.checked && (wallsLevel || roofLevel || floorLevel)) {
          // Mapuj poziomy na wartości domyślne dla szczegółowego trybu
          if (roofLevel && INSULATION_LEVEL_MAP.roof[roofLevel]) {
            const roofData = INSULATION_LEVEL_MAP.roof[roofLevel];
            const topIsolation = document.getElementById('top_isolation');
            const topMaterial = document.getElementById('top_isolation_material');
            const topSize = document.getElementById('top_isolation_size');

            if (topIsolation) {
              topIsolation.value = 'yes';
              // Wywołaj event, aby pokazać pola szczegółowe
              topIsolation.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (topMaterial && roofData.material) {
              topMaterial.value = roofData.material;
              topMaterial.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (topSize && roofData.size) {
              topSize.value = roofData.size;
              // Zaktualizuj slider
              const bubble = document.getElementById('customRoofInsulationBubble');
              if (bubble) bubble.textContent = roofData.size;
              // Ustaw jako potwierdzony
              topSize.setAttribute('data-slider-confirmed', 'true');
            }
          }

          if (floorLevel && INSULATION_LEVEL_MAP.floor[floorLevel]) {
            const floorData = INSULATION_LEVEL_MAP.floor[floorLevel];
            const bottomIsolation = document.getElementById('bottom_isolation');
            const bottomMaterial = document.getElementById('bottom_isolation_material');
            const bottomSize = document.getElementById('bottom_isolation_size');

            if (bottomIsolation) {
              bottomIsolation.value = 'yes';
              bottomIsolation.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (bottomMaterial && floorData.material) {
              bottomMaterial.value = floorData.material;
              bottomMaterial.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (bottomSize && floorData.size) {
              bottomSize.value = floorData.size;
              const bubble = document.getElementById('customFloorInsulationBubble');
              if (bubble) bubble.textContent = floorData.size;
              bottomSize.setAttribute('data-slider-confirmed', 'true');
            }
          }
        }
      }

      // Funkcja do aktualizacji widoczności kontenerów z animacją
      function updateInsulationModeVisibility() {
        const simplifiedContainer = document.getElementById('simplifiedInsulationMode');
        const detailedContainer = document.getElementById('detailedInsulationMode');
        const isDetailed = checkbox.checked;

        // Dodaj animację fade
        if (simplifiedContainer && detailedContainer) {
          if (isDetailed) {
            // Przełączanie na szczegółowy
            simplifiedContainer.style.opacity = '0';
            simplifiedContainer.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
              simplifiedContainer.classList.add('hidden');
              detailedContainer.classList.remove('hidden');
              detailedContainer.style.opacity = '0';
              detailedContainer.style.transition = 'opacity 0.3s ease-in';
              setTimeout(() => {
                detailedContainer.style.opacity = '1';
              }, 10);
            }, 300);
          } else {
            // Przełączanie na uproszczony
            detailedContainer.style.opacity = '0';
            detailedContainer.style.transition = 'opacity 0.3s ease-out';
            setTimeout(() => {
              detailedContainer.classList.add('hidden');
              simplifiedContainer.classList.remove('hidden');
              simplifiedContainer.style.opacity = '0';
              simplifiedContainer.style.transition = 'opacity 0.3s ease-in';
              setTimeout(() => {
                simplifiedContainer.style.opacity = '1';
              }, 10);
            }, 300);
          }
        }

        if (window.formEngine && window.formEngine.softRefresh) {
          setTimeout(() => {
            window.formEngine.softRefresh();
          }, 350);
        }
      }

      // Listener na zmianę checkboxa z komunikatem ostrzegawczym
      checkbox.addEventListener('change', function () {
        const isDetailed = checkbox.checked;
        const state = window.formEngine ? window.formEngine.getState() : {};

        // Sprawdź czy użytkownik ma wypełnione dane w aktualnym trybie
        const hasSimplifiedData =
          state.walls_insulation_level || state.roof_insulation_level || state.floor_insulation_level;
        const hasDetailedData =
          state.top_isolation ||
          state['top_isolation[material]'] ||
          state['top_isolation[size]'] ||
          state.bottom_isolation ||
          state['bottom_isolation[material]'] ||
          state['bottom_isolation[size]'];

        // Jeśli przełączamy z trybu z danymi, pokaż ostrzeżenie
        if (isDetailed && hasSimplifiedData) {
          // Przełączanie na szczegółowy - zachowamy dane
          preserveSimplifiedData();
        } else if (!isDetailed && hasDetailedData) {
          // Przełączanie na uproszczony - pokaż ostrzeżenie
          const confirmed = confirm(
            'Przełączenie na tryb uproszczony spowoduje utratę szczegółowych danych o izolacji. Czy chcesz kontynuować?'
          );
          if (!confirmed) {
            checkbox.checked = !isDetailed;
            return;
          }
        }

        // Ustaw wartość jako 'yes'/'no'
        const value = isDetailed ? 'yes' : 'no';

        // Aktualizuj stan w formEngine
        if (window.formEngine && window.formEngine.state && window.formEngine.state.setValue) {
          window.formEngine.state.setValue('detailed_insulation_mode', value);
          if (window.formEngine.refreshField) {
            window.formEngine.refreshField('detailed_insulation_mode');
          }
          updateInsulationModeVisibility();
        }
      });

      // Listener na zmianę building_type (dla automatycznej aktualizacji)
      const buildingTypeInput = document.getElementById('building_type');
      if (buildingTypeInput) {
        buildingTypeInput.addEventListener('change', function () {
          const buildingType = this.value;
          if (buildingType === 'single_house') {
            // Dla single_house: ustaw domyślnie tryb uproszczony
            checkbox.checked = false;
            if (
              window.formEngine &&
              window.formEngine.state &&
              window.formEngine.state.setValue
            ) {
              window.formEngine.state.setValue('detailed_insulation_mode', 'no');
              if (window.formEngine.refreshField) {
                window.formEngine.refreshField('detailed_insulation_mode');
              }
              updateInsulationModeVisibility();
            }
          } else {
            // Dla innych typów: ustaw tryb szczegółowy (checkbox nie ma znaczenia, ale ustawiamy dla spójności)
            checkbox.checked = false;
            if (
              window.formEngine &&
              window.formEngine.state &&
              window.formEngine.state.setValue
            ) {
              window.formEngine.state.setValue('detailed_insulation_mode', 'no');
              if (window.formEngine.refreshField) {
                window.formEngine.refreshField('detailed_insulation_mode');
              }
              updateInsulationModeVisibility();
            }
          }
        });
      }

      // Listener na custom event building_type_change
      document.addEventListener('building_type_change', function (e) {
        const buildingType = e.detail?.value;
        if (buildingType === 'single_house') {
          checkbox.checked = false;
          if (
            window.formEngine &&
            window.formEngine.state &&
            window.formEngine.state.setValue
          ) {
            window.formEngine.state.setValue('detailed_insulation_mode', 'no');
            if (window.formEngine.refreshField) {
              window.formEngine.refreshField('detailed_insulation_mode');
            }
            updateInsulationModeVisibility();
          }
        } else {
          checkbox.checked = false;
          if (
            window.formEngine &&
            window.formEngine.state &&
            window.formEngine.state.setValue
          ) {
            window.formEngine.state.setValue('detailed_insulation_mode', 'no');
            if (window.formEngine.refreshField) {
              window.formEngine.refreshField('detailed_insulation_mode');
            }
            updateInsulationModeVisibility();
          }
        }
      });

      // Inicjalizacja przy załadowaniu - sprawdź czy single_house
      function initializeMode() {
        if (window.formEngine && window.formEngine.getState) {
          const state = window.formEngine.getState();
          if (state && state.building_type === 'single_house') {
            // Ustaw domyślnie tryb uproszczony (checkbox nie zaznaczony)
            checkbox.checked = false;
            if (window.formEngine.state && window.formEngine.state.setValue) {
              // Ustaw jako 'no' (zgodnie z tym jak formEngine odczytuje checkboxy)
              window.formEngine.state.setValue('detailed_insulation_mode', 'no');
              // Wymuś aktualizację pola
              if (window.formEngine.refreshField) {
                window.formEngine.refreshField('detailed_insulation_mode');
              }
              updateInsulationModeVisibility();
            }
          }
        }
      }

      // Wywołaj inicjalizację po krótkim opóźnieniu (gdy formEngine jest gotowy)
      setTimeout(initializeMode, 200);

      // Dodatkowo: nasłuchuj na zmiany w formEngine (gdy building_type się zmienia)
      if (window.formEngine && window.formEngine.state) {
        // Sprawdź stan co 500ms przez pierwsze 5 sekund (dla przypadków gdy building_type jest ustawiane później)
        let checkCount = 0;
        const maxChecks = 10;
        const checkInterval = setInterval(() => {
          checkCount++;
          if (checkCount > maxChecks) {
            clearInterval(checkInterval);
            return;
          }
          const state = window.formEngine.getState();
          if (state && state.building_type === 'single_house') {
            // Sprawdź czy detailed_insulation_mode jest ustawione
            if (
              state.detailed_insulation_mode === undefined ||
              state.detailed_insulation_mode === null ||
              state.detailed_insulation_mode === ''
            ) {
              checkbox.checked = false;
              if (window.formEngine.state && window.formEngine.state.setValue) {
                window.formEngine.state.setValue('detailed_insulation_mode', 'no');
                if (window.formEngine.refreshField) {
                  window.formEngine.refreshField('detailed_insulation_mode');
                }
                updateInsulationModeVisibility();
              }
            }
          }
        }, 500);
      }

      // Funkcja testowa do konsoli (do debugowania)
      window.testInsulationMode = function () {
        const state = window.formEngine ? window.formEngine.getState() : {};
        const container = document.getElementById('simplifiedInsulationMode');
        const detailedContainer = document.getElementById('detailedInsulationMode');
        console.log('=== TEST INSULATION MODE ===');
        console.log('State:', {
          building_type: state.building_type,
          detailed_insulation_mode: state.detailed_insulation_mode,
          type: typeof state.detailed_insulation_mode,
        });
        console.log('Containers:', {
          simplified: {
            exists: !!container,
            hasHidden: container ? container.classList.contains('hidden') : false,
            computedDisplay: container ? window.getComputedStyle(container).display : 'N/A',
            inlineDisplay: container ? container.style.display : 'N/A',
          },
          detailed: {
            exists: !!detailedContainer,
            hasHidden: detailedContainer
              ? detailedContainer.classList.contains('hidden')
              : false,
            computedDisplay: detailedContainer
              ? window.getComputedStyle(detailedContainer).display
              : 'N/A',
            inlineDisplay: detailedContainer ? detailedContainer.style.display : 'N/A',
          },
        });
        console.log('Checkbox:', {
          exists: !!checkbox,
          checked: checkbox ? checkbox.checked : false,
          value: checkbox ? checkbox.value : 'N/A',
        });
        return { state, container, detailedContainer, checkbox };
      };
    }

    // Inicjalizuj po załadowaniu DOM i formEngine
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        // Poczekaj na formEngine
        const checkEngine = setInterval(function () {
          if (window.formEngine && window.formEngine.state) {
            setupPerFieldInsulationMode();
            clearInterval(checkEngine);
          }
        }, 100);

        setTimeout(() => clearInterval(checkEngine), 5000);
      });
    } else {
      // DOM już załadowany
      const checkEngine = setInterval(function () {
        if (window.formEngine && window.formEngine.state) {
          setupSimplifiedInsulationMode();
          clearInterval(checkEngine);
        }
      }, 100);

      setTimeout(() => clearInterval(checkEngine), 5000);
    }
  })();

  console.log('✅ Calculator UI Module loaded successfully');
})();
