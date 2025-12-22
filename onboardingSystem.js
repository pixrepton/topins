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

// Auto-init dla kalkulatora (po załadowaniu strony)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Pokaż po 1 sekundzie (żeby user zobaczył stronę)
    setTimeout(() => {
      OnboardingSystem.showCalculatorWelcome();
    }, 1000);
  });
} else {
  setTimeout(() => {
    OnboardingSystem.showCalculatorWelcome();
  }, 1000);
}
