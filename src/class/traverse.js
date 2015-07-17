'use strict';

/**
 * @module traverse
 */

module.exports = (function() {
  return {
    /**
     * Getter for Iter class.
     * @see {@link module:traverse~Iter}
     * @memberof module:traverse
     *
     * @param  {object}  kwargs
     * See {@link module:traverse~Iter}
     * @param  {object=} thisArg
     * See {@link module:traverse~Iter}
     *
     * @return {Iter}
     */
    iterator: function(kwargs, thisArg) {
      return new Iter(kwargs, thisArg);
    },

    /**
     * @see {@link module:traverse~Iter}
     * @memberof module:traverse
     * @function
     */
    iterCtor: Iter,

    /**
     * Getter for Gen class.
     * @see {@link module:traverse~Gen}
     * @memberof module:traverse
     *
     * @param  {object}  kwargs
     * See {@link module:traverse~Gen}
     * @param  {object=} thisArg
     * See {@link module:traverse~Gen}
     *
     * @return {Gen}
     */
    generator: function(kwargs, thisArg) {
      return new Gen(kwargs, thisArg);
    },

    /**
     * @see {@link module:traverse~Gen}
     * @memberof module:traverse
     * @function
     */
    genCtor: Gen
  };
})();

/**
 * Basic class for defining iterators over container objects.
 * @class
 *
 * @param {object}  kwargs
 * @param {Iter~hasNextCallback}  kwargs.hasNext
 * @param {Iter~nextCallback}  kwargs.next
 * @param {object}  kwargs.first
 * The first item to be iterated over.
 * @param {Iter~cleanCallback}  [kwargs.clean=noop]
 * @param {object} [thisArg=this]
 * Execution context for all Iter methods.
 */
function Iter(kwargs, thisArg) {
  thisArg = thisArg || this;

  /**
   * Current item being iterated over.
   * @access private
   * @type {object}
   */
  this._curr = kwargs.first;

  /**
   * Total number of iterations so far.
   * @access public
   * @type {number}
   */
  this.iterations = 0;

  /**
   * @access private
   * @type {Iter~hasNextCallback}
   */
  this._hasNext = kwargs.hasNext.bind(thisArg);

  /**
   * @access private
   * @type {Iter~nextCallback}
   */
  this._next = kwargs.next.bind(thisArg);

  /**
   * @access private
   * @type {Iter~cleanCallback}
   */
  this._clean = (kwargs.clean || _identity).bind(thisArg);
}

/**
 * Obtain a reference to the current item being iterated over.
 *
 * @return {unknown}
 * the item being iterated over.
 */
Iter.prototype.current = function() {
  return this.curr;
};

/**
 * Returns true when there are more elements to iterate over.
 *
 * @return {boolean}
 */
Iter.prototype.hasNext = function() {
  return this._hasNext.apply(null, [this._curr, this.iterations].concat(arguments));
};

/**
 * Returns next item of the container.
 * @param  {anything}
 *
 * @return {object}
 */
Iter.prototype.next = function() {
  this._curr = this._next.apply(null, [this._curr, this.iterations].concat(arguments));
  this.iterations++;

  return this._clean(this._curr);
};

/**
 * A basic generator class, i.e. an Iter where hasNext always returns true.
 * @class
 * @augments module:traverse~Iter
 *
 * @param {(object|Iter~nextCallback)}  obj
 * @param {Iter~nextCallback}  [obj.next]
 * @param {object} thisArg
 */
function Gen(obj, thisArg) {
  if(typeof obj === 'function') {
    obj = { next: obj };
  }

  obj.hasNext = _true;
  Iter.call(this, obj, thisArg);
}

Gen.prototype = Object.create(Iter.prototype);

function _true() { return true; }
function _identity(value) { return value; }

/**
 * @callback Iter~hasNextCallback
 *
 * @param {object} obj
 * Current object being iterated over
 * @param {number} iterations
 * Iterations completed
 * @param {arrayLike}
 * Any arguments passed to the hasNext method at execution.
 *
 * @return {boolean}
 * True when there are more elements to iterate over, false otherwise.
 */

/**
 * @callback Iter~nextCallback
 *
 * @param {object} obj
 * Current object being iterated over
 * @param {number} iterations
 * Iterations completed
 * @param {arrayLike}
 * Any arguments passed to the hasNext method at execution.
 *
 * @return {object}
 * The next item to iterate over.
 */

/**
 * Called before {@link Iter~next} returns.
 * @callback Iter~cleanCallback
 *
 * @param {object} obj
 * Object current being returned by `next` method.
 *
 * @return {anything}
 */
