/**
 * WORKFLOW CONTROLLER
 * Obsługuje globalny progress bar (umieszczony powyżej formularza).
 * - Aktualizuje wartości przy zmianie zakładek
 * - Sticky behavior przy scrollowaniu
 */

const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

const WorkflowController = {
  // Referencje do elementów DOM
  progressBarContainer: null,
  progressBar: null,
  progressFill: null,
  progressPercentage: null,
  progressLabel: null,
  progressInfo: null,
  progressPlaceholder: null,
  form: null,
  header: null,
  triggerOffset: 0,
  stickyDisabled: false, // Czy sticky jest wyłączone (tylko dla kroku 6)

  // Typewriter state
  typewriterActive: false,
  typewriterCompleted: false, // Czy animacja już była pokazana
  typewriterTimeout: null,

  // ✅ Event listener references (dla czyszczenia)
  scrollHandler: null,
  resizeHandler: null,

  // Konfiguracja kroków (7 zakładek)
  steps: [
    { progress: 12, label: 'Start · Wprowadzenie' },
    { progress: 24, label: 'Krok 2 · Wymiary' },
    { progress: 42, label: 'Krok 3 · Konstrukcja' },
    { progress: 58, label: 'Krok 4 · Okna & Drzwi' },
    { progress: 75, label: 'Krok 5 · Izolacje' },
    { progress: 91, label: 'Krok 6 · Finalizacja' },
    { progress: 100, label: '✓ Zakończono · Wyniki' },
  ],

  /**
   * Obsługa zmiany rozmiaru okna - aktualizuj format labela
   */
  handleResize() {
    // Znajdź aktualny krok
    const activeTab = document.querySelector('.section.active');
    if (!activeTab) return;

    const tabIndex = parseInt(activeTab.getAttribute('data-tab')) || 0;
    if (tabIndex >= 0 && tabIndex < this.steps.length) {
      const step = this.steps[tabIndex];
      if (this.progressLabel) {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        this.progressLabel.textContent = this.formatLabelForDisplay(step.label, isMobile);
      }
    }

    // Na mobile - USUŃ klasy desktop (sticky, hidden) jeśli zostały
    if (isMobile() && this.progressBarContainer) {
      this.progressBarContainer.classList.remove('sticky');
      this.progressBarContainer.classList.remove('hidden');
      if (this.progressPlaceholder) {
        this.progressPlaceholder.style.display = 'none';
        this.progressPlaceholder.classList.remove('active');
      }
    }
  },

  /**
   * Inicjalizacja – znajdź elementy i ustaw eventy.
   */
  init() {
    // ✅ Zapobiegaj wielokrotnej inicjalizacji
    if (this.initialized) {
      console.warn('[WorkflowController] Już zainicjalizowany - pomijam');
      return;
    }

    // Znajdź elementy DOM
    this.progressBarContainer = document.getElementById('progress-bar-container');
    this.progressBar = document.getElementById('global-progress-bar');
    this.progressFill = document.getElementById('top-progress-fill');
    this.progressPercentage = document.getElementById('progress-percentage');
    this.progressLabel = document.getElementById('progress-label');
    this.progressInfo = document.getElementById('global-progress-info');
    this.progressPlaceholder = document.getElementById('progress-placeholder');
    this.form = document.getElementById('heatCalcFormFull');
    this.header = document.querySelector('.top-preview-header'); // Może być null - header usunięty

    if (!this.progressBar || !this.form) {
      console.warn('WorkflowController: Nie znaleziono progress bara lub formularza');
      return;
    }

    // Ustaw początkową pozycję triggera
    if (!isMobile()) {
      this.updateTriggerOffset();

      // Setup sticky behavior
      this.setupStickyProgress();
    }

    // Hook do showTab (integracja z istniejącą nawigacją)
    this.hookShowTab();

    // Recalculate trigger po załadowaniu obrazów (hero-media)
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.updateTriggerOffset();
      }, 100);
    });

    this.initialized = true;
    console.log('✅ WorkflowController zainicjalizowany');
  },

  /**
   * ✅ Resetuje stan WorkflowController (dla nowych obliczeń)
   */
  reset() {
    this.typewriterActive = false;
    this.typewriterCompleted = false;
    this.stickyDisabled = false;

    // Wyczyść timeout jeśli istnieje
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
      this.typewriterTimeout = null;
    }

    // Ukryj kontener animacji jeśli istnieje
    const completionContainer = document.querySelector('.workflow-completion');
    if (completionContainer) {
      completionContainer.style.display = 'none';
    }

    // Resetuj również stan wizualny progress bara, jeśli jest ukryty
    if (this.progressBarContainer) {
      this.progressBarContainer.style.display = '';
      this.progressBarContainer.classList.remove('hidden');
    }
    if (this.progressPlaceholder) {
      this.progressPlaceholder.style.display = 'none';
      this.progressPlaceholder.classList.remove('active');
    }

    console.log('🔄 WorkflowController zresetowany');
  },

  /**
   * ✅ Czyści event listenery (dla cleanup)
   */
  cleanup() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
    this.initialized = false;
    console.log('🧹 WorkflowController wyczyszczony');
  },

  /**
   * Formatuje label dla mobile (krok 2 wymiary) lub desktop (Krok 2 · Wymiary)
   */
  formatLabelForDisplay(label, isMobile) {
    if (isMobile) {
      // Na mobile: "krok 2 wymiary" (bez "·", lowercase)
      return label
        .replace(/·/g, ' ') // Zamień "·" na spację
        .toLowerCase() // Zmień na lowercase
        .replace(/\s+/g, ' ') // Znormalizuj spacje
        .trim();
    } else {
      // Na desktop: oryginalny format
      return label;
    }
  },

  /**
   * Aktualizuj progress bar dla danej zakładki.
   */
  updateProgress(tabIndex) {
    if (tabIndex < 0 || tabIndex >= this.steps.length) return;

    const step = this.steps[tabIndex];

    // Aktualizuj progress bara przez transform scaleX (premium micro-motion)
    if (this.progressFill) {
      const progressValue = step.progress / 100;
      this.progressFill.dataset.progress = String(step.progress);
      if (window.MotionSystem && typeof window.MotionSystem.animateProgress === 'function') {
        window.MotionSystem.animateProgress(this.progressFill, progressValue);
      } else {
        this.progressFill.style.transform = `scaleX(${progressValue})`;
      }
    }

    // Aktualizuj procent
    if (this.progressPercentage) {
      this.progressPercentage.textContent = `${step.progress}%`;
      // Ukryj procent w pierwszej zakładce (data-tab="0")
      if (tabIndex === 0) {
        this.progressPercentage.style.display = 'none';
      } else {
        this.progressPercentage.style.display = '';
      }
    }

    // Aktualizuj label - formatuj inaczej na mobile
    if (this.progressLabel) {
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      this.progressLabel.textContent = this.formatLabelForDisplay(step.label, isMobile);
    }

    // Wyłącz sticky TYLKO w kroku 6 (wyniki, 100%)
    if (tabIndex === 6) {
      this.stickyDisabled = true;

      // Tylko na desktop - usuń sticky (mobile używa CSS sticky, nie potrzebuje JS)
      if (!isMobile() && this.progressBarContainer) {
        this.progressBarContainer.classList.remove('sticky');
        if (this.progressPlaceholder) {
          this.progressPlaceholder.style.display = 'none';
        }
      }
      console.log('🔒 Sticky progress bar wyłączony dla kroku 6');

      // NIE UKRYWAJ progress bara tutaj - ma być widoczny podczas animacji typewriter
      // Progress bar zostanie ukryty dopiero po kliknięciu "Rozpocznij personalizację"
      // w funkcji startConfigurator()

      // ═══════════════════════════════════════════════════════════════════════════
      // Uruchom finalizację (tylko raz!) - ale NIE przy powrocie do formularza
      // ═══════════════════════════════════════════════════════════════════════════
      // Sprawdź czy animacja już była pokazana (z appState)
      const appState = typeof window.getAppState === 'function' ? window.getAppState() : null;
      const animationAlreadyShown = appState?.completionAnimationShown === true;

      // Uruchom animację TYLKO jeśli:
      // 1. Nie jest aktywna
      // 2. Nie była jeszcze pokazana (ani w pamięci, ani w appState)
      if (!this.typewriterActive && !this.typewriterCompleted && !animationAlreadyShown) {
        this.startCompletion();
      } else if (animationAlreadyShown) {
        console.log('[WorkflowController] Animacja completion już była pokazana - pomijam');
        // Zsynchronizuj flagę w pamięci
        this.typewriterCompleted = true;
      }
    } else if (tabIndex === 0) {
      // ✅ NOWA LOGIKA: Gdy wracamy do formularza (tab 0), upewnij się że animacja nie jest aktywna
      if (this.typewriterActive) {
        console.log('[WorkflowController] Zatrzymuję animację completion przy powrocie do formularza');
        this.typewriterActive = false;
        // Ukryj kontener animacji jeśli istnieje
        const completionContainer = document.querySelector('.workflow-completion');
        if (completionContainer) {
          completionContainer.style.display = 'none';
        }
        // Wyczyść timeout jeśli istnieje
        if (this.typewriterTimeout) {
          clearTimeout(this.typewriterTimeout);
          this.typewriterTimeout = null;
        }
      }
      // Włącz z powrotem sticky dla kroków 0-5
      this.stickyDisabled = false;
      console.log('🔓 Sticky progress bar włączony');
    } else {
      // Włącz z powrotem sticky dla kroków 1-5
      this.stickyDisabled = false;
      console.log('🔓 Sticky progress bar włączony');
    }

    console.log(`📊 Progress bar zaktualizowany: ${step.progress}% — ${step.label}`);
  },

  /**
   * ✅ Resetuje stan WorkflowController (dla nowych obliczeń)
   */
  reset() {
    this.typewriterActive = false;
    this.typewriterCompleted = false;
    this.stickyDisabled = false;

    // Wyczyść timeout jeśli istnieje
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
      this.typewriterTimeout = null;
    }

    // Ukryj kontener animacji jeśli istnieje
    const completionContainer = document.querySelector('.workflow-completion');
    if (completionContainer) {
      completionContainer.style.display = 'none';
    }

    // Resetuj również stan wizualny progress bara, jeśli jest ukryty
    if (this.progressBarContainer) {
      this.progressBarContainer.style.display = '';
      this.progressBarContainer.classList.remove('hidden');
    }
    if (this.progressPlaceholder) {
      this.progressPlaceholder.style.display = 'none';
      this.progressPlaceholder.classList.remove('active');
    }

    console.log('🔄 WorkflowController zresetowany');
  },

  /**
   * Setup sticky progress bar (przykleja się podczas scrollowania).
   * Wyłączone tylko w kroku 6 (wyniki).
   */
  setupStickyProgress() {
    if (window.matchMedia('(max-width: 767px)').matches) {
      return;
    }
    // WYŁĄCZ CAŁKOWICIE NA MOBILE
    if (isMobile()) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // NIE aplikuj sticky jeśli jesteśmy w kroku 6
          if (this.stickyDisabled) {
            // Upewnij się że sticky jest wyłączone
            if (
              this.progressBarContainer &&
              this.progressBarContainer.classList.contains('sticky')
            ) {
              this.progressBarContainer.classList.remove('sticky');
              if (this.progressPlaceholder) {
                this.progressPlaceholder.style.display = 'none';
                this.progressPlaceholder.classList.remove('active');
              }
            }
            ticking = false;
            return;
          }

          const scrollTop =
            window.pageYOffset || document.documentElement.scrollTop || window.scrollY;

          if (this.progressBarContainer) {
            // Sprawdź czy scroll przekroczył trigger
            const shouldBeSticky = scrollTop > this.triggerOffset;

            if (shouldBeSticky && !this.progressBarContainer.classList.contains('sticky')) {
              this.progressBarContainer.classList.add('sticky');
              if (this.progressPlaceholder) {
                this.progressPlaceholder.style.display = 'block';
                this.progressPlaceholder.classList.add('active');
              }
              // Log tylko w trybie debug
              if (window.__DEBUG_STICKY) {
                console.log(
                  '[Sticky] ✅ Progress bar przyklejony, scrollTop:',
                  scrollTop,
                  'triggerOffset:',
                  this.triggerOffset
                );
              }
            } else if (!shouldBeSticky && this.progressBarContainer.classList.contains('sticky')) {
              this.progressBarContainer.classList.remove('sticky');
              if (this.progressPlaceholder) {
                this.progressPlaceholder.style.display = 'none';
                this.progressPlaceholder.classList.remove('active');
              }
              // Log tylko w trybie debug
              if (window.__DEBUG_STICKY) {
                console.log(
                  '[Sticky] ❌ Progress bar odklejony, scrollTop:',
                  scrollTop,
                  'triggerOffset:',
                  this.triggerOffset
                );
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // ✅ Zapisz referencje do handlerów (dla czyszczenia)
    this.scrollHandler = handleScroll;
    this.resizeHandler = () => {
      this.updateTriggerOffset();
      this.handleResize(); // Aktualizuj format labela przy zmianie rozmiaru okna
    };

    // Scroll listener
    window.addEventListener('scroll', this.scrollHandler);

    // Recalculate on window resize
    window.addEventListener('resize', this.resizeHandler);
  },

  /**
   * Aktualizuj pozycję triggera (gdzie progress bar staje się sticky).
   */
  updateTriggerOffset() {
    if (isMobile()) return;

    if (this.progressBarContainer) {
      // Oblicz pozycję progress bara względem dokumentu
      const progressBarRect = this.progressBarContainer.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Absolutna pozycja progress bara w dokumencie
      const progressBarTop = progressBarRect.top + scrollTop;

      // Wysokość headera WordPress (80px) + 15px padding = 95px
      let headerHeight = 80; // Nagłówek WordPress ma 80px wysokości
      if (this.header) {
        const headerRect = this.header.getBoundingClientRect();
        headerHeight = headerRect.height || this.header.offsetHeight || 80;
      }
      // Dodaj 15px padding powyżej progress bara
      headerHeight += 15;

      // Trigger: progress bar staje się sticky gdy jego górna krawędź
      // zrówna się z dolną krawędzią headera podczas scrollowania
      this.triggerOffset = progressBarTop - headerHeight;

      // Na mobile, zmniejsz trigger offset dla wcześniejszego przyklejenia
      const isMobile = window.matchMedia('(max-width: 767px)').matches;
      if (isMobile) {
        this.triggerOffset = Math.max(0, this.triggerOffset - 10); // 10px wcześniej
      }

      // Ustaw CSS variable dla sticky top position
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

      // Log tylko w trybie debug
      if (window.__DEBUG_STICKY) {
        console.log(
          `[Sticky] 📍 Trigger offset: ${this.triggerOffset}px | Header: ${headerHeight}px | Progress top: ${progressBarTop}px | Mobile: ${isMobile}`
        );
      }
    } else if (this.form) {
      const formRect = this.form.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.triggerOffset = Math.max(0, formRect.top + scrollTop - 60);
    }
  },

  /**
   * Hook do funkcji showTab (integracja z istniejącą nawigacją).
   */
  hookShowTab() {
    // Nadpisz oryginalną funkcję showTab
    const originalShowTab = window.showTab;

    if (originalShowTab) {
      window.showTab = index => {
        // Wywołaj oryginalną funkcję
        originalShowTab(index);

        // Aktualizuj progress bar
        this.updateProgress(index);

        // Sticky/logika scrolla tylko na desktop/tablet
        if (!isMobile() && !this.stickyDisabled && this.progressBarContainer) {
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

          // Jeśli jesteśmy poniżej triggera, usuń sticky
          if (scrollTop <= this.triggerOffset) {
            this.progressBarContainer.classList.remove('sticky');
            if (this.progressPlaceholder) {
              this.progressPlaceholder.style.display = 'none';
            }
          }
        }
      };

      console.log('✅ WorkflowController zintegrowany z showTab');
    } else {
      console.warn('WorkflowController: Nie znaleziono funkcji showTab');
    }
  },

  /**
   * Animacja typewriter dla ostatniego kroku (finalizacja).
   */
  async startCompletion() {
    this.typewriterActive = true;
    this.typewriterCompleted = true; // Oznacz że animacja została pokazana

    // ═══════════════════════════════════════════════════════════════════════════
    // ZAPISZ W APPSTATE że animacja już była pokazana
    // ═══════════════════════════════════════════════════════════════════════════
    if (typeof window.updateAppState === 'function') {
      window.updateAppState({ completionAnimationShown: true });
    }

    // Znajdź lub stwórz kontener finalizacji
    let completionContainer = document.querySelector('.workflow-completion');
    if (!completionContainer) {
      completionContainer = document.createElement('div');
      completionContainer.className = 'workflow-completion';

      // Wstaw po progress barze, przed konfiguratorem
      const resultsSection = document.querySelector('.section[data-tab="6"]');
      if (resultsSection) {
        const switcher = resultsSection.querySelector('#results-switcher');
        if (switcher) {
          resultsSection.insertBefore(completionContainer, switcher);
        } else {
          resultsSection.insertBefore(completionContainer, resultsSection.firstChild);
        }
      }
    }

    // Ukryj konfigurator na chwilę (profil energetyczny zostaje dostępny)
    const configView = document.getElementById('configurator-view');
    const switcher = document.getElementById('results-switcher');

    // Użyj klas CSS zamiast inline style.display (zapobiega konfliktom)
    if (configView) {
      configView.classList.remove('visible');
      configView.classList.add('hidden');
      configView.style.display = ''; // Usuń inline style jeśli istnieje
    }
    if (switcher) {
      switcher.style.display = 'none';
    }

    // Treść animacji
    const messages = [
      'Gratulacje! Zakończyłeś obliczenia związane z OZC Twojego budynku.',
      'Twoja pompa została dopasowana pod budynek. Teraz możesz dostosować maszynownię i cały osprzęt dokładnie pod Twoje potrzeby.',
    ];

    // Animuj wiadomości
    completionContainer.innerHTML = '<div class="typewriter-container"></div>';
    const typewriterContainer = completionContainer.querySelector('.typewriter-container');

    for (let i = 0; i < messages.length; i++) {
      await this.typeMessage(messages[i], typewriterContainer, i === 0 ? 1500 : 1200);
    }

    // Pokaż przycisk CTA
    const ctaHTML = `
      <div class="workflow-cta">
        <button type="button" class="workflow-cta-button" onclick="WorkflowController.startConfigurator(event)">
          Rozpocznij personalizację
          <i class="ph ph-arrow-right"></i>
        </button>
      </div>
    `;
    completionContainer.insertAdjacentHTML('beforeend', ctaHTML);

    // Fade in button
    setTimeout(() => {
      const cta = completionContainer.querySelector('.workflow-cta');
      if (cta) cta.classList.add('visible');
    }, 400);

    console.log('✅ Animacja finalizacji zakończona');
  },

  /**
   * Typewriter effect dla pojedynczej wiadomości.
   */
  typeMessage(message, container, duration) {
    return new Promise(resolve => {
      const textElement = document.createElement('div');
      textElement.className = 'typewriter-text typing';
      container.appendChild(textElement);

      const chars = message.split('');
      const charDelay = duration / chars.length;
      let currentIndex = 0;

      const typeChar = () => {
        if (currentIndex < chars.length) {
          textElement.textContent += chars[currentIndex];
          currentIndex++;
          setTimeout(typeChar, charDelay);
        } else {
          // Usuń kursor mrugający
          textElement.classList.remove('typing');
          setTimeout(resolve, 600); // Krótka pauza przed następną wiadomością
        }
      };

      typeChar();
    });
  },

  /**
   * Rozpocznij konfigurator (po kliknięciu CTA).
   * Pokazuje konfigurator i scrolluje do jego góry.
   */
  startConfigurator(event) {
    // Zapobiegnij domyślnemu zachowaniu (submit formularza)
    if (event && event.preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Ukryj kontener finalizacji
    const completionContainer = document.querySelector('.workflow-completion');
    if (completionContainer) {
      completionContainer.style.display = 'none';
    }

    // UKRYJ PROGRESS BAR - gdy konfigurator lub profil energetyczny jest wyświetlany
    if (this.progressBarContainer) {
      this.progressBarContainer.style.display = 'none';
      this.progressBarContainer.classList.add('hidden');
      // Ukryj również placeholder jeśli istnieje
      if (this.progressPlaceholder) {
        this.progressPlaceholder.style.display = 'none';
        this.progressPlaceholder.classList.remove('active');
      }
      console.log('🔒 Progress bar ukryty po rozpoczęciu personalizacji');
    }

    // Pokaż konfigurator i switcher - używaj klas CSS zamiast inline style
    const configView = document.getElementById('configurator-view');
    const energyProfileView = document.getElementById('energy-profile-view');
    const switcher = document.getElementById('results-switcher');

    // Użyj klas CSS zamiast inline style.display (zapobiega konfliktom)
    if (configView) {
      configView.classList.remove('hidden');
      configView.classList.add('visible');
      configView.style.display = ''; // Usuń inline style jeśli istnieje
    }
    if (switcher) {
      switcher.style.display = 'flex'; // Switcher może mieć inline display
    }

    // Scroll do góry sekcji wyników (nie do początku formularza!)
    setTimeout(() => {
      const resultsSection = document.querySelector('.section[data-tab="6"]');
      if (resultsSection) {
        // Oblicz pozycję z uwzględnieniem headera i małego bufora
        const headerHeight = this.header ? this.header.offsetHeight : 60;
        const buffer = 20; // Mały odstęp dla lepszego UX
        const targetY = resultsSection.offsetTop - headerHeight - buffer;

        window.scrollTo({
          top: targetY,
          behavior: 'smooth',
        });

        console.log('✅ Scrollowanie do góry konfiguratora');
      }
    }, 100); // Krótkie opóźnienie dla płynności

    console.log('✅ Konfigurator uruchomiony');
  },
};

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    WorkflowController.init();
  });
} else {
  WorkflowController.init();
}

// Export
window.WorkflowController = WorkflowController;
