'use strict';

var assert = require('assert'),
  rand = require('../rand.js'),
  binarySearch = require('../utils.js').binarySearch;

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new PDF(kwargs);
    }
  };
})();

function Outcome(kwargs) {
  assert(kwargs.key !== undefined, 'Invalid outcome key.');
  assert(kwargs.key !== null, 'Invalid outcome key.');

  this.key = kwargs.key;
  this.value = kwargs.value || null;
  this.freq = isNaN(kwargs.frequency) ? 0 : kwargs.freq;
}

function PDF(kwargs) {
  assert(typeof kwargs.hash === 'function', 'PDF.hash must be a function.');

  this.hash = kwargs.hash;
  this.totalFreq = 0;
  this.events = kwargs.events ? this.addOutcomes(kwargs.events) : [];
}

PDF.prototype.addOutcome = function(outcome) {
  var key = this.hash(outcome.value),
    tmp = binarySearch(this.events, key, 0, this.events.length);

  if(isNaN(outcome.freq)) {
    return;
  }

  if(tmp < 0) {
    this.events.push(new Outcome({
      key: key,
      value: outcome.value,
      freq: outcome.freq
    }));
  } else {
    this.events[tmp].freq += outcome.freq;
  }

  this.totalFreq += outcome.freq;
};

PDF.prototype.addOutcomes = function(outcomes) {
  for(var i = 0, len = outcomes.length; i < len; i++) {
    this.addOutcome(outcomes[i]);
  }
};

PDF.prototype.exec = function() {
  return _determineOutcome(this.eventArr, rand._int(0, this.totalFreq));
};

/**
 * Private
 */

function _determineOutcome(eventArr, t) {

}
