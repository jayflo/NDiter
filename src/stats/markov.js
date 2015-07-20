'use strict';

/**
 * @module markov
 */

var traverse = require('../class/traverse.js'),
  objMod = require('../js/obj.js'),
  dvar = require('./dvar.js');

module.exports = (function() {
  return {
    /**
     * Getter for Markov class.
     * @see {@link module:markov~Markov}
     * @memberof module:markov
     *
     * @param  {object}  kwargs
     * See {@link module:markov~Markov}
     * @param  {object=} thisArg
     * See {@link module:markov~Markov}
     *
     * @return {Markov}
     */
    get: function(kwargs) {
      return new Markov(kwargs);
    },

    /**
     * @see {@link module:markov~Markov}
     * @memberof module:markov
     * @function
     */
    ctor: Markov
  };
})();

/**
 * A (discrete) Markov process may be described as a finite state machine where
 * the next state is determined probabilistically, i.e. the transitions are
 * random variables, and depends *only* on the current state.
 *
 * We implement a (discrete) Markov process as a collection of DVars indexed by
 * the collection of all possible outcomes.  Given an outcome A, the random
 * variable X_A associated to A is used to determine an outcome that follows A.
 * A Markov process must be initialized using "training" sequences before any
 * next states can be determined.  A training sequence is just an *ordered*
 * sequence of outcomes that allow the random variables stored by the Markov
 * process to determine the probability for the next state.  The more
 * "experimentally measured" training sequences are provided to the Markov process,
 * the more accurate the Markov process wil be in computing future states.
 *
 * Note:
 * This class inherits from {@link module:traverse~Gen} and the `next` method
 * is used to transition states and return the outcome values.
 *
 * @class
 * @augments module:traverse~Gen
 *
 * @param {object} kwargs
 * @param {(object[]|string[]|number[])} training
 * An array of objects have 'outcome', 'weight' and 'value' properties (see
 * {@link module:dvar~DVar~add}), or simply and array consisting of outcome names.
 * In the latter case, each outcome's value will default to the label's value and
 * will be given a weight of 1.  Note: this array *must* have at least two entries.
 *
 */
function Markov(kwargs) {

  /**
   * @access private
   * @type {object}
   */
  this._states = {};

  if(kwargs.training) {
    this.train(kwargs.training, false);
  }

  traverse.genCtor.call(this, {
    next: function() {
      this._curr = this._poll();

      return this._curr.value;
    }
  }, this);

  /**
   * @access private
   * @type {object}
   */
  this._curr = kwargs.seed && this._states.hasOwnProperty(kwargs.seed) ?
    this._states[kwargs.seed] : null;
}

Markov.prototype = Object.create(traverse.genCtor.prototype);

/**
 * Override current state.
 *
 * @param  {(string|number|object)} outcomeObj
 * A value which specifies an outcome.  If an object, must have a 'outcome' property.
 *
 * @return {nothing}
 */
Markov.prototype.setCurrentState = function(outcomeObj) {
  var outcome = outcomeObj.hasOwnProperty('outcome') ? outcomeObj.outcome : outcomeObj;

  this._curr = this._states.hasOwnProperty(outcome) ? this._states[outcome] : null;
};

var __increment = true;

/**
 * Used to train the process.  Note that the process can be trained at
 * any time.
 *
 * @param  {(string[]|number[]|object[])} outcomes
 * See {@link module:markov~Markov} constructor training parameter.
 * @param  {boolean} [isNextState=true]
 * When true, the given outcomes are assumed to succeed the process' current
 * state.  When false, the current state is not trained.  In the latter case,
 * the outcomes array must have length at least 2.
 *
 * @return {boolean}
 * true when training is successful.
 */
Markov.prototype.train = function(outcomes, isNextState) {
  var outcome;

  isNextState = isNextState === undefined ? true : isNextState;
  outcomes = Array.isArray(outcomes) ? outcomes : [outcomes];

  if(isNextState) {
    outcomes = [this._curr].concat(outcomes);
  }

  if(outcomes.length < 2) {
    return false;
  }

  for(var i = 0, len = outcomes.length; i + 1 < len; i++) {
    outcome = outcomes[i].outcome;

    if(!this._states.hasOwnProperty(outcome)) {
      this._states[outcome] = dvar.get();
    }

    this._states[outcome].include(outcomes[i + 1], null, null, true);
  }

  return true;
};

/**
 * Evaluate the random variable associate to the current state.  Note: this does
 * _not_ advance the state (use Markov~next for that).
 *
 * @return {unknown}
 * The value of the computed outcome.
 */
Markov.prototype.poll = function() {
  return this._curr.poll();
};

/**
 * Similar to {@link module:dvar~DVar~expect}, this returns an array of *values*
 * associated to the outcomes of highest weight.
 *
 * @return {array}
 * The values associated to the outcome(s) with highest weight.
 */
Markov.prototype.expect = function() {
  return this._curr.expect();
};

/**
 * The state object has one property for each state reachable from the current
 * state, and whose value is the probability of being in that state after `i`
 * transitions.
 *
 * Note: this is an expensive computation..  The computation is analogous to
 * doing a depth first search on a Graph whose vertices are states and whose
 * edges are the transitions.
 *
 * @param  {integer} i
 * Number of state transitions to compute, e.g. i === 2 means to compute the
 * probabilities of reachable states after two transitions.
 *
 * @return {object}
 * An object whose keys are outcome (state) lables, and whose values are the
 * probability of being in said state after `i` transitions.
 */
Markov.prototype.stateObj = function(i) {
  return  _stateObj(
    this._states, this._curr.value.outcome, Math.max(0, Math.round(i || 0))
  );
};

/**
 * Similar to {@link module:markov~Markov~stateObj} except the output is
 * converted to an array and sorted by probability (descending, so that highest
 * probabilities occur first).
 *
 * Note: this is an expensive computation.
 *
 * @param  {integer} i
 * Number of state transitions to compute, e.g. i === 2 means to compute the
 * probabilities of reachable states after two transitions.
 *
 * @return {object[]}
 * An array of objects have 'outcome' and 'p' properties corresponding to outcome
 * labels and the probability they occur after `i` transitions.  These are sorted
 * so that probability values decrease.
 */
Markov.prototype.stateVec = function(i) {
  return objMod
          .objToArray(this.stateObj(i), 'outcome', 'p')
          .sort(function(a, b) { return b.p - a.p; });
};

function _stateObj(states, outcome, i) {
  var res = {};

  _stateObjRec(states, outcome, i, 1, res);

  return res;
}

function _stateObjRec(states, outcome, i, p, res) {
  var tree = states[outcome]._osTree,
    tw = tree.totalWeight(),
    n = tree.minimum;

  if(i === 1) {
    while(!tree.isNil(n)) {
      if(!res.hasOwnProperty(n.value.outcome)) {
        res[n.value.outcome] = 0;
      }

      res[n.value.outcome] += p * (n.weight / tw);
    }
  }

  while(!tree.isNil(n)) {
    _stateObjRec(states, n.value.outcome, i - 1, p * (n.weight / tw), res);
    n = n.next;
  }
}
