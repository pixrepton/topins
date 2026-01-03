/**
 * PHASE 3C — OZC Engine Interface
 *
 * Abstract interface for OZC (Obliczenia Zapotrzebowania na Ciepło) calculation engines.
 * Allows swapping engines or using fallback mechanisms without changing calling code.
 *
 * @file ozc-engine-interface.js
 * @version 1.0.0
 */

(function(window) {
  'use strict';

  /**
   * Base interface for OZC engines
   * All OZC engines must implement this interface
   */
  class OZCEngineInterface {
    /**
     * Calculate heat demand (zapotrzebowanie na ciepło)
     *
     * @param {Object} payload - Input data (CieploApiPayload format)
     * @returns {Promise<Object>} - Calculation result with designHeatLoss_kW
     * @throws {Error} - If calculation fails
     */
    async calculate(payload) {
      throw new Error('OZCEngineInterface.calculate() must be implemented');
    }

    /**
     * Convert result to Cieplo.app format
     *
     * @param {Object} result - Result from calculate()
     * @param {Object} payload - Original input payload
     * @returns {Object} - Mapped result in Cieplo.app format
     */
    convertToCieploAppFormat(result, payload) {
      throw new Error('OZCEngineInterface.convertToCieploAppFormat() must be implemented');
    }

    /**
     * Get engine metadata
     *
     * @returns {Object} - Engine info (name, version, capabilities)
     */
    getMetadata() {
      return {
        name: 'Unknown Engine',
        version: '0.0.0',
        capabilities: [],
      };
    }

    /**
     * Validate input payload
     *
     * @param {Object} payload - Input data to validate
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    validatePayload(payload) {
      return { valid: true, errors: [] };
    }
  }

  /**
   * Adapter for existing ozc-engine.js (window.OZCEngine)
   * Wraps the current browser-based engine to implement OZCEngineInterface
   */
  class OZCEngineAdapter extends OZCEngineInterface {
    constructor(engine) {
      super();
      this.engine = engine || window.OZCEngine;
      if (!this.engine) {
        throw new Error('OZCEngine not found. Make sure ozc-engine.js is loaded before this adapter.');
      }
    }

    async calculate(payload) {
      if (!this.engine.calculate) {
        throw new Error('OZCEngine.calculate() is not available');
      }

      try {
        const result = await this.engine.calculate(payload);
        return result;
      } catch (error) {
        throw new Error(`OZCEngine calculation failed: ${error.message}`);
      }
    }

    convertToCieploAppFormat(result, payload) {
      if (!this.engine.convertToCieploAppFormat) {
        // Fallback: return result as-is if conversion not available
        console.warn('[OZCEngineAdapter] convertToCieploAppFormat() not available, returning result as-is');
        return result;
      }

      try {
        return this.engine.convertToCieploAppFormat(result, payload);
      } catch (error) {
        console.warn('[OZCEngineAdapter] Conversion failed, returning result as-is:', error);
        return result;
      }
    }

    getMetadata() {
      return {
        name: 'OZCEngine (Browser)',
        version: this.engine.version || '1.0.0',
        capabilities: ['calculate', 'convertToCieploAppFormat'],
      };
    }

    validatePayload(payload) {
      // Basic validation - can be extended
      const errors = [];

      if (!payload) {
        errors.push('Payload is required');
        return { valid: false, errors };
      }

      if (!payload.building_type) {
        errors.push('building_type is required');
      }

      if (!payload.construction_year) {
        errors.push('construction_year is required');
      }

      if (!payload.heated_area && !payload.total_area) {
        errors.push('heated_area or total_area is required');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    }
  }

  /**
   * Engine Manager - handles engine selection, fallback, and error handling
   */
  class OZCEngineManager {
    constructor() {
      this.primaryEngine = null;
      this.fallbackEngine = null;
      this.currentEngine = null;
      this.engineHistory = [];
    }

    /**
     * Register primary engine
     *
     * @param {OZCEngineInterface} engine - Primary engine to use
     */
    setPrimaryEngine(engine) {
      if (!(engine instanceof OZCEngineInterface)) {
        throw new Error('Engine must implement OZCEngineInterface');
      }
      this.primaryEngine = engine;
      this.currentEngine = engine;
    }

    /**
     * Register fallback engine
     *
     * @param {OZCEngineInterface} engine - Fallback engine to use if primary fails
     */
    setFallbackEngine(engine) {
      if (!(engine instanceof OZCEngineInterface)) {
        throw new Error('Engine must implement OZCEngineInterface');
      }
      this.fallbackEngine = engine;
    }

    /**
     * Calculate with automatic fallback
     *
     * @param {Object} payload - Input data
     * @returns {Promise<Object>} - Calculation result
     */
    async calculate(payload) {
      // Validate payload
      const validation = this.currentEngine?.validatePayload(payload) || { valid: true, errors: [] };
      if (!validation.valid) {
        throw new Error(`Invalid payload: ${validation.errors.join(', ')}`);
      }

      // Try primary engine
      if (this.primaryEngine) {
        try {
          this.currentEngine = this.primaryEngine;
          const result = await this.primaryEngine.calculate(payload);
          this.engineHistory.push({ engine: 'primary', success: true, timestamp: Date.now() });
          return result;
        } catch (error) {
          console.warn('[OZCEngineManager] Primary engine failed, trying fallback:', error);
          this.engineHistory.push({ engine: 'primary', success: false, error: error.message, timestamp: Date.now() });
        }
      }

      // Try fallback engine
      if (this.fallbackEngine) {
        try {
          this.currentEngine = this.fallbackEngine;
          const result = await this.fallbackEngine.calculate(payload);
          this.engineHistory.push({ engine: 'fallback', success: true, timestamp: Date.now() });
          console.log('[OZCEngineManager] Using fallback engine');
          return result;
        } catch (error) {
          console.error('[OZCEngineManager] Fallback engine also failed:', error);
          this.engineHistory.push({ engine: 'fallback', success: false, error: error.message, timestamp: Date.now() });
          throw new Error(`Both primary and fallback engines failed. Last error: ${error.message}`);
        }
      }

      throw new Error('No engine available');
    }

    /**
     * Convert result to Cieplo.app format
     *
     * @param {Object} result - Result from calculate()
     * @param {Object} payload - Original input payload
     * @returns {Object} - Mapped result
     */
    convertToCieploAppFormat(result, payload) {
      if (!this.currentEngine) {
        throw new Error('No engine available');
      }
      return this.currentEngine.convertToCieploAppFormat(result, payload);
    }

    /**
     * Get current engine info
     *
     * @returns {Object} - Engine metadata
     */
    getCurrentEngineInfo() {
      if (!this.currentEngine) {
        return null;
      }
      return this.currentEngine.getMetadata();
    }

    /**
     * Get engine usage history
     *
     * @returns {Array} - History of engine usage
     */
    getHistory() {
      return [...this.engineHistory];
    }
  }

  // Export to window
  window.OZCEngineInterface = OZCEngineInterface;
  window.OZCEngineAdapter = OZCEngineAdapter;
  window.OZCEngineManager = OZCEngineManager;

  // Auto-initialize adapter if OZCEngine is available
  if (window.OZCEngine) {
    try {
      const adapter = new OZCEngineAdapter(window.OZCEngine);
      window.ozcEngineManager = new OZCEngineManager();
      window.ozcEngineManager.setPrimaryEngine(adapter);
      console.log('[OZCEngineInterface] ✅ Adapter initialized with OZCEngine');
    } catch (error) {
      console.warn('[OZCEngineInterface] ⚠️ Could not initialize adapter:', error);
    }
  } else {
    console.log('[OZCEngineInterface] ℹ️ OZCEngine not found, adapter will be initialized when engine loads');
  }

})(window);

