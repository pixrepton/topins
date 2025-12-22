(function(window) {
  'use strict';

  const formEngine = window.formEngine || (window.formEngine = {});

  function computeFieldVisibility(state, rules) {
    const result = {};
    Object.entries(rules.fields).forEach(([name, config]) => {
      let visible = true;
      if (typeof config.visibleWhen === 'function') {
        try {
          visible = !!config.visibleWhen(state);
        } catch (error) {
          console.warn('visibility: error evaluating rule for', name, error);
        }
      }
      result[name] = visible;
    });
    return result;
  }

  function computeContainerVisibility(state, rules) {
    const result = {};
    Object.entries(rules.containers).forEach(([name, config]) => {
      let visible = true;
      if (typeof config.visibleWhen === 'function') {
        try {
          visible = !!config.visibleWhen(state);
        } catch (error) {
          console.warn('visibility: error evaluating container rule for', name, error);
        }
      }
      result[name] = visible;
    });
    return result;
  }

  formEngine.visibility = {
    fields(state) {
      return computeFieldVisibility(state, formEngine.rules);
    },
    containers(state) {
      return computeContainerVisibility(state, formEngine.rules);
    }
  };
})(window);
