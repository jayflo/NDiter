'use strict';

var unif = require('./uniform.js'),
  pullback = require('../utils/fn.js').pullback,
  traverse = require('../class/traverse.js');

var nextFns = {
  float: pullback.bind(null, _float),
  int: pullback.bind(null, _int),
  char: _bind1(_char),
  bool: _bind1(_bool),
  string: pullback.bind(null, _str),
  floatArray: pullback.bind(null, _floatArr),
  intArray: pullback.bind(null, _intArr),
  stringArray: pullback.bind(null, _strArr),
  seqValue: _bind1(_seqValue),
  key: _bind1(_key),
  objValue: _bind1(_objValue),
  shuffle: _bind1(_shuffle),
  permutation: _bind1(_permutation),
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
    boolArray: _boolArr,
    stringArray: _strArr,
    seqValue: _seqValue,
    key: _key,
    objValue: _objValue,
    shuffle: _shuffle,
    permutation: _permutation,
    generator: function(type) {
      return traverse.generator({
        next: nextFns[type].apply(null, Array.prototype.slice.call(arguments, 1))
      });
    }
  };
})();

function _bind1(fn) {
  return function() {
    return fn.bind(null, arguments.length > 0 ? arguments[0] : undefined);
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
  return _lowerCase[_int(0, 25)];
}

function _bool() {
  return _int(0, 1) !== 0;
}

function _str(length, isMaxLength) {
  var s = '';

  length = isMaxLength ? _int(0, length) : length;

  while(length-- > 0) {
    s += _char();
  }

  return s;
}

function _array(fn, length, isMaxLength) {
  var arr = [];

  length = isMaxLength ? _int(0, length) : length;

  while(length-- > 0) { arr.push(fn()); }

  return arr;
}

function _boundedArray(length, fn, a, b, isMaxLength) {
  a = a === undefined || a === null ? Number.MIN_VALUE : a;
  b = b === undefined || b === null ? Number.MAX_VALUE : b;

  return _array(fn.bind(null, a, b), length, isMaxLength);
}

function _floatArr(length, a, b, isMaxLength) {
  return _boundedArray(length, _float, a, b, isMaxLength);
}

function _intArr(length, a, b, isMaxLength) {
  return _boundedArray(length, _int, a, b, isMaxLength);
}

function _boolArr(length, isMaxLength) {
  return _array(_bool, length, isMaxLength);
}

function _strArr(length, strLength, isMaxStringLength, isMaxArrayLength) {
  return _array(_str.bind(null, strLength, isMaxStringLength), length, isMaxArrayLength);
}

function _seqValue(value) {
  return value[_int(0, value.length - 1)];
}

function _key(obj) {
  return _seqValue(Object.keys(obj));
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
