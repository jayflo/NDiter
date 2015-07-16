'use strict';

var traverse = require('../class/traverse.js'),
  dvar = require('../rand/dvar.js');

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new Markov(kwargs);
    },

    ctor: Markov
  };
})();

function Markov(kwargs) {
  this._states = {};

  if(kwargs.training) {
    this.train(kwargs.training, true);
  }

  this._curr = kwargs.seed && this._states.hasOwnProperty(kwargs.seed) ?
    this._states[kwargs.seed] : null;

  traverse.genCtor.call(this, {
    next: function() {
      this._curr = this.poll();

      return this._curr.value;
    }
  }, this);
}

Markov.prototype = Object.create(traverse.genCtor.prototype);

Markov.prototype.setCurrentState = function(keyObj) {
  var key = keyObj.hasOwnProperty('key') ? keyObj.key : keyObj;

  this._curr = this._states.hasOwnProperty(key) ? this._states[key] : null;
};

var __increment = true;
Markov.prototype.train = function(outcomes, ignoreCurrentState) {
  var key, w;

  outcomes = Array.isArray(outcomes) ? outcomes : [outcomes];

  if(!ignoreCurrentState) {
    outcomes = [this._curr].concat(outcomes);
  }

  if(outcomes.length < 2) {
    return false;
  }

  for(var i = 0, len = outcomes.length; i + 1 < len; i++) {
    key = outcomes[i].key;

    if(!this._states.hasOwnProperty(key)) {
      this._states[key] = dvar.get();
    }

    w = outcomes[i + 1].weight;
    outcomes[i + 1].weight = isNaN(w) ? 1 : w;

    this._states[key].addOrUpdate(outcomes[i + 1], __increment);
  }

  return true;
};

Markov.prototype.poll = function() {
  this._states[this._curr.key].poll();
};
