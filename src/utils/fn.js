'use strict';

module.exports = (function() {
  return {
    pullback: _pullback
  };
})();

function _pullback(fn) {
  var args = Array.prototype.slice(arguments, 1);

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
