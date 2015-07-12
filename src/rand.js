'use strict';

var unif = require('./continuous/uniform.js');

var _lowerCase = 'abcdefghijklmnopqrstuvwxyz';

module.exports = (function() {
  return {
    _float: __float,
    _int: __int,
    _char: __char,
    _bool: __bool,
    _index: __index,
    _key: __key,
    _seqVal: __seqVal,
    _objVal: __objVal
  };
})();


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

function __index(value) {
  return __int(0, value.length);
}

function __key(obj) {
  var keys = Object.keys(obj);

  return Object.keys(obj)[__int(0, keys.length)];
}

function __seqVal(value) {
  return value[__index(value)];
}

function __objVal(obj) {
  return obj[__key(obj)];
}
