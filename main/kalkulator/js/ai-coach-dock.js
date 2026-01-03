(function () {
  'use strict';
  
  // Elementy DOM
  const dock = document.getElementById('ai-coach-dock');
  const aiIcon = document.getElementById('ai-coach-icon');
  const aiSvg = document.getElementById('ai-icon-svg');
  const aiLoader = document.getElementById('ai-coach-loader');
  const dockText = document.getElementById('ai-coach-dock-text');
  const btnPause = document.getElementById('ai-coach-pause');
  const btnResume = document.getElementById('ai-coach-resume');
  const panel = document.getElementById('ai-coach-panel');
  const panelContext = document.getElementById('ai-coach-panel-context');
  const panelClose = panel ? panel.querySelector('.ai-coach-panel__close') : null;
  const panelApply = document.getElementById('ai-coach-apply-recommendation');

  // Stan
  let paused = localStorage.getItem('ai_coach_pause') === '1';
  let idleTimer = null;
  let aiMode = "rest"; // 'rest' | 'thinking' | 'assist' | 'paused'

  // Podpowiedzi – delikatne, uspokajające komunikaty
  const aiTips = [
    "Masz wątpliwości? Kliknij bańkę w prawym dolnym rogu – doradca podpowie.",
    "Zawsze możesz zmienić wybory maszynowni przed wysłaniem zapytania.",
    "Zasobnik CWU i bufor dobieramy tak, aby instalacja była serwisowo poprawna.",
  ];

  // Stan domyślny
  function setRestMode() {
    if (!dock || !dockText || !aiSvg || !aiLoader) return;
    
    aiMode = "rest";
    aiSvg.style.display = "";
    aiLoader.hidden = true;
    dockText.textContent = "Masz wątpliwości? Zapytaj doradcę";
    if (btnPause) btnPause.hidden = false;
    if (btnResume) btnResume.hidden = true;
    dock.classList.remove('ai-coach-paused');
  }

  // AI „myśli/ładuje się" (po 4s idle)
  function setThinkingMode() {
    if (!dock || !dockText || !aiSvg || !aiLoader) return;
    
    aiMode = "thinking";
    aiSvg.style.display = "none";
    aiLoader.hidden = false;
    dockText.textContent = "Wyszukiwanie wskazówki…";
    if (btnPause) btnPause.hidden = false;
    if (btnResume) btnResume.hidden = true;
  }

  // AI wyświetla podpowiedź
  function setAssistMode() {
    if (!dock || !dockText || !aiSvg || !aiLoader) return;
    
    aiMode = "assist";
    aiSvg.style.display = "none";
    aiLoader.hidden = true;
    const tip = aiTips[Math.floor(Math.random() * aiTips.length)];
    dockText.textContent = tip;
    if (btnPause) btnPause.hidden = false;
    if (btnResume) btnResume.hidden = true;
  }

  // Tryb OFF/PAUSE
  function setPausedMode() {
    if (!dock || !dockText || !aiSvg || !aiLoader) return;
    
    aiMode = "paused";
    aiSvg.style.display = "none";
    aiLoader.hidden = true;
    // ✅ FIXED: Skrócony tekst dla lepszej czytelności na mobile
    dockText.textContent = "Asystent AI wyłączony";
    if (btnPause) btnPause.hidden = true;
    if (btnResume) btnResume.hidden = false;
    dock.classList.add('ai-coach-paused');
  }

  // Przejście do trybu pauzy
  function pauseAI() {
    paused = true;
    localStorage.setItem('ai_coach_pause', '1');
    clearTimeout(idleTimer);
    setPausedMode();
  }
  
  // Wznów AI
  function resumeAI() {
    paused = false;
    localStorage.setItem('ai_coach_pause', '0');
    setRestMode();
    startIdleTimer();
  }

  // Start od właściwego trybu
  function initializeAI() {
    if (!dock) return;
    
    if (paused) {
      setPausedMode();
    } else {
      setRestMode();
      startIdleTimer();
    }
  }

  // Główna logika idle
  function startIdleTimer() {
    if (paused || !dock) return;
    clearTimeout(idleTimer);
    setRestMode();
    idleTimer = setTimeout(() => {
      setThinkingMode();
      setTimeout(() => {
        if (aiMode === "thinking") setAssistMode();
      }, 1600); // animacja „myślenia"
    }, 4000);
  }

  // Reset na dowolną akcję użytkownika
  function resetIdleTimer() {
    if (paused || !dock) return;
    clearTimeout(idleTimer);
    setRestMode();
    startIdleTimer();
  }

  function detectCurrentConfiguratorContext() {
    const root = document.getElementById('configurator-root');
    if (!root) return null;
    const rect = root.getBoundingClientRect();
    const midY = rect.top + rect.height / 3;
    const el = document.elementFromPoint(
      window.innerWidth / 2,
      Math.min(window.innerHeight - 100, midY),
    );
    const section = el && el.closest('.configurator-section');
    if (!section) return null;
    const key = section.getAttribute('data-section-id') || null;
    const titleEl = section.querySelector('.section-title h4, h4, h3');
    const label = titleEl ? titleEl.textContent.trim() : 'Twoja maszynownia';
    return { key, label };
  }

  function openPanel() {
    if (!panel) return;
    const ctx = detectCurrentConfiguratorContext();
    if (panelContext) {
      panelContext.textContent = ctx ? `Sekcja: ${ctx.label}` : 'Twoja maszynownia';
    }
    panel.hidden = false;
  }

  function closePanel() {
    if (!panel) return;
    panel.hidden = true;
  }

  function applyRecommendationForCurrentContext() {
    if (!window.configuratorState) {
      closePanel();
      return;
    }
    const ctx = detectCurrentConfiguratorContext();
    if (!ctx || !ctx.key) {
      closePanel();
      return;
    }

    const state = window.configuratorState;

    // Prosta logika: CWU wg recommendedCapacity
    if (ctx.key === 'cwu' && window.evaluateRules && window.configuratorSelectOption) {
      const evaluated = window.evaluateRules(state);
      const cap = evaluated?.cwuRules?.recommendedCapacity;
      const cwuData = state.data.cwuOptions;
      if (cap && cwuData) {
        const candidates = [];
        if (Array.isArray(cwuData)) {
          candidates.push(...cwuData);
        } else if (cwuData.catalog) {
          Object.values(cwuData.catalog).forEach((byType) => {
            Object.values(byType).forEach((entry) => candidates.push(entry));
          });
        }

        let best = null;
        let bestDiff = Infinity;
        candidates.forEach((o) => {
          const volume = typeof o?.volume_l !== 'undefined' ? o.volume_l : o?.capacity_l;
          if (typeof volume === 'undefined') return;
          const diff = Math.abs(Number(volume) - cap);
          if (diff < bestDiff) {
            bestDiff = diff;
            best = o;
          }
        });
        if (best) {
          window.configuratorSelectOption('cwu', best.id);
        }
      }
    }

    // Bufor wg zakresu rekomendowanego
    if (ctx.key === 'buffer' && window.evaluateRules) {
      const evaluated = window.evaluateRules(state);
      const bufferData = state.data.bufferConfig;
      const capacities = bufferData?.capacities || [];
      if (!capacities.length) return closePanel();

      const target =
        bufferData?.recommendedCapacity ||
        evaluated?.bufferRules?.recommendedMin ||
        capacities[0];

      const closest = capacities.reduce((best, candidate) => {
        if (best === null) return candidate;
        return Math.abs(candidate - target) < Math.abs(best - target)
          ? candidate
          : best;
      }, null);

      if (window.selectBufferCapacity && closest) {
        window.selectBufferCapacity(closest);
      }
    }

    closePanel();
  }

  // Inicjalizacja po załadowaniu DOM
  function initialize() {
    // Sprawdź czy elementy istnieją
    if (!dock) {
      console.warn('AI Coach Dock: Element #ai-coach-dock nie został znaleziony');
      return;
    }

    // Dodaj nasłuchiwanie na akcje użytkownika
    ['input','change','click','keydown','mousemove','touchstart'].forEach(ev =>
      window.addEventListener(ev, resetIdleTimer, true)
    );

    // Przycisk pauzy / wznów
    if (btnPause) btnPause.addEventListener('click', pauseAI);
    if (btnResume) btnResume.addEventListener('click', resumeAI);

    // Kliknięcie ikony – otwarcie panelu pomocy
    if (aiIcon) {
      aiIcon.addEventListener('click', function () {
        if (paused) return;
        openPanel();
      });
    }

    if (panelClose) {
      panelClose.addEventListener('click', closePanel);
    }
    if (panelApply) {
      panelApply.addEventListener('click', applyRecommendationForCurrentContext);
    }

    // Inicjalizuj AI
    initializeAI();
  }

  // API dla deva: pokaż panel ręcznie
  window.aiCoachDockShow = function () {
    if (!paused) openPanel();
  };
  window.aiCoachDockPause = pauseAI;
  window.aiCoachDockResume = resumeAI;

  // Inicjalizuj gdy DOM jest gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();