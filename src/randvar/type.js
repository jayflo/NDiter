'use strict';

var unif = require('./uniform.js'),
  pullback = require('../utils/fn.js').pullback,
  traverse = require('../class/traverse.js');

var nextFns = {
  float: _retPullback(_float),
  int: _retPullback(_int),
  char: function() { return _char; },
  bool: function() { return _bool; },
  string: _retPullback(_str),
  floatArray: _retPullback(_floatArr),
  intArray: _retPullback(_intArr),
  strArray: _retPullback(_strArr),
  seqValue: function(seq) { return _seqValue.bind(null, seq); },
  key: function(obj) { return _key.bind(null, obj); },
  objValue: function(obj) { return _objValue.bind(null, obj); },
  shuffle: function(seq) { return _shuffle.bind(null, seq); },
  permutation: function(seq) { return _permutation.bind(null, seq); }
};

module.exports = (function() {
  return {
    float: _float,
    int: _int,
    char: _char,
    bool: _bool,
    string: _str,
    floatArray: _floatArr,
    intArray: _intArr,
    strArray: _strArr,
    seqValue: _seqValue,
    key: _key,
    objValue: _objValue,
    shuffle: _shuffle,
    permutation: _permutation,
    generator: function(type) {
      return traverse.generator({
        next: nextFns[type].apply(null, Array.prototype.slice(arguments, 1))
      });
    }
  };
})();

function _retPullback(fn) {
  return function() {
    return pullback.apply(null, [fn].concat(arguments));
  };
}

function _float(a, b) {
  return a + (unif() * (b - a));
}

function _int(a, b) {
  return Math.round(_float(Math.ceil(a), Math.floor(b)));
}

var _lowerCase = 'abcdefghijklmnopqrstuvwxyz';
function _char() {
  return _lowerCase[_int(0, 26)];
}

function _bool() {
  return _int(0, 1) !== 0;
}

function _str(length) {
  var s = '';

  while(length-- > 0) {
    s += _char();
  }

  return s;
}

function _array(fn, length) {
  var arr = [];

  while(length-- > 0) { arr.push(fn()); }

  return arr;
}

function _boundedArray(length, fn, a, b) {
  a = a === undefined || a === null ? Number.MIN_VALUE : a;
  b = b === undefined || b === null ? Number.MAX_VALUE : b;

  return _array(fn, a, b, length);
}

function _floatArr(length, a, b) {
  return _boundedArray(length, _float, a, b);
}

function _intArr(length, a, b) {
  return _boundedArray(length, _int, a, b);
}

function _strArr(length, strLength, deterministicLength) {
  var fn = deterministicLength ?
    pullback(_str, strLength) :
    pullback(_str, pullback(_int, 0, strLength));

  return _array(fn, length);
}

function _seqValue(value) {
  return value[_int(0, value.length)];
}

function _key(obj) {
  var keys = Object.keys(obj);

  return keys[_int(0, keys.length)];
}

function _objValue(obj) {
  return obj[_key(obj)];
}

function _shuffle(value) {
  var tmp, j, end = value.length - 1, max = end;

  for(var i = 0; i < end; i++) {
    j = _int(i, max);
    tmp = value[i];
    value[i] = value[j];
    value[j] = value[i];
  }

  return value;
}

function _permutation(value) {
  var j, ret = [];

  for(var i = 0, len = value.length; i < len; i++) {
    j = _int(0, i);

    if(j !== i) {
      ret[i] = ret[j];
    }

    ret[j] = value[i];
  }

  return ret;
}
