// === FILE: tabNavigation.js ===
// 🧠 Obsługuje: System nawigacji między zakładkami kalkulatora z walidacją

(function () {
  'use strict';

  /**
   * Wyświetla określoną zakładkę kalkulatora
   */
  function showTab(index) {
    try {
      if (!window.sections || window.sections.length === 0) {
        window.sections = document.querySelectorAll('#top-instal-calc .section');
      }

      if (index < 0 || index >= window.sections.length) {
        return;
      }

      // Sprawdź czy już jesteśmy w tym kroku
      const alreadyInThisTab = window.currentTab === index;

      // Ukryj wszystkie sekcje
      window.sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
      });

      // Pokaż wybraną sekcję
      const activeSection = window.sections[index];
      activeSection.style.display = 'block';
      activeSection.classList.add('active');

      // 🔽 Scroll TYLKO jeśli zmieniamy zakładkę (zapobiega scrollowaniu przy przełączaniu widoków w tej samej zakładce)
      if (!alreadyInThisTab) {
        // Specjalne scrollowanie dla kroku 6 (wyniki) - scroll do samej góry sekcji
        if (index === 6) {
          // Znajdź header i oblicz jego wysokość
          const header = document.querySelector('.top-preview-header');
          const headerHeight = header ? header.offsetHeight : 81;

          // Scroll do góry sekcji wyników, tak aby progress bar był tuż pod headerem
          // Dodatkowe 80px offsetu dla idealnego wyrównania
          const targetY = activeSection.offsetTop - headerHeight - 75;

          window.scrollTo({
            top: targetY,
            behavior: 'smooth',
          });

          console.log('📍 Scrollowanie do kroku 6 (wyniki) - progress bar u góry');
        } else {
          // Standardowe scrollowanie dla kroków 0-5
          const progressBar = activeSection.querySelector('.progress-bar-premium');
          const scrollTarget = progressBar || activeSection;
          const offsetY = scrollTarget.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: offsetY, behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error('Błąd podczas przełączania zakładki:', error);
      // Fallback - spróbuj znaleźć sekcje ponownie
      window.sections = document.querySelectorAll('#top-instal-calc .section');
      if (window.sections.length > index && index >= 0) {
        window.sections[index].style.display = 'block';
      }
    }

    // Aktualizuj globalny indeks
    window.currentTab = index;

    // Aktualizuj pasek postępu
    updateProgressBar(index);

    // Aktualizuj progresywne odblokowywanie dla aktywnej zakładki
    if (
      typeof window.progressiveDisclosure !== 'undefined' &&
      window.progressiveDisclosure.updateTab
    ) {
      setTimeout(() => {
        window.progressiveDisclosure.updateTab(index);
        window.progressiveDisclosure.updateButton(index);
      }, 200);
    }

    // Odśwież formEngine po zmianie zakładki, aby bindować nowe pola
    if (
      typeof window.formEngine !== 'undefined' &&
      typeof window.formEngine.rebindAll === 'function'
    ) {
      setTimeout(() => {
        console.log(`[tabNavigation] Rebindowanie formEngine dla zakładki ${index}`);
        window.formEngine.rebindAll();
      }, 250);
    }
  }

  /**
   * Aktualizuje pasek postępu
   */
  function updateProgressBar(activeIndex) {
    // Używaj WorkflowController jeśli dostępny (globalny progress bar)
    if (
      typeof window.WorkflowController !== 'undefined' &&
      window.WorkflowController.updateProgress
    ) {
      window.WorkflowController.updateProgress(activeIndex);
      return;
    }

    // Fallback - szukaj różnych wariantów paska postępu (stary system)
    const progressContainers = [
      document.querySelector('.progress-bar-premium'),
      document.querySelector('.progress-bar'),
      document.querySelector('.progress-steps'),
    ];

    const progressContainer = progressContainers.find(container => container !== null);

    if (progressContainer) {
      // Aktualizuj CSS custom property dla premium progress bar
      progressContainer.style.setProperty('--step', activeIndex + 1);

      // Znajdź kroki
      const progressSteps = progressContainer.querySelectorAll('.step');

      progressSteps.forEach((step, index) => {
        step.classList.remove('active', 'completed');

        if (index < activeIndex) {
          step.classList.add('completed');
        } else if (index === activeIndex) {
          step.classList.add('active');
        }
      });

      console.log(
        `📊 Pasek postępu zaktualizowany: krok ${activeIndex + 1}/${progressSteps.length}`
      );
    }
  }

  /**
   * Czyści błędy walidacji w sekcji
   */
  function clearValidationErrors(section) {
    // Użyj ErrorHandler jeśli dostępny
    if (typeof ErrorHandler !== 'undefined') {
      ErrorHandler.clearAllErrors();
      return;
    }

    // Fallback - stary system
    if (!section) {
      const form =
        document.getElementById('heatCalcFormFull') ||
        document.getElementById('top-instal-calc') ||
        document.querySelector("form[data-calc='top-instal']");
      if (!form) return;
      section = form;
    }

    const fields = section.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      field.classList.remove('field-error');
      field.style.border = '';
      field.style.backgroundColor = '';
    });

    const errorMessages = section.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
  }

  /**
   * Waliduje całą zakładkę przed przejściem dalej.
   * Logika wymaganych pól pochodzi z formEngine (sectionFields/requiredCache),
   * a ta funkcja odpowiada tylko za pokazanie błędów wizualnie.
   */
  function validateTab(tabIndex) {
    if (!window.sections || !window.sections[tabIndex]) {
      return true; // Brak sekcji = pozwól przejść
    }

    const section = window.sections[tabIndex];
    clearValidationErrors(section);

    let isValid = true;

    // Jeśli dostępny jest formEngine z regułami sekcji, użyj go jako źródła prawdy
    if (window.formEngine && window.formEngine.rules && window.formEngine.state) {
      try {
        const rules = window.formEngine.rules;
        const state = window.formEngine.state.getAllValues();
        const sectionRule = rules.sections && rules.sections[tabIndex];
        const sectionFields =
          rules.sectionFields && sectionRule ? rules.sectionFields[sectionRule.id] || [] : [];

        // Prosta funkcja sprawdzająca, czy pole jest „spełnione” (kopiujemy ją z engine.js)
        const fieldIsSatisfied = name => {
          const value = state[name];
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return value !== undefined && value !== null && String(value).trim() !== '';
        };

        // Zbierz pola, które są wymagane ale nie spełnione
        const missingFields = sectionFields.filter(name => !fieldIsSatisfied(name));

        if (missingFields.length > 0) {
          isValid = false;

          // Spróbuj podświetlić odpowiadające im elementy DOM
          missingFields.forEach(name => {
            // Szukaj po name lub id
            const fieldEl = section.querySelector(`[name="${name}"], #${name}`);
            if (fieldEl) {
              markFieldAsInvalid(fieldEl, 'To pole jest wymagane');
            }
          });
        }
      } catch (e) {
        console.warn('[tabNavigation] Błąd walidacji z użyciem formEngine:', e);
      }
    }

    // Dodatkowo zachowaj starą logikę dla Yes/No i specyficznych sekcji,
    // ale tylko jako uzupełnienie (nie modyfikujemy już isValid na true, jeśli wcześniej było false).
    if (isValid) {
      isValid = validateSpecificFields(section) && validateConditionalFields(section);
    }

    return isValid;
  }

  /**
   * Waliduje pojedyncze pole
   */
  function validateField(field) {
    if (!field) return true;

    let isValid = true;
    let errorMessage = '';

    // Sprawdź czy pole jest widoczne
    if (field.offsetParent === null || field.style.display === 'none') {
      return true; // Pomiń ukryte pola
    }

    // Walidacja pustych pól
    if (field.hasAttribute('required') || field.hasAttribute('data-required')) {
      if (field.type === 'checkbox') {
        if (!field.checked) {
          isValid = false;
          errorMessage = 'To pole jest wymagane';
        }
      } else if (!field.value || field.value.trim() === '') {
        isValid = false;
        errorMessage = 'To pole jest wymagane';
      }
    }

    // Walidacja specjalna dla różnych typów pól
    if (field.value && field.value.trim() !== '') {
      switch (field.type) {
        case 'number':
          const numValue = parseFloat(field.value);
          if (isNaN(numValue)) {
            isValid = false;
            errorMessage = 'Wprowadź prawidłową liczbę';
          } else if (field.min && numValue < parseFloat(field.min)) {
            isValid = false;
            errorMessage = `Minimalna wartość: ${field.min}`;
          } else if (field.max && numValue > parseFloat(field.max)) {
            isValid = false;
            errorMessage = `Maksymalna wartość: ${field.max}`;
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(field.value)) {
            isValid = false;
            errorMessage = 'Wprowadź prawidłowy adres email';
          }
          break;
      }
    }

    if (!isValid) {
      markFieldAsInvalid(field, errorMessage);
    }

    return isValid;
  }

  /**
   * Walidacje specjalne dla poszczególnych sekcji
   */
  function validateSpecificFields(section) {
    if (!section) return true;

    let isValid = true;

    // Walidacja dla sekcji 1: Kształt budynku
    const buildingShape = section.querySelector('#building_shape');
    if (buildingShape && buildingShape.offsetParent !== null) {
      const shape = buildingShape.value;

      if (shape === 'regular') {
        // Sprawdź metody regularnego kształtu
        const regularMethod = section.querySelector('#regular_method');
        if (regularMethod && regularMethod.offsetParent !== null && !regularMethod.value) {
          markFieldAsInvalid(regularMethod, 'Wybierz metodę pomiaru');
          isValid = false;
        }

        if (regularMethod && regularMethod.value === 'dimensions') {
          const length = section.querySelector('#building_length');
          const width = section.querySelector('#building_width');
          if (length && !length.value) {
            markFieldAsInvalid(length, 'Podaj długość budynku');
            isValid = false;
          }
          if (width && !width.value) {
            markFieldAsInvalid(width, 'Podaj szerokość budynku');
            isValid = false;
          }
        } else if (regularMethod && regularMethod.value === 'floor_area') {
          const floorArea = section.querySelector('#floor_area');
          if (floorArea && !floorArea.value) {
            markFieldAsInvalid(floorArea, 'Podaj powierzchnię kondygnacji');
            isValid = false;
          }
        }
      } else if (shape === 'irregular') {
        const floorAreaIrregular = section.querySelector('#floor_area_irregular');
        const floorPerimeter = section.querySelector('#floor_perimeter');
        if (floorAreaIrregular && !floorAreaIrregular.value) {
          markFieldAsInvalid(floorAreaIrregular, 'Podaj powierzchnię kondygnacji');
          isValid = false;
        }
        if (floorPerimeter && !floorPerimeter.value) {
          markFieldAsInvalid(floorPerimeter, 'Podaj obwód zewnętrzny');
          isValid = false;
        }
      }
    }

    // Walidacja dla sekcji 2: Izolacja ścian
    // Sprawdź czy jest w trybie uproszczonym dla single_house
    const buildingType =
      window.formEngine && window.formEngine.state
        ? window.formEngine.state.getValue('building_type')
        : null;
    const detailedMode =
      window.formEngine && window.formEngine.state
        ? window.formEngine.state.getValue('detailed_insulation_mode')
        : null;
    const isSimplifiedSingleHouse =
      buildingType === 'single_house' &&
      detailedMode !== true &&
      detailedMode !== 'yes' &&
      detailedMode !== 'true';

    // Dla single_house w trybie uproszczonym: pomiń walidację szczegółowych pól izolacji
    if (!isSimplifiedSingleHouse) {
      const hasExternalIsolation = section.querySelector('#has_external_isolation');
      if (hasExternalIsolation && hasExternalIsolation.value === 'yes') {
        const extMaterial = section.querySelector('#external_wall_isolation_material');
        const extSize = section.querySelector('#external_wall_isolation_size');
        if (extMaterial && extMaterial.offsetParent !== null && !extMaterial.value) {
          markFieldAsInvalid(extMaterial, 'Wybierz materiał izolacji zewnętrznej');
          isValid = false;
        }
        if (extSize && extSize.offsetParent !== null && !extSize.value) {
          markFieldAsInvalid(extSize, 'Podaj grubość izolacji zewnętrznej');
          isValid = false;
        }
      }
    }

    // Walidacja dla sekcji 5: Podgrzewanie wody
    const includeHotWater = section.querySelector('#include_hot_water');
    if (includeHotWater && includeHotWater.value === 'yes') {
      const hotWaterPersons = section.querySelector('#hot_water_persons');
      const hotWaterUsage = section.querySelector('#hot_water_usage');
      if (hotWaterPersons && hotWaterPersons.offsetParent !== null && !hotWaterPersons.value) {
        markFieldAsInvalid(hotWaterPersons, 'Podaj liczbę osób');
        isValid = false;
      }
      if (hotWaterUsage && hotWaterUsage.offsetParent !== null && !hotWaterUsage.value) {
        markFieldAsInvalid(hotWaterUsage, 'Podaj zużycie wody');
        isValid = false;
      }
    }

    return isValid;
  }

  /**
   * Walidacja pól warunkowo wymaganych
   */
  function validateConditionalFields(section) {
    if (!section) return true;

    let isValid = true;

    // Sprawdź wszystkie pola z atrybutem data-condition
    const conditionalFields = section.querySelectorAll('[data-condition]');

    conditionalFields.forEach(field => {
      // Sprawdź czy pole jest widoczne
      if (field.offsetParent === null || field.style.display === 'none') {
        return; // Pomiń ukryte pola
      }

      // Sprawdź czy pole jest wymagane (przez formEngine)
      if (field.hasAttribute('required') || field.getAttribute('data-required') === 'true') {
        let isEmpty = false;

        if (field.type === 'checkbox' || field.type === 'radio') {
          const checkedField = section.querySelector(`[name="${field.name}"]:checked`);
          isEmpty = !checkedField;
        } else {
          isEmpty = !field.value || field.value.trim() === '';
        }

        if (isEmpty) {
          markFieldAsInvalid(field, 'To pole jest wymagane');
          isValid = false;
        }
      }
    });

    return isValid;
  }

  /**
   * Oznacza pole jako nieprawidłowe
   */
  function markFieldAsInvalid(field, customMessage = null) {
    if (!field) return;

    // Pobierz komunikat błędu
    const errorMessage = customMessage || getDefaultErrorMessage(field);

    // Użyj ErrorHandler jeśli dostępny
    if (typeof ErrorHandler !== 'undefined' && errorMessage) {
      ErrorHandler.showFieldError(field, errorMessage);
    } else {
      // Fallback - stary system
      field.classList.remove('field-error');
      const existingError = field.parentNode.querySelector('.error-message');
      if (existingError) existingError.remove();

      field.classList.add('field-error');

      if (errorMessage) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        errorElement.style.color = '#dc3545';
        errorElement.style.fontSize = '14px';
        errorElement.style.marginTop = '5px';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }

      // Scroll do pierwszego błędu
      if (field.parentNode.querySelector('.field-error') === field) {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    console.log(`❌ Pole ${field.name || field.id} jest nieprawidłowe: ${errorMessage}`);
  }

  /**
   * Zwraca domyślny komunikat błędu dla pola
   */
  function getDefaultErrorMessage(field) {
    if (field.hasAttribute('required') || field.hasAttribute('data-required')) {
      return 'To pole jest wymagane';
    }

    switch (field.type) {
      case 'number':
        return 'Wprowadź prawidłową liczbę';
      case 'email':
        return 'Wprowadź prawidłowy adres email';
      default:
        return 'Wartość w tym polu jest nieprawidłowa';
    }
  }

  /**
   * Funkcje nawigacji
   */
  function nextStep() {
    let idx = window.currentTab || 0;
    if (validateTab(idx)) {
      showTab(idx + 1);
    }
  }

  function prevStep() {
    let idx = window.currentTab || 0;
    showTab(idx - 1);
  }

  // Zostawiamy addRequiredAttributes tylko dla kompatybilności z istniejącym kodem,
  // ale nie opieramy na nim logiki sekcji (tę kontroluje formEngine).
  function addRequiredAttributes() {}

  // Global exports
  window.showTab = showTab;
  window.validateTab = validateTab;
  window.validateField = validateField;
  window.validateSpecificFields = validateSpecificFields;
  window.validateConditionalFields = validateConditionalFields;
  window.markFieldAsInvalid = markFieldAsInvalid;
  window.clearValidationErrors = clearValidationErrors;
  window.getDefaultErrorMessage = getDefaultErrorMessage;
  window.nextStep = nextStep;
  window.prevStep = prevStep;
  window.addRequiredAttributes = addRequiredAttributes;
})();
