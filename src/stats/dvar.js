'use strict';

/**
 * @module dvar
 */

var rand = require('../js/rand.js'),
  osTree = require('../class/ostree.js'),
  traverse = require('../class/traverse.js');

module.exports = (function() {
  return {
    /**
     * Getter for DVar class.
     * @see {@link module:dvar~DVar}
     * @memberof module:dvar
     *
     * @param  {object}  kwargs
     * See {@link module:dvar~DVar}
     * @param  {object=} thisArg
     * See {@link module:dvar~DVar}
     *
     * @return {DVar}
     */
    get: function(kwargs) {
      return new DVar(kwargs);
    },

    /**
     * @see {@link module:dvar~DVar}
     * @memberof module:dvar
     * @function
     */
    ctor: DVar
  };
})();

/**
 * A class which represents a discrete random variable.  An instance stores a
 * collection of "weighted" outcomes.  A weight corresponds to the probability
 * in which the outcome will occur.  It is not necessary for the weight's sum
 * to equal 1 (which is why refrain from calling weight the "probability").
 * Rather, the weight of an outcome says how likely it is as compared to other
 * outocomes.  The probability of an outcome is computed as it's weight divided
 * by the total weight of all outcomes for the DVar.
 * @class
 * @example
 * Outcome A
 * Weight: 1
 * Probability: 1/4
 *
 * Outcome B
 * Weight: 1
 * Probability: 1/4
 *
 * Outcome C
 * Weight: 2
 * Probability: 1/2
 *
 * @param {object} kwargs
 * @param {object[]} [kwargs.outcomes]
 * An array of objects, each of which has the properties 'key', 'value' and
 * 'weight'.  The key should be *unique* among outcomes for the DVar instance
 * and is primarly used for storage purposes.  The 'value' is returned when
 * when it's associated outcome occurs.  If no value is given, the key is used
 * as the value.  The 'weight' determines the probability the outcome will
 * occur (as explained in the method's description).  Weights default to 1,
 * hence including no weights for a DVar makes each outcome equally likely.
 */
function DVar(kwargs) {

  /**
   * @access private
   * @type {module:ostree~OSTree}
   */
  this._osTree = osTree.get();

  /**
   * @access private
   * @type {object}
   */
  this._lookup = {};

  /**
   * @access private
   * @type {module:traverse~Gen}
   */
  this._rng = rand.generator('float', 0, this._osTree.totalWeight);

  if(kwargs.outcomes) {
    this.add(kwargs.outcomes);
  }
}

/**
 * Add new outcomes to the DVar.
 *
 * @param  {(string|number|object)} keyObj
 * An object with key, weight and value properties or an element corresponding
 * to the key.
 * @param  {number} [weight=1]
 * Used for selecting nodes from the tree non-uniformly.  The higher a node's
 * weight, the more likely it is to be selected.
 * @param  {anything} [value=key]
 * The nodes value.
 *
 * @return {nothing}
 */
DVar.prototype.add = function(keyObj, weight, value) {
  this._lookup[keyObj.key] = this._osTree.add(keyObj, value, weight);
};

/**
 * Add an outcome or update its weight when it already exists.
 *
 * @param  {(string|number|object)} keyObj
 * An outcome's key or an object having 'key', 'weight' and 'value' properties.
 * @param  {number} [weight=1]
 * @param  {anything} [value=key value]
 * @param  {boolean} [adjustWeight=false]
 * When true and the outcome already exists, update the outcome's weight using
 * {@link DVar~adjustWeight}.  When false, use {@link DVar~setWeight}.
 *
 * @return {nothing}
 */
DVar.prototype.include = function(keyObj, weight, value, adjustWeight) {
  var w, key = keyObj.hasOwnProperty('key') ? keyObj.key : keyObj;

  if(this._lookup.hasOwnProperty(key)) {
    w = typeof weight === 'number' ? weight : keyObj.weight;
    (adjustWeight ? this.adjustWeight : this.setWeight)(key, w);
  } else {
    this.add(keyObj, weight, value);
  }
};

/**
 * Remove an outcome from the DVar
 *
 * @param  {(string|number)} key
 * Key specifying the outcome to be removed.
 *
 * @return {object}
 * The removed outcome.
 */
DVar.prototype.delete = function(key) {
  var tmp = this._lookup[key];

  this._osTree.delete(tmp);
  delete this._lookup[key];

  return tmp;
};

/**
 * Change the weight of an outcome.
 *
 * @param  {(string|number)} key
 * @param  {number} weight
 *
 * @return {nothing}
 */
DVar.prototype.setWeight = function(key, weight) {
  var node = this._lookup[key],
    dw = weight - node.weight;

  node.weight = weight;
  this._osTree.forBranch(node, function(n) {
    n.totalWeight += dw;
  });
};

/**
 * Adjust an outcome's weight by an amount.
 *
 * @param  {(string|number)} key
 * @param  {number} dw
 * The amount to add to the outcome's current weight.  When dw < 0, the outcome's
 * weight is decreased.
 *
 * @return {nothing}
 */
DVar.prototype.adjustWeight = function(key, dw) {
  this.setWeight(this._lookup[key].weight + dw);
};

/**
 * Evaluate the random variable.  When outcome's have varying weights, the DVar's
 * outcomes will be non-uniform.  Note: this method is equivalent to `poll`
 * except that this method returns the entire outcome object, rather than just
 * the value.
 *
 * @return {object}
 * The object having 'key', 'weight' and 'value' keys specifying an outcome.
 */
DVar.prototype._poll = function() {
  return this._osTree.weightSelect(this._rng.next());
};

/**
 * Evaluate the random variable.  When outcome's have varying weights, the DVar's
 * outcomes will be non-uniform.
 *
 * @return {unknown}
 * The `value` of the outcome which occurred.
 */
DVar.prototype.poll = function() {
  return this._poll().value;
};

/**
 * @param  {(string|number)} key
 * The key of an outcome.
 *
 * @return {number}
 * The probability that the outcome occurs.
 */
DVar.prototype.prEq = function(key) {
  if(!this._lookup.hasOwnProperty(key)) {
    return 0;
  }

  return this._lookup[key].weight / this._osTree.totalWeight();
};

/**
 * Compute the expected value of the random variable.  Similarly to an array's
 * reduce method, `expectation` iterates over the outcomes' values and must
 * produce a final single output.  When no arguments are passed to this method,
 * its action defaults to the standard expectation formula, e.g.
 *
 * \sum_{v_i} (v_i * p(v_i))
 *
 * which likely only makes sense when outcomes' values are numbers.
 *
 * @param  {Function} [callback]
 * A function receiving (initValue or) the callback's previous output, the
 * current outcome's value and it's probability.
 * @param  {anything} initValue
 * A starting value.
 *
 * @return {unknown}
 */
DVar.prototype.expectation = function(callback, initValue) {
  var tmp, iter = this.outcomeIterator(), tw = this._osTree.totalWeight();

  if(!callback) {
    callback = _expectation;
    initValue = 0;
  }

  while(iter.hasNext()) {
    tmp = iter.next();
    initValue = callback(initValue, tmp.value, tmp.weight / tw);
  }

  return initValue;
};

/**
 * Compute the variance of the random variable.  Similarly to an array's
 * reduce method, `variance` iterates over the outcome's value and must
 * produce a final single output.  When no arguments are passed to this method,
 * its action defaults to the standard variance formula, e.g.
 *
 * \sum_{v_i} (v_i * expectation)^2 * p(v_i)
 *
 * which likely only makes sense when outcomes' values are numbers.
 *
 * @param  {unknown}  [expectation]
 * The random variable's expectation.
 * @param  {Function} [callback]
 * A function receiving (initValue or) the callback's previous output, the
 * current outcome's value, the current outcome's probability and the
 * expectation of the random variable.
 * @param  {anything} initValue
 * A starting value.
 *
 * @return {unknown}
 * The computed variance.
 */
DVar.prototype.variance = function(expectation, callback, initValue) {
  var tmp, iter = this.outcomeIterator(), tw = this._osTree.totalWeight();

  expectation = expectation || this.expectation();

  if(!callback) {
    callback = _variance;
    initValue = 0;
  }

  while(iter.hasNext()) {
    tmp = iter.next();
    initValue = callback(initValue, tmp.value, tmp.weight / tw, expectation);
  }

  return initValue;
};

/**
 * Similar to `expect` except the outcome object is returned, rather than only
 * it's value.
 *
 * @return {object}
 * The outcome having the highest weight.
 */
DVar.prototype._expect = function() {
  var tmp, max = { weight: Number.MIN_VALUE }, iter = this.iterator();

  while(iter.hasNext()) {
    tmp = iter.next();
    max = tmp.weight > max.weight ? tmp : max;
  }

  return max;
};

/**
 * As opposed expectation, expect returns an actual outcome's value...the value
 * of the outcome which is most likely to occur (we refrain from using 'likely'
 * or 'likelihood' as these refer to other probability concepts and don't want
 * to confuse them here).
 * @todo complexity for this method is currently O(n), where n is the number of
 * outcomes, but DVar may be adjusted to make this O(1) if it is highly used.
 *
 * @return {unknown}
 * The value of the outcome with highest weight.
 */
DVar.prototype.expect = function() {
  return this._expect().value;
};

/**
 * Returns a generator whose next method evaluates the random variable and
 * returns that outcome's value (see {@link module:dvar~DVar~poll}).
 *
 * @return {Gen}
 * See {@link module:traverse~Gen}
 */
DVar.prototype.generator = function() {
  return traverse.generator({
    next: this.poll()
  }, this);
};

/**
 * An iterator that iterates over outcomes of the DVar instance in key
 * ascending order.
 *
 * @return {Iter}
 * See {@link module:traverse~Iter}
 */
DVar.prototype.outcomeIterator = function() {
  return this._osTree.iterator();
};

function _expectation(prev, curr, p) {
  return prev += (curr * p);
}

function _variance(prev, curr, m, p) {
  var dcurr = curr - m;

  return prev += (dcurr * dcurr * p);
}
