'use strict';

var rand = require('../rand.js'),
  binarySearch = require('../utils.js').binarySearch;

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new PDF(kwargs);
    }
  };
})();

function Outcome(kwargs) {
  this.key = kwargs.key;
  this.value = kwargs.value || null;
  this.freq = isNaN(kwargs.frequency) ? 0 : kwargs.freq;
}

function PDF(kwargs) {
  this.hash = kwargs.hash;
  this.totalFreq = 0;
  this.outcomes = kwargs.outcomes ? this.addOutcomes(kwargs.outcomes) : [];
}

PDF.prototype.addOutcome = function(outcome) {
};

PDF.prototype.addOutcomes = function(outcomes) {
  for(var i = 0, len = outcomes.length; i < len; i++) {
    this.addOutcome(outcomes[i]);
  }
};

PDF.prototype.exec = function() {
  return _determineOutcome(this.outcomes, rand._int(0, this.totalFreq));
};

/**
 * Private
 */

function _determineOutcome(eventArr, t) {

}
