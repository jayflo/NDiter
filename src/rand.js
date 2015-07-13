'use strict';

var unif = require('./continuous/uniform.js'),
  traverse = require('./class/traverse.js');

var genNexts = {
  float: __coFn(__float),
  int: __coFn(__int),
  char: function() { return __char; },
  bool: function() { return __bool; },
  string: __coFn(__str),

  // fix
  floatArray: function() {
    return __coFn(__floatArr.bind(null, arguments[1])).apply(null, Array.prototype.slice(arguments, 2));
  },
  intArray: function() {
    return __intArr.bind(null, Array.prototype.slice(arguments, 1));
  },
  strArray: function() {
    return __strArr.bind(null, Array.prototype.slice(arguments, 1));
  },

  seqValue: function(seq) {
    return __seqValue.bind(null, seq);
  },
  key: function(obj) {
    return __key.bind(null, obj);
  },
  objValue: function(obj) {
    return __objValue.bind(null, obj);
  },
  shuffle: function(seq) {
    return __shuffle.bind(null, seq);
  },
  permutation: function(seq) {
    return __permutation.bind(null, seq);
  }
};

module.exports = (function() {
  return {
    generator: function(type) {
      return traverse.generator({
        next: genNexts[type].apply(null, Array.prototype.slice(arguments, 1))
      });
    }
  };
})();

function __float(a, b) {
  return a + (unif() * (b - a));
}

function __int(a, b) {
  return Math.round(__float(Math.ceil(a), Math.floor(b)));
}

var _lowerCase = 'abcdefghijklmnopqrstuvwxyz';
function __char() {
  return _lowerCase[__int(0, 26)];
}

function __bool() {
  return __int(0, 1) !== 0;
}

function __str(length) {
  var s = '';

  while(length-- > 0) {
    s += __char();
  }

  return s;
}

function __array(fn, length) {
  var arr = [];

  while(length-- > 0) { arr.push(fn()); }

  return arr;
}

function __boundedArray(fn, length, a, b) {
  a = a === undefined || a === null ? Number.MIN_VALUE : a;
  b = b === undefined || b === null ? Number.MAX_VALUE : b;

  return __array(__coFn(fn)(a, b), length);
}

function __floatArr(length, a, b) {
  return __boundedArray(__float, length, a, b);
}

function __intArr(length, a, b) {
  return __boundedArray(__int, length, a, b);
}

function __strArr(length, strLength, deterministicLength) {
  var fn = deterministicLength ?
    __coFn(__str)(strLength) :
    __coFn(__str)(__coFn(__int)(0, strLength));

  return __array(fn, length);
}

function __seqValue(value) {
  return value[__int(0, value.length)];
}

function __key(obj) {
  var keys = Object.keys(obj);

  return keys[__int(0, keys.length)];
}

function __objValue(obj) {
  return obj[__key(obj)];
}

function __shuffle(value) {
  var tmp, j, end = value.length - 1, max = end;

  for(var i = 0; i < end; i++) {
    j = __int(i, max);
    tmp = value[i];
    value[i] = value[j];
    value[j] = value[i];
  }

  return value;
}

function __permutation(value) {
  var j, ret = [];

  for(var i = 0, len = value.length; i < len; i++) {
    j = __int(0, i);

    if(j !== i) {
      ret[i] = ret[j];
    }

    ret[j] = value[i];
  }

  return ret;
}

function __coFn(fn) {
  return function(a, b) {
    if(typeof a === 'function') {
      if(typeof b === 'function') {
        return function() { return fn(a.apply(null, arguments), b.apply(null, arguments)); };
      }

      return function() { return fn(a.apply(null, arguments), b); };
    }

    if(typeof b === 'function') {
      return function() { return fn(a, b.apply(null, arguments)); };
    }

    return fn.bind(null, a, b);
  };
}
