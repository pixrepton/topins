/**
 * MOBILE CONTROLLER
 * Handles mobile-specific behaviors for TOP-INSTAL Heat Pump Calculator
 *
 * Features:
 * - Touch gesture handling
 * - Bottom navigation visibility
 * - Progress bar hide/show on scroll
 * - Accordion controls
 * - Toast notifications
 * - Keyboard detection
 *
 * Version: 1.0
 * Date: 16.12.2025
 */

const MobileController = {
  // State
  state: {
    isMobile: false,
    isKeyboardOpen: false,
    lastScrollY: 0,
    scrollDirection: 'down',
    touchStartX: 0,
    touchStartY: 0,
  },

  // DOM Elements
  elements: {
    progressBar: null,
    bottomNav: null,
    body: null,
  },

  /**
   * Initialize Mobile Controller
   */
  init() {
    console.log('🚀 MobileController: Initializing...');

    // Check if mobile
    this.state.isMobile = this.checkIsMobile();

    if (!this.state.isMobile) {
      console.log('⏭️  MobileController: Not mobile, skipping...');
      return;
    }

    // Get DOM elements
    this.elements.progressBar = document.querySelector('.progress-bar-container');
    this.elements.bottomNav = document.querySelector('.step-nav, .bottom-nav-mobile');
    this.elements.body = document.body;

    // Setup event listeners
    this.setupScrollBehavior();
    this.setupKeyboardDetection();
    this.setupTouchHandlers();
    this.setupAccordions();

    // Add body class for bottom nav padding
    if (this.elements.bottomNav && this.state.isMobile) {
      this.elements.body.classList.add('has-bottom-nav');
      console.log('📱 Added has-bottom-nav class to body');
    }

    console.log('✅ MobileController: Initialized successfully');
  },

  /**
   * Check if device is mobile
   */
  checkIsMobile() {
    return window.matchMedia('(max-width: 767px)').matches;
  },

  /**
   * Setup scroll behavior for progress bar and bottom nav
   */
  setupScrollBehavior() {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.pageYOffset || window.scrollY;
          const scrollDiff = currentScrollY - this.state.lastScrollY;

          // Determine scroll direction
          if (scrollDiff > 0) {
            this.state.scrollDirection = 'down';
          } else if (scrollDiff < 0) {
            this.state.scrollDirection = 'up';
          }

          // Update last scroll position
          this.state.lastScrollY = currentScrollY;

          // Progress bar - NO hide/show logic on mobile (CSS sticky handles everything)
          // Zostawione puste dla przejrzystości - progress bar działa identycznie jak na desktop

          // Handle bottom nav visibility (hide when scrolling down, show when scrolling up)
          if (this.elements.bottomNav && !this.state.isKeyboardOpen) {
            if (this.state.scrollDirection === 'down' && scrollDiff > 5) {
              this.elements.bottomNav.classList.add('hidden');
            } else if (this.state.scrollDirection === 'up' && scrollDiff < -5) {
              this.elements.bottomNav.classList.remove('hidden');
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  },

  /**
   * Setup keyboard detection (iOS/Android)
   */
  setupKeyboardDetection() {
    const initialViewportHeight = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    const checkKeyboard = () => {
      const currentViewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      // If viewport height decreased significantly, keyboard is open
      const isKeyboardOpen = currentViewportHeight < initialViewportHeight * 0.75;

      if (isKeyboardOpen !== this.state.isKeyboardOpen) {
        this.state.isKeyboardOpen = isKeyboardOpen;

        if (this.elements.bottomNav) {
          if (isKeyboardOpen) {
            this.elements.bottomNav.classList.add('hidden');
          } else {
            this.elements.bottomNav.classList.remove('hidden');
          }
        }

        console.log(`⌨️  Keyboard ${isKeyboardOpen ? 'opened' : 'closed'}`);
      }
    };

    // Listen for viewport resize (keyboard open/close)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboard);
    } else {
      window.addEventListener('resize', checkKeyboard);
    }

    // Also check on focus/blur of inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        setTimeout(checkKeyboard, 300); // Delay to ensure viewport has resized
      });
      input.addEventListener('blur', () => {
        setTimeout(checkKeyboard, 300);
      });
    });
  },

  /**
   * Setup touch gesture handlers
   */
  setupTouchHandlers() {
    // Swipe detection for cards
    const swipeableCards = document.querySelectorAll('.option-card, .product-card');

    swipeableCards.forEach(card => {
      card.addEventListener('touchstart', this.handleTouchStart.bind(this), {
        passive: true,
      });
      card.addEventListener('touchmove', this.handleTouchMove.bind(this), {
        passive: true,
      });
      card.addEventListener('touchend', this.handleTouchEnd.bind(this), {
        passive: true,
      });
    });

    // Tap feedback for buttons
    const buttons = document.querySelectorAll('button, .building-type-card, .radio-option-mobile');
    buttons.forEach(btn => {
      btn.addEventListener('touchstart', () => {
        btn.classList.add('touch-active');
      });
      btn.addEventListener('touchend', () => {
        setTimeout(() => btn.classList.remove('touch-active'), 150);
      });
      btn.addEventListener('touchcancel', () => {
        btn.classList.remove('touch-active');
      });
    });
  },

  /**
   * Handle touch start
   */
  handleTouchStart(e) {
    this.state.touchStartX = e.touches[0].clientX;
    this.state.touchStartY = e.touches[0].clientY;
  },

  /**
   * Handle touch move
   */
  handleTouchMove(e) {
    // Can be used for drag feedback
  },

  /**
   * Handle touch end
   */
  handleTouchEnd(e) {
    if (!this.state.touchStartX || !this.state.touchStartY) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchEndX - this.state.touchStartX;
    const diffY = touchEndY - this.state.touchStartY;

    // Horizontal swipe (threshold 50px)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // Swipe right
        this.onSwipeRight(e.target);
      } else {
        // Swipe left
        this.onSwipeLeft(e.target);
      }
    }

    // Reset
    this.state.touchStartX = 0;
    this.state.touchStartY = 0;
  },

  /**
   * Swipe right handler
   */
  onSwipeRight(target) {
    console.log('👉 Swipe right detected');
    // Can be used for navigation (e.g., go back)
  },

  /**
   * Swipe left handler
   */
  onSwipeLeft(target) {
    console.log('👈 Swipe left detected');
    // Can be used for navigation (e.g., go forward)
  },

  /**
   * Setup accordion functionality
   * Based on MOBILE_ANALYSIS_REPORT.md section 8.2 E
   * Auto-detects which help-boxes need accordion mode vs. open mode
   */
  setupAccordions() {
    const helpBoxes = document.querySelectorAll('.help-box');

    helpBoxes.forEach((helpBox, index) => {
      // Analyze content to decide accordion vs. open
      const shouldBeAccordion = this.shouldHelpBoxBeAccordion(helpBox, index);

      if (!shouldBeAccordion) {
        // Keep open (no accordion behavior)
        helpBox.classList.add('help-box--always-open');
        return;
      }

      // Transform to accordion
      this.createAccordion(helpBox);
    });

    console.log(`📦 Setup accordions: ${helpBoxes.length} help-boxes processed`);
  },

  /**
   * Determine if help-box should be accordion (based on helpbox_report.py logic)
   * @param {HTMLElement} helpBox
   * @param {number} index
   * @returns {boolean}
   */
  shouldHelpBoxBeAccordion(helpBox, index) {
    // Count paragraphs
    const pCount = helpBox.querySelectorAll('p').length;

    // Count images/maps
    const imgCount = helpBox.querySelectorAll('img, .zone-map').length;

    // Get text length
    const textLength = helpBox.textContent.trim().length;

    // Check if full-width (instruction box)
    const isFullWidth = helpBox.classList.contains('help-box--full-width');

    // Check if first in DOM (first step)
    const isFirst = index === 0;

    // Logic from helpbox_report.py:
    // - Full-width instruction: keep open
    if (isFullWidth) {
      return false;
    }

    // - First step + short (<320 chars): keep open
    if (isFirst && textLength <= 320) {
      return false;
    }

    // - Contains image/map: accordion
    if (imgCount > 0) {
      return true;
    }

    // - Long content (>=4 paragraphs OR >380 chars): accordion
    if (pCount >= 4 || textLength > 380) {
      return true;
    }

    // - Default: accordion (keeps UI calm)
    return true;
  },

  /**
   * Create accordion from help-box
   * @param {HTMLElement} helpBox
   */
  createAccordion(helpBox) {
    // Get existing h4 (or h3) as title source
    const titleElement = helpBox.querySelector('h4, h3');
    const titleText = titleElement ? titleElement.textContent.trim() : 'Jak to działa?';

    // Create toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'help-toggle';
    toggleButton.type = 'button';
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.innerHTML = `
      <span class="help-toggle-title">${titleText}</span>
      <svg class="help-toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    // Wrap content (everything except toggle button)
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'help-content';
    contentWrapper.style.maxHeight = '0';
    contentWrapper.style.overflow = 'hidden';
    contentWrapper.style.transition = 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    // Move all children to content wrapper
    while (helpBox.firstChild) {
      contentWrapper.appendChild(helpBox.firstChild);
    }

    // Add toggle button and content wrapper to help-box
    helpBox.appendChild(toggleButton);
    helpBox.appendChild(contentWrapper);

    // Mark as accordion
    helpBox.classList.add('help-box--accordion');

    // Add toggle behavior
    toggleButton.addEventListener('click', e => {
      e.preventDefault();
      const isOpen = helpBox.classList.contains('help-box--open');

      if (isOpen) {
        // Close
        helpBox.classList.remove('help-box--open');
        toggleButton.setAttribute('aria-expanded', 'false');
        contentWrapper.style.maxHeight = '0';
      } else {
        // Open
        helpBox.classList.add('help-box--open');
        toggleButton.setAttribute('aria-expanded', 'true');
        contentWrapper.style.maxHeight = contentWrapper.scrollHeight + 'px';
      }

      // Haptic feedback
      this.vibrate(10);
    });
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 3000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast-mobile');
    existingToasts.forEach(toast => toast.remove());

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast-mobile ${type}`;

    let icon = '';
    switch (type) {
      case 'success':
        icon =
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        break;
      case 'error':
        icon =
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        break;
      default:
        icon =
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    document.body.appendChild(toast);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);

    // Haptic feedback
    this.vibrate(15);

    return toast;
  },

  /**
   * Haptic feedback (iOS/Android)
   */
  vibrate(duration = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  },

  /**
   * Show loading overlay
   */
  showLoading(text = 'Ładowanie...') {
    // Remove existing overlay
    const existingOverlay = document.querySelector('.loading-overlay-mobile');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay-mobile';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="spinner-mobile"></div>
        <div class="loading-text">${text}</div>
      </div>
    `;

    document.body.appendChild(overlay);
    return overlay;
  },

  /**
   * Hide loading overlay
   */
  hideLoading() {
    const overlay = document.querySelector('.loading-overlay-mobile');
    if (overlay) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }
  },

  /**
   * Scroll to element (mobile-optimized)
   */
  scrollTo(element, offset = 0) {
    if (!element) return;

    const targetY = element.offsetTop - offset;
    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  },

  /**
   * Update progress bar (mobile-specific formatting)
   */
  updateProgress(step, total) {
    const progressBar = document.querySelector('.form-progress-fill');
    const progressLabel = document.querySelector('.form-progress-label');
    const progressStep = document.querySelector('.progress-step');

    if (progressBar) {
      const percentage = Math.round((step / total) * 100);
      progressBar.style.width = `${percentage}%`;
    }

    if (progressStep) {
      progressStep.textContent = `Krok ${step} / ${total}`;
    }

    if (progressLabel && this.state.isMobile) {
      // Mobile formatting: lowercase, no bullets
      const stepLabels = [
        'start wprowadzenie',
        'wymiary',
        'konstrukcja',
        'okna drzwi',
        'izolacje',
        'finalizacja',
        'wyniki',
      ];
      progressLabel.textContent = stepLabels[step - 1] || '';
    }
  },

  /**
   * Handle bottom nav button states
   */
  updateNavButtons(canGoBack, canGoForward) {
    const backBtn = document.querySelector('#nav-prev, .btn-back');
    const nextBtn = document.querySelector('#nav-next, .btn-next');

    if (backBtn) {
      backBtn.disabled = !canGoBack;
    }

    if (nextBtn) {
      nextBtn.disabled = !canGoForward;
    }
  },

  /**
   * Add touch-active class temporarily
   */
  addTouchFeedback(element) {
    if (!element) return;

    element.classList.add('touch-active');
    setTimeout(() => {
      element.classList.remove('touch-active');
    }, 150);

    // Haptic
    this.vibrate(10);
  },

  /**
   * Format number for mobile (shorter)
   */
  formatNumber(num, unit = '') {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k${unit}`;
    }
    return `${num}${unit}`;
  },

  /**
   * Detect if iOS
   */
  isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  /**
   * Detect if Android
   */
  isAndroid() {
    return /Android/.test(navigator.userAgent);
  },

  /**
   * Get safe area insets (iOS notch)
   */
  getSafeAreaInsets() {
    if (!this.isIOS()) return { top: 0, bottom: 0 };

    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)')) || 0,
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
    };
  },

  /**
   * Debug mobile info
   */
  debugInfo() {
    console.group('📱 Mobile Debug Info');
    console.log('Device:', this.isIOS() ? 'iOS' : this.isAndroid() ? 'Android' : 'Other');
    console.log('Viewport:', `${window.innerWidth}×${window.innerHeight}`);
    console.log('Is Mobile:', this.state.isMobile);
    console.log('Keyboard Open:', this.state.isKeyboardOpen);
    console.log('Scroll Direction:', this.state.scrollDirection);
    console.log('Safe Area Insets:', this.getSafeAreaInsets());
    console.groupEnd();
  },
};

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MobileController.init();
  });
} else {
  MobileController.init();
}

// Export for use in other modules
window.MobileController = MobileController;

// Debug shortcut (console)
window.mobileDebug = () => MobileController.debugInfo();
