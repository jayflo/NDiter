'use strict';

/**
 * @module markov
 */

var traverse = require('../class/traverse.js'),
  dvar = require('../rand/dvar.js');

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
 * An array of objects have 'key', 'weight' and 'value' properties (see
 * {@link module:dvar~DVar~add}), or simply and array consisting of outcome keys.
 * In the latter case, each outcome's value will default to the key's value and
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

  /**
   * @access private
   * @type {object}
   */
  this._curr = kwargs.seed && this._states.hasOwnProperty(kwargs.seed) ?
    this._states[kwargs.seed] : null;

  traverse.genCtor.call(this, {
    next: function() {
      this._curr = this._poll();

      return this._curr.value;
    }
  }, this);
}

Markov.prototype = Object.create(traverse.genCtor.prototype);

/**
 * Override current state.
 *
 * @param  {(string|number|object)} keyObj
 * A value which specifies an outcome.  If an object, must have a 'key' property.
 *
 * @return {nothing}
 */
Markov.prototype.setCurrentState = function(keyObj) {
  var key = keyObj.hasOwnProperty('key') ? keyObj.key : keyObj;

  this._curr = this._states.hasOwnProperty(key) ? this._states[key] : null;
};

var __increment = true;

/**
 * Method used to train the process.  Note that the process can be trained at
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
  var key;

  isNextState = isNextState === undefined ? true : isNextState;
  outcomes = Array.isArray(outcomes) ? outcomes : [outcomes];

  if(isNextState) {
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

    this._states[key].include(outcomes[i + 1], null, null, true);
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
