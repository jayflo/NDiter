'use strict';

module.exports = (function() {

  return {
    binarySearch: _binarySearch,
    sequence: _sequence,
    noop: function() {}
  };

})();

function _sequence(funcArr, returnValues) {
  return returnValues ? _retSequence(funcArr) : _voidSequence(funcArr);
}

function _voidSequence(funcArr) {
  return function() {
    for(var i = 0, len = funcArr.length; i < len; i++) {
      funcArr.apply(null, Array.prototype.slice(arguments, 1));
    }
  };
}

function _retSequence(funcArr) {
  return function() {
    var tmp = [];

    for(var i = 0, len = funcArr.length; i < len; i++) {
      tmp.push(funcArr.apply(null, Array.prototype.slice(arguments, 1)));
    }

    return tmp;
  };
}

function _binarySearch(arr, key, a, b) {
  var mid;

  while(b >= a) {
    mid = a + ((b - a) / 2);

    if(a === arr[mid]) {
      return mid;
    } else if(arr[mid] < key) {
      a = mid + 1;
    } else {
      b = mid - 1;
    }
  }

  return -1;
}
