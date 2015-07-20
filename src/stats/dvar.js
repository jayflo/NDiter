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
 * Rather, the weight of an outcome says how likely it occurs compared to other
 * outcomes.  The probability of an outcome is computed as it's weight divided
 * by the total weight of all outcomes for the DVar.
 * @class
 * @augments module:traverse~Gen
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
   * @type {module:ostree~OSTree}
   */
  this._osTree = osTree.get();

  /**
   * @access private
   * @type {object}
   */
  this._nodes = {};

  /**
   * @access private
   * @type {module:traverse~Gen}
   */
  this._rng = rand.generator('float', 0, this._osTree.totalWeight);

  if(kwargs.outcomes) {
    this.add(kwargs.outcomes);
  }

  traverse.genCtor.call(this, {
    next: this._poll().value
  }, this);
}

DVar.prototype = Object.create(traverse.genCtor.prototype);

/**
 * Add new outcomes to the DVar.
 *
 * @param  {(string|number|object)} outcomeObj
 * A string or number used to label the outcome or an object with 'outcome',
 * 'value' and 'weight' properties.
 * @param  {number} [weight=1]
 * Used for selecting nodes from the tree non-uniformly.  The higher a node's
 * weight, the more likely it is to be selected.
 * @param  {anything} [value=key]
 * A value associated to the outcome which is provided when the outcome occurrs.
 *
 * @return {nothing}
 */
DVar.prototype.add = function(outcomeObj, weight, value) {
  var outcome, key;

  if(outcomeObj.hasOwnProperty('outcome')) {
    outcome = outcomeObj.outcome;
    weight = typeof outcomeObj.weight === 'number' ? outcomeObj.weight : weight;
  } else {
    outcome = outcomeObj;
  }

  weight = typeof weight === 'number' ? weight : 1;
  key = weight;
  value = {
    outcome: outcome,
    value: typeof outcomeObj.value === undefined ? value : outcomeObj.value
  };

  this._nodes[outcome] = this._osTree.add(key, value, weight);
};

/**
 * Add an outcome or update its weight when it already exists.
 *
 * @param  {(string|number|object)} outcomeObj
 * An outcome's key or an object having 'outcome', 'weight' and 'value' properties.
 * @param  {number} [weight=1]
 * @param  {anything} [value=key value]
 * @param  {boolean} [adjustWeight=false]
 * When true and the outcome already exists, update the outcome's weight using
 * {@link DVar~adjustWeight}.  When false, use {@link DVar~setWeight}.
 *
 * @return {nothing}
 */
DVar.prototype.include = function(outcomeObj, weight, value, adjustWeight) {
  var w, outcome = outcomeObj.hasOwnProperty('outcome') ? outcomeObj.outcome : outcomeObj;

  if(this._nodes.hasOwnProperty(outcome)) {
    w = typeof weight === 'number' ? weight : outcomeObj.weight;
    (adjustWeight ? this.adjustWeight : this.setWeight)(outcome, w);
  } else {
    this.add(outcomeObj, weight, value);
  }
};

/**
 * Remove an outcome from the DVar
 *
 * @param  {(string|number)} outcome
 * Key specifying the outcome to be removed.
 *
 * @return {object}
 * The removed outcome.
 */
DVar.prototype.delete = function(outcome) {
  var tmp = this._nodes[outcome];

  this._osTree.delete(tmp);
  delete this._nodes[outcome];

  return tmp;
};

/**
 * Change the weight of an outcome.
 *
 * @param  {(string|number)} outcome
 * @param  {number} weight
 *
 * @return {nothing}
 */
DVar.prototype.setWeight = function(outcome, weight) {
  var node = this._nodes[outcome],
    dw = weight - node.weight;

  node.key = weight;
  node.weight = weight;

  if(node.prev.weight <= weight && weight <= node.next.weight) {
    this._osTree.forBranch(node, function(n) {
      n.totalWeight += dw;
    });
  } else {
    this._osTree.delete(node);
    this._osTree.insert(node);
  }
};

/**
 * Adjust an outcome's weight by an amount.
 *
 * @param  {(string|number)} outcome
 * @param  {number} dw
 * The amount to add to the outcome's current weight.  When dw < 0, the outcome's
 * weight is decreased.
 *
 * @return {nothing}
 */
DVar.prototype.adjustWeight = function(outcome, dw) {
  this.setWeight(this._nodes[outcome].weight + dw);
};

/**
 * Evaluate the random variable.  When outcome's have varying weights, the DVar's
 * outcomes will be non-uniform.  Note: use DVar's next method to generate outcome
 * values, rather than complete outcome objects.
 *
 * @return {object}
 * The object having 'outcome', 'weight' and 'value' properties specifying an outcome.
 */
DVar.prototype._poll = function() {
  return _nodeToOutcome(this._osTree.weightSelect(this._rng.next()));
};

/**
 * @param  {(string|number)} outcome
 * The outcome of an outcome.
 *
 * @return {number}
 * The probability that the outcome occurs.
 */
DVar.prototype.prEq = function(outcome) {
  if(!this._nodes.hasOwnProperty(outcome)) {
    return 0;
  }

  return this._nodes[outcome].weight / this._osTree.totalWeight();
};

/**
 * Compute a moment of the probability distribution, e.g. the first moment about
 * 0 (aka raw moment) is the mean (or average) and the second central moment (aka
 * about the mean) is the variance (whose square root is the standard deviation).
 * Passing no arguments computes the expectation under the assumption that outcome
 * values are numerical.
 *
 * @param  {integer} [moment=1]
 * The moment to compute.
 * @param  {number} [axis=0]
 * The axis about which the moment is computed.
 * @param  {Function} [hash=identity]
 * Moments are computed using outcome values.  When outcome values are not numerical,
 * a hash can be passed which determines each outcome's "size."
 *
 * @return {number}
 * The computed moment.
 */
DVar.prototype.moment = function(moment, axis, hash) {
  var tmp, sum = 0, iter = this.outcomeIterator(), tw = this._osTree.totalWeight();

  moment = typeof moment === 'number' ? moment : 1;
  axis = typeof axis === 'number' ? axis : 0;
  hash = typeof hash === 'function' ? hash : _identity;

  while(iter.hasNext()) {
    tmp = iter.next();
    sum += Math.pow(hash(tmp.value.value) - axis, moment) * (tmp.weight / tw);
  }

  return sum;
};

/**
 * A convenience method for variance.  Since moments are computed on-the-fly,
 * this method will use an already computed expectation value when supplied.  If
 * that expectation value is not up to date, the computation will be incorrect.
 *
 * @param  {number} expectation
 * A pre-computed expectation.
 * @param  {Function} hash
 * Moments are computed using outcome values.  When outcome values are not numerical,
 * a hash can be passed which determines each outcome's "size."
 * @param  {boolean} stddev
 * When true, returns the standard deviation.  When false, returns variance.
 *
 * @return {number}
 * The computed variance or standard deviation.
 */
DVar.prototype.variance = function(expectation, hash, stddev) {
  var v;

  hash = typeof hash === 'function' ? hash : _identity;
  expectation = typeof expectation === 'number' ? expectation : this.moment(1, 0, hash);
  v = this.moment(2, expectation, hash);

  return stddev ? Math.sqrt(v) : v;
};

/**
 * Similar to `expect` except the outcome object is returned, rather than only
 * it's value.
 *
 * @return {object[]}
 * The outcomes having the highest weight.
 */
DVar.prototype._expect = function(cb) {
  var tmp, n = this._osTree.maximum;

  cb = cb || _nodeToOutcome;
  tmp = [cb(n)];

  while(n.prev.key === n.key) {
    n = n.prev;
    tmp.push(cb(n));
  }

  return tmp;
};

/**
 * As opposed expectation, expect returns an actual outcome's value...the value
 * of the outcome which is most likely to occur (we refrain from using 'likely'
 * or 'likelihood' as these refer to other probability concepts and don't want
 * to confuse them here).
 *
 * @return {array}
 * An array of values for outcomes having the highest weight.
 */
DVar.prototype.expect = function() {
  return this._expect(function(n) { return n.value.value; });
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
 * An iterator that iterates over outcomes of the DVar instance in weight
 * ascending order.
 *
 * @return {Iter}
 * See {@link module:traverse~Iter}
 */
DVar.prototype.outcomeIterator = function() {
  return this._osTree.iterator(_nodeToOutcome);
};

function _nodeToOutcome(node) {
  return {
    outcome: node.value.outcome,
    value: node.value.value,
    weight: node.key
  };
}

function _identity(value) {
  return value;
}
