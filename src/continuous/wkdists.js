'use strict';

var unif = require('./uniform.js');

module.exports = (function() {

  return {
    uniform: function(a, b) {
      return a + (unif() * (b - a));
    }
  };

})();
