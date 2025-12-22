(function(window) {
  'use strict';

  const formEngine = window.formEngine || (window.formEngine = {});

  const values = Object.create(null);
  const fieldElements = Object.create(null);

  function registerField(name, elements) {
    fieldElements[name] = elements;
  }

  function getFieldElements(name) {
    return fieldElements[name] || null;
  }

  function setValue(name, value) {
    const previous = values[name];
    if (typeof value === 'string') {
      values[name] = value.trim();
    } else if (Array.isArray(value)) {
      values[name] = value.slice();
    } else if (value === undefined || value === null) {
      delete values[name];
    } else {
      values[name] = value;
    }
    return previous !== values[name];
  }

  function getValue(name) {
    return values[name];
  }

  function getAllValues() {
    return { ...values };
  }

  function resetValues() {
    Object.keys(values).forEach(key => delete values[key]);
  }

  formEngine.state = {
    registerField,
    getFieldElements,
    setValue,
    getValue,
    getAllValues,
    resetValues
  };
})(window);
