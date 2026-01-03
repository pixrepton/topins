(function (window) {
  'use strict';

  const MotionSystem = {
    initialized: false,
    reduceMotion: false,
    reduceMedia: null,

    init() {
      if (this.initialized) return;
      this.reduceMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reduceMotion = this.reduceMedia.matches;
      if (this.reduceMedia.addEventListener) {
        this.reduceMedia.addEventListener('change', e => {
          this.reduceMotion = e.matches;
        });
      } else if (this.reduceMedia.addListener) {
        this.reduceMedia.addListener(e => {
          this.reduceMotion = e.matches;
        });
      }

      this.setupSteps();
      this.setupProgressBar();
      this.observeOptionMutations();
      this.observeNewOptions();
      this.setupOptions(document);

      this.initialized = true;
    },

    getVar(el, name, fallback) {
      const scope = el || document.documentElement;
      const raw = window.getComputedStyle(scope).getPropertyValue(name).trim();
      if (!raw) return fallback;
      if (raw.endsWith('ms')) return parseFloat(raw);
      if (raw.endsWith('s')) return parseFloat(raw) * 1000;
      const numeric = parseFloat(raw);
      return Number.isNaN(numeric) ? fallback : numeric;
    },

    getEasing(el, name, fallback) {
      const scope = el || document.documentElement;
      const raw = window.getComputedStyle(scope).getPropertyValue(name).trim();
      return raw || fallback;
    },

    cancelAnimations(el) {
      if (!el || !el.getAnimations) return;
      el.getAnimations().forEach(anim => anim.cancel());
    },

    animate(el, keyframes, options) {
      if (!el || !el.animate) return null;
      const duration = this.reduceMotion ? 0 : options.duration;
      this.cancelAnimations(el);
      el.style.willChange = 'transform, opacity';
      const anim = el.animate(keyframes, { ...options, duration });
      if (anim) {
        const reset = () => {
          el.style.willChange = 'auto';
        };
        anim.onfinish = reset;
        anim.oncancel = reset;
      }
      return anim;
    },

    animatePress(el, isDown) {
      const duration = this.getVar(el, isDown ? '--m-press' : '--m-release', 80);
      const easing = this.getEasing(el, '--e-standard', 'cubic-bezier(0.2, 0.8, 0.2, 1)');
      const from = isDown ? 'translateY(0px)' : 'translateY(1px)';
      const to = isDown ? 'translateY(1px)' : 'translateY(0px)';
      return this.animate(el, [{ transform: from }, { transform: to }], {
        duration,
        easing,
        fill: 'both',
      });
    },

    animateSelect(el) {
      if (!el) return;
      const check = el.querySelector('.ui-option__check');
      if (!check) return;
      const duration = this.getVar(el, '--m-snap', 160);
      const easing = this.getEasing(el, '--e-snap', 'cubic-bezier(0.2, 0.9, 0.2, 1)');
      this.animate(
        check,
        [
          { opacity: 0, transform: 'translateY(-50%) scale(0.92)' },
          { opacity: 1, transform: 'translateY(-50%) scale(1)' },
        ],
        { duration, easing, fill: 'both' }
      );
    },

    animateScanline(el) {
      if (!el || el.classList.contains('has-scanline')) return;
      const scan = el.querySelector('.ui-option__scan');
      if (!scan) return;
      const duration = this.getVar(el, '--m-scan', 280);
      const easing = this.getEasing(el, '--e-standard', 'cubic-bezier(0.2, 0.8, 0.2, 1)');
      this.cancelAnimations(scan);
      scan.style.opacity = '0';
      scan.style.transform = 'translate(-100%, -50%)';
      const anim = this.animate(
        scan,
        [
          { opacity: 0, transform: 'translate(-100%, -50%)' },
          { opacity: 0.55, transform: 'translate(0%, -50%)' },
        ],
        { duration, easing, fill: 'both' }
      );
      if (anim) {
        anim.onfinish = () => {
          scan.style.opacity = '0.2';
          scan.style.transform = 'translate(0%, -50%)';
          el.classList.add('has-scanline');
        };
      } else {
        el.classList.add('has-scanline');
      }
    },

    animateStep(outEl, inEl, direction = 1) {
      if (!outEl || !inEl) return Promise.resolve();
      const distance = direction >= 0 ? 14 : -14;
      const duration = this.getVar(inEl, '--m-step', 240);
      const easing = this.getEasing(inEl, '--e-standard', 'cubic-bezier(0.2, 0.8, 0.2, 1)');

      const outAnim = this.animate(
        outEl,
        [
          { opacity: 1, transform: 'translateX(0px)' },
          { opacity: 0, transform: `translateX(${-distance}px)` },
        ],
        { duration, easing, fill: 'both' }
      );

      const inAnim = this.animate(
        inEl,
        [
          { opacity: 0, transform: `translateX(${distance}px)` },
          { opacity: 1, transform: 'translateX(0px)' },
        ],
        { duration, easing, fill: 'both' }
      );

      return Promise.all(
        [outAnim, inAnim].filter(Boolean).map(anim => anim.finished.catch(() => null))
      );
    },

    animateReveal(el) {
      if (!el) return;
      const duration = this.getVar(el, '--m-reveal', 260);
      const easing = this.getEasing(el, '--e-standard', 'cubic-bezier(0.2, 0.8, 0.2, 1)');
      this.animate(
        el,
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ],
        { duration, easing, fill: 'both' }
      );
    },

    animateCrossfade(el) {
      if (!el) return;
      const duration = this.reduceMotion ? 0 : 200;
      const easing = this.getEasing(el, '--e-soft', 'cubic-bezier(0.25, 0.1, 0.25, 1)');
      this.animate(
        el,
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ],
        { duration, easing, fill: 'both' }
      );
    },

    animateAttach(el) {
      if (!el) return;
      const duration = this.reduceMotion ? 0 : 180;
      const easing = this.getEasing(el, '--e-standard', 'cubic-bezier(0.2, 0.8, 0.2, 1)');
      this.animate(
        el,
        [
          { opacity: 0, transform: 'translateX(10px)' },
          { opacity: 1, transform: 'translateX(0px)' },
        ],
        { duration, easing, fill: 'both' }
      );
      el.classList.add('is-attaching');
      window.setTimeout(() => el.classList.remove('is-attaching'), 300);
    },

    animatePrice(el) {
      if (!el) return;
      const duration = this.reduceMotion ? 0 : 200;
      const easing = this.getEasing(el, '--e-soft', 'cubic-bezier(0.25, 0.1, 0.25, 1)');
      this.animate(
        el,
        [
          { opacity: 0, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ],
        { duration, easing, fill: 'both' }
      );
    },

    animateProgress(fillEl, progressValue) {
      if (!fillEl) return;
      const duration = this.getVar(fillEl, '--m-step', 240);
      const easing = this.getEasing(fillEl, '--e-standard', 'cubic-bezier(0.2, 0.8, 0.2, 1)');
      const target = Math.max(0, Math.min(1, progressValue));
      this.animate(
        fillEl,
        [
          { transform: fillEl.style.transform || 'scaleX(0)' },
          { transform: `scaleX(${target})` },
        ],
        { duration, easing, fill: 'both' }
      );
      fillEl.style.transform = `scaleX(${target})`;
    },

    setupSteps() {
      const form = document.getElementById('heatCalcFormFull');
      if (form) {
        form.classList.add('ui-stepper');
        form.querySelectorAll('.section').forEach(section => section.classList.add('ui-step'));
      }
    },

    setupProgressBar() {
      const fill = document.getElementById('top-progress-fill');
      if (fill && !fill.style.transform) {
        fill.style.transform = 'scaleX(0.12)';
      }
    },

    isSelected(el) {
      return (
        el.classList.contains('option-card--selected') ||
        el.classList.contains('selected') ||
        el.classList.contains('yes-no-card--selected') ||
        el.classList.contains('is-selected')
      );
    },

    isDisabled(el) {
      return (
        el.classList.contains('option-card--disabled') ||
        el.classList.contains('yes-no-card--disabled') ||
        el.classList.contains('disabled')
      );
    },

    ensureOptionDecorations(el) {
      const isProductCard = el.classList.contains('product-card');
      if (!isProductCard && !el.querySelector('.ui-option__check')) {
        const check = document.createElement('span');
        check.className = 'ui-option__check';
        check.setAttribute('aria-hidden', 'true');
        check.textContent = '\u2713';
        el.appendChild(check);
      }
      if (!el.querySelector('.ui-option__scan')) {
        const scan = document.createElement('span');
        scan.className = 'ui-option__scan';
        scan.setAttribute('aria-hidden', 'true');
        el.appendChild(scan);
      }
    },

    syncOptionAria(el) {
      if (!el) return;
      const group = el.closest('[role="radiogroup"]');
      if (group) {
        this.syncGroupAria(group);
      } else {
        el.setAttribute('aria-pressed', this.isSelected(el) ? 'true' : 'false');
      }
    },

    syncGroupAria(group) {
      if (!group) return;
      const options = group.querySelectorAll('.ui-option');
      options.forEach(option => {
        const selected = this.isSelected(option);
        option.setAttribute('role', 'radio');
        option.setAttribute('aria-checked', selected ? 'true' : 'false');
      });
    },

    enhanceOption(el) {
      if (!el) return;
      if (!el.classList.contains('ui-option')) {
        el.classList.add('ui-option');
      }
      if (el.dataset.motionBound === '1') return;
      el.dataset.motionBound = '1';
      if (el.tagName === 'BUTTON' && !el.type) {
        el.type = 'button';
      }
      this.ensureOptionDecorations(el);
      el.classList.toggle('is-selected', this.isSelected(el));
      el.classList.toggle('is-disabled', this.isDisabled(el));
      this.syncOptionAria(el);

      const pressDown = () => {
        if (this.isDisabled(el)) return;
        el.classList.add('is-pressing');
        this.animatePress(el, true);
      };
      const pressUp = () => {
        el.classList.remove('is-pressing');
        this.animatePress(el, false);
      };

      el.addEventListener('pointerdown', pressDown);
      el.addEventListener('pointerup', pressUp);
      el.addEventListener('pointercancel', pressUp);
      el.addEventListener('pointerleave', pressUp);
    },

    setupOptions(root) {
      const scope = root || document;
      const options = scope.querySelectorAll(
        'button.option-card, button.yes-no-card, button.product-card'
      );
      options.forEach(el => this.enhanceOption(el));

      scope.querySelectorAll('.option-cards, .options-grid, .cwu-cards, .yes-no-cards').forEach(group => {
        if (!group.hasAttribute('role')) {
          group.setAttribute('role', 'radiogroup');
        }
        this.syncGroupAria(group);
      });
    },

    observeOptionMutations() {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'class' &&
            mutation.target
          ) {
            const el = mutation.target;
            if (!el.classList || !el.classList.contains('ui-option')) return;
            const wasSelected =
              mutation.oldValue &&
              (mutation.oldValue.includes('option-card--selected') ||
                mutation.oldValue.includes('selected') ||
                mutation.oldValue.includes('yes-no-card--selected'));
            const isSelectedNow = this.isSelected(el);
            el.classList.toggle('is-selected', isSelectedNow);
            el.classList.toggle('is-disabled', this.isDisabled(el));
            this.syncOptionAria(el);

            if (isSelectedNow && !wasSelected) {
              this.animateSelect(el);
              this.animateScanline(el);
              const content = el.querySelector('.product-content, .specs-list, .option-content');
              if (content) {
                this.animateCrossfade(content);
              }
            } else if (!isSelectedNow) {
              el.classList.remove('has-scanline');
              const scan = el.querySelector('.ui-option__scan');
              if (scan) {
                scan.style.opacity = '0';
              }
            }
          }
        });
      });

      const targets = [];
      const calcRoot = document.getElementById('heatCalcFormFull');
      const configRoot = document.getElementById('configurator-app');
      if (calcRoot) targets.push(calcRoot);
      if (configRoot) targets.push(configRoot);
      if (!targets.length) targets.push(document.body);

      targets.forEach(target =>
        observer.observe(target, {
          subtree: true,
          attributes: true,
          attributeFilter: ['class'],
          attributeOldValue: true,
        })
      );
    },

    observeNewOptions() {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (!(node instanceof Element)) return;
            if (node.matches && node.matches('button.option-card, button.yes-no-card, button.product-card')) {
              this.enhanceOption(node);
            } else if (node.querySelectorAll) {
              this.setupOptions(node);
            }
          });
        });
      });

      const targets = [];
      const calcRoot = document.getElementById('heatCalcFormFull');
      const configRoot = document.getElementById('configurator-app');
      if (calcRoot) targets.push(calcRoot);
      if (configRoot) targets.push(configRoot);
      if (!targets.length) targets.push(document.body);

      targets.forEach(target => observer.observe(target, { childList: true, subtree: true }));
    },
  };

  window.MotionSystem = MotionSystem;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MotionSystem.init());
  } else {
    MotionSystem.init();
  }
})(window);
