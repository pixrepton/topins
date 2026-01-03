/**
 * ONBOARDING SYSTEM
 * Wprowadzenie do kalkulatora i konfiguratora
 */

const OnboardingSystem = {
  /**
   * Pokazuje modal onboarding dla kalkulatora
   */
  showCalculatorWelcome() {
    // Sprawdź czy user już widział
    if (localStorage.getItem('calculator-onboarding-seen') === 'true') {
      return;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // NIE POKAZUJ MODALA jeśli formularz jest już wypełniony (powrót z profilu)
    // ═══════════════════════════════════════════════════════════════════════════
    if (typeof window.getAppState === 'function') {
      const appState = window.getAppState();
      if (appState && appState.formData && Object.keys(appState.formData).length > 0) {
        // Formularz jest wypełniony - użytkownik wraca, nie zaczyna nowego obliczenia
        console.log('[OnboardingSystem] Formularz wypełniony - pomijam modal powitalny');
        return;
      }
    }

    const modal = this.createCalculatorModal();
    document.body.appendChild(modal);

    // Aktywuj po krótkim delay
    setTimeout(() => {
      modal.classList.add('active');
    }, 100);
  },

  /**
   * Tworzy modal dla kalkulatora
   */
  createCalculatorModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'calculator-onboarding';

    overlay.innerHTML = `
      <div class="modal-content onboarding-modal onboarding-modal--simple">
        <button class="modal-close" aria-label="Zamknij" onclick="OnboardingSystem.closeCalculatorWelcome()">
          <i class="ph ph-x"></i>
        </button>

        <div class="onboarding-header">
          <div class="onboarding-icon">
            <i class="ph ph-calculator"></i>
          </div>
          <h2>Oblicz moc pompy ciepła</h2>
          <p class="onboarding-subtitle">
            Wypełnij dane o budynku i otrzymaj profesjonalną analizę
          </p>
        </div>

        <div class="onboarding-actions">
          <button class="btn-primary btn-xl" onclick="OnboardingSystem.startCalculator()">
            Rozpocznij
            <i class="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    // Zamykanie przez kliknięcie w overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeCalculatorWelcome();
      }
    });

    return overlay;
  },

  /**
   * Rozpocznij kalkulator (zamknij modal i scroll do formularza)
   */
  startCalculator() {
    this.closeCalculatorWelcome();

    // Scroll do pierwszego pola formularza
    const firstField = document.getElementById('building_type') ||
                      document.querySelector('#heatCalcFormFull input, #heatCalcFormFull select');

    if (firstField) {
      setTimeout(() => {
        firstField.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        firstField.focus();
      }, 300);
    }
  },

  /**
   * Zamknij modal welcome
   */
  closeCalculatorWelcome() {
    const modal = document.getElementById('calculator-onboarding');
    if (!modal) return;

    // Sprawdź checkbox "nie pokazuj więcej"
    const checkbox = document.getElementById('dont-show-calculator-onboarding');
    if (checkbox && checkbox.checked) {
      localStorage.setItem('calculator-onboarding-seen', 'true');
    }

    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  },

  /**
   * Pokazuje modal onboarding dla konfiguratora
   */
  showConfiguratorWelcome(resultData = {}) {
    // Sprawdź czy user już widział
    if (localStorage.getItem('configurator-onboarding-seen') === 'true') {
      return;
    }

    const modal = this.createConfiguratorModal(resultData);
    document.body.appendChild(modal);

    // Aktywuj po krótkim delay
    setTimeout(() => {
      modal.classList.add('active');
    }, 100);
  },

  /**
   * Tworzy modal dla konfiguratora
   */
  createConfiguratorModal(resultData) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'configurator-onboarding';

    // Pobierz dane z wyniku
    const power = resultData.max_heating_power ? `${resultData.max_heating_power} kW` : '—';
    const cwu = resultData.hot_water_power ? `${resultData.hot_water_power} kW` : '—';
    const bufor = '50-100 l'; // Domyślna wartość

    overlay.innerHTML = `
      <div class="modal-content onboarding-modal onboarding-modal--simple">
        <button class="modal-close" aria-label="Zamknij" onclick="OnboardingSystem.closeConfiguratorWelcome()">
          <i class="ph ph-x"></i>
        </button>

        <div class="onboarding-header">
          <div class="onboarding-icon">
            <i class="ph ph-gear"></i>
          </div>
          <h2>Dobierz komponenty instalacji</h2>
          <p class="onboarding-subtitle">
            Skonfiguruj pompę ciepła, zasobniki i osprzęt
          </p>
        </div>

        <div class="onboarding-actions">
          <button class="btn-primary btn-xl" onclick="OnboardingSystem.startConfigurator()">
            Przejdź do konfiguratora
            <i class="ph ph-arrow-right"></i>
          </button>
        </div>
      </div>
    `;

    // Zamykanie przez kliknięcie w overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeConfiguratorWelcome();
      }
    });

    return overlay;
  },

  /**
   * Rozpocznij konfigurator
   */
  startConfigurator() {
    this.closeConfiguratorWelcome();

    // Przełącz na widok konfiguratora
    const configuratorBtn = document.querySelector('[data-target="configurator-view"]');
    if (configuratorBtn) {
      configuratorBtn.click();
    }

    // BRAK scrollowania - użytkownik pozostaje w aktualnej pozycji
    // (widoki konfiguratora i profilu energetycznego są częścią tego samego kroku 6)
  },

  /**
   * Pomiń konfigurator - przejdź do profilu energetycznego
   */
  skipConfigurator() {
    this.closeConfiguratorWelcome();

    // Przełącz na widok profilu energetycznego
    const energyBtn = document.querySelector('[data-target="energy-profile-view"]');
    if (energyBtn) {
      energyBtn.click();
    }
  },

  /**
   * Zamknij modal konfiguratora
   */
  closeConfiguratorWelcome() {
    const modal = document.getElementById('configurator-onboarding');
    if (!modal) return;

    // Sprawdź checkbox "nie pokazuj więcej"
    const checkbox = document.getElementById('dont-show-configurator-onboarding');
    if (checkbox && checkbox.checked) {
      localStorage.setItem('configurator-onboarding-seen', 'true');
    }

    modal.classList.remove('active');
    setTimeout(() => {
      modal.remove();
    }, 300);
  },

  /**
   * Reset (do testów)
   */
  reset() {
    localStorage.removeItem('calculator-onboarding-seen');
    localStorage.removeItem('configurator-onboarding-seen');
    console.log('✅ Onboarding reset - modals will show again');
  }
};

// Export do window
window.OnboardingSystem = OnboardingSystem;

// ✅ Auto-init dla kalkulatora (po załadowaniu strony)
// WAŻNE: Poczekaj aż calculatorInit.js załaduje appState (min. 500ms)
let onboardingTimeout = null;

function initOnboarding() {
  // ✅ Wyczyść poprzedni timeout jeśli istnieje
  if (onboardingTimeout) {
    clearTimeout(onboardingTimeout);
  }

  // ✅ SPRAWDŹ CZY JESTEŚMY NA STRONIE Z KALKULATOREM
  // Kontener kalkulatora musi istnieć na stronie
  const calculatorContainer = document.getElementById('wycena-calculator-app') ||
                              document.getElementById('top-instal-calc') ||
                              document.querySelector('.heatpump-calculator-wrapper');

  if (!calculatorContainer) {
    // Nie jesteśmy na stronie z kalkulatorem - nie uruchamiaj modala
    console.log('[OnboardingSystem] Kalkulator nie znaleziony na stronie - pomijam modal');
    return;
  }

  // ✅ Poczekaj aż appState będzie załadowany (calculatorInit.js potrzebuje ~400ms)
  onboardingTimeout = setTimeout(() => {
    OnboardingSystem.showCalculatorWelcome();
    onboardingTimeout = null;
  }, 800); // Zwiększono z 1000ms do 800ms, ale po DOMContentLoaded
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initOnboarding);
} else {
  initOnboarding();
}
