'use strict';

/**
 * @module binom
 */

var dvar = require('../dvar.js');

module.exports = (function() {
  return {

    /**
     * Creates a {@link module:dvar~DVar} following the binomial distribution.  Given an
     * event that succeeds with probability p, the distribution binom(n, p)
     * provides the probability of obtaining k successes in n trials, where
     * k=1,2,...,n.
     * @function
     *
     * @param  {(integer|object[])} nArr
     * When an integer, creates a {@link module:dvar~DVar} with n outcomes whose
     * keys (=== values) represent the outcome having k successes.  When nArr
     * is an array when length l, creates a DVar following binom(l, p) and the
     * object at index k provides the key, value information for the outcome
     * representing k successes.  Hence, each object should have properties 'key'
     * and 'value', see {@link module:dvar~DVar~add}.
     * @param  {number} p
     * A number 0 <= p <= 1 representing the probability of the event's success.
     */
    get: _binom
  };
})();

/*
  Binomial
 */

function _binom(nArr, p) {
  var n, bc, hndlr, rv = dvar.get(), lp = 1 - p;

  if(Array.isArray(nArr)) {
    n = nArr.length;
    hndlr = addWithArray;
  } else {
    n = nArr;
    hndlr = noArray;
  }

  bc = _binomialCoeffs(n);

  for(var i = 0; i <= n; i++) {
    hndlr(i);
  }

  return dvar;

  function addWithArray(k) {
    rv.add(nArr[k], bc[k] * Math.pow(p, k) * Math.pow(lp, n - k));
  }

  function noArray(k) {
    rv.add(k, bc[k] * Math.pow(p, k) * Math.pow(lp, n - k));
  }
}

function _binomialCoeffs(n) {
  var tmp = [1], mid = n / 2;

  for(var i = 1; i <= mid; i++) {
    tmp.push(tmp[i - 1] * (n - i + 1) / i);
  }

  return tmp.concat(tmp.slice(0, n % 2 === 0 ? -1 : undefined).reverse());
}
