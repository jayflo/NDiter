'use strict';

/**
 * @module bernoulli
 */

var dvar = require('../dvar.js');

module.exports = (function() {
  return {
    /**
     * Creates a {@link module:dvar~DVar} following the Bernoulli distribution.
     * A Bernoulli random variable has two outcomes: success with probability p
     * and failure with probability 1 - p.
     * @function
     *
     * @param  {(string|number|object)} keyObjp
     * The parameters for the outcome representing success.
     * See {@link module:dvar~DVar~add}.
     * @param  {(string|number|object)} keyObjq
     * The parameters for the outcome representing failure.
     * See {@link module:dvar~DVar~add}.
     * @param  {number}
     * A number 0 <= p <= 1 representing the probability of success.
     */
    get: _bernoulli
  };
})();

function _bernoulli(keyObjp, keyObjq, p) {
  var rv = dvar.get();

  rv.add(keyObjp, p);
  rv.add(keyObjq, 1 - p);

  return rv;
}
