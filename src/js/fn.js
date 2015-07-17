'use strict';

/**
 * @module fn
 */

module.exports = (function() {
  return {
    /**
     * Allows a specified function expecting non-function arguments to accept
     * function arguments whose return values are passed to the specified function.
     *
     * @function
     * @param  {Function}  fn
     * @param  {...args} args
     * Arguments that fit fn's signture, or funcions which return types that
     * fit fn's signature.
     *
     * @return  {Function}
     * A function that, when called, passes it's own arguments on to the (function)
     * type arguments of fn.  Each (function) argument of fn that was passed into
     * pullback is executed with *this* function's arguments, and their results
     * are passed to fn which is then executed and whose result is return.  Note:
     * any argument to pullback which is not a function is passed along.
     *
     */
    pullback: _pullback
  };
})();

function _pullback(fn) {
  var args = Array.prototype.slice.call(arguments, 1);

  return function() {
    var tmp = [];

    for(var i = 0, len = args.length; i < len; i++) {
      tmp.push(
        typeof args[i] === 'function' ? args[i].apply(null, arguments) : args[i]
      );
    }

    return fn.apply(null, tmp);
  };
}
