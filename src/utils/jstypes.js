'use strict';

module.exports = (function() {
  return {
    isNumber: function(value) {
      return typeof value === 'number';
    },

    isString: function(value) {
      return typeof value === 'string' || value instanceof String;
    },

    isFunction: function(value) {
      return typeof value === 'function';
    }
  };
})();
