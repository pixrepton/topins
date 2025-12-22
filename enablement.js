(function(window) {
  'use strict';

  const formEngine = window.formEngine || (window.formEngine = {});

  function computeEnabled(state, rules) {
    const result = {};
    Object.entries(rules.fields).forEach(([name, config]) => {
      let enabled = true;
      if (typeof config.enabledWhen === 'function') {
        try {
          enabled = !!config.enabledWhen(state);
        } catch (error) {
          console.warn('enablement: error evaluating rule for', name, error);
        }
      }
      result[name] = enabled;
    });
    return result;
  }

  function computeRequired(state, rules) {
    const result = {};
    Object.entries(rules.fields).forEach(([name, config]) => {
      let required = false;
      if (typeof config.requiredWhen === 'function') {
        try {
          required = !!config.requiredWhen(state);
        } catch (error) {
          console.warn('required: error evaluating rule for', name, error);
        }
      } else if (config.required) {
        required = true;
      }
      result[name] = required;
    });
    return result;
  }

  formEngine.enablement = {
    fields(state) {
      return computeEnabled(state, formEngine.rules);
    },
    required(state) {
      return computeRequired(state, formEngine.rules);
    }
  };
})(window);
