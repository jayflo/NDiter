'use strict';

var unif = require('./continuous/uniform.js');

module.exports = (function() {
  return {
    _float: __float,
    _int: __int,
    _char: __char,
    _bool: __bool,
    _str: __str,
    _intArr: __intArr,
    _strArr: __strArr,
    _index: __index,
    _key: __key,
    _seqVal: __seqVal,
    _objVal: __objVal,
    _shuffle: __shuffle,
    _permutation: __permutation
  };
})();

var _lowerCase = 'abcdefghijklmnopqrstuvwxyz';

function __float(a, b) {
  return a + (unif() * (b - a));
}

function __int(a, b) {
  return Math.round(__float(a, b));
}

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

function __intArr(length, minValue, maxValue) {
  minValue = isNaN(minValue) ? Number.MIN_VALUE : minValue;
  maxValue = isNaN(maxValue) ? Number.MAX_VALUE : maxValue;

  var arr = [];

  while(length-- > 0) {
    arr.push(__int(minValue, maxValue));
  }

  return arr;
}

function __strArr(length, maxStrLength) {
  maxStrLength = isNaN(maxStrLength) ? 10 : Math.min(100, maxStrLength);

  var arr = [];

  while(length-- > 0) {
    arr.push(__str(__int(0, maxStrLength)));
  }
}

function __index(value) {
  return __int(0, value.length);
}

function __seqVal(value) {
  return value[__index(value)];
}

function __key(obj) {
  var keys = Object.keys(obj);

  return keys[__int(0, keys.length)];
}

function __objVal(obj) {
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
