'use strict';

/**
 * @module rand
 * @description
 * Provides many methods for randomly generating JS type instances.  Also serves
 * as a factory for generators which produce type instances.  Note: all methods
 * currently generate their values uniformly (this may be updated in the future).
 * @see {@link module:traverse~Gen}
 */

var unif = require('../stats/cpds/uniform.js'),
  pullback = require('../js/fn.js').pullback,
  traverse = require('../class/traverse.js');

// next methods for generators
var nextFns = {
  float: pullback.bind(null, _float),
  int: pullback.bind(null, _int),
  char: _identity.bind(null, _char),
  bool: _identity.bind(null, _bool),
  string: pullback.bind(null, _str),
  floatArray: pullback.bind(null, _floatArr),
  intArray: pullback.bind(null, _intArr),
  stringArray: pullback.bind(null, _strArr),
  seqValue: pullback.bind(null, _seqValue),
  key: pullback.bind(null, _key),
  objValue: pullback.bind(null, _objValue),
  shuffle: pullback.bind(null, _shuffle),
  permutation: pullback.bind(null, _permutation),
};

module.exports = (function() {
  return {
    /**
     * @function
     * @param  {number} a
     * upper bound
     * @param  {number} b
     * lower bound
     *
     * @return  {float}
     * a float in the interval [a, b].
     */
    float: _float,

    /**
     * @function
     * @param  {number} a
     * upper bound
     * @param  {number} b
     * lower bound
     *
     * @return  {integer}
     * an integer in the interval [a, b].
     */
    int: _int,

    /**
     * @function
     * @return  {string}
     * a (lower case) character in the range a-z.
     */
    char: _char,

    /**
     * @function
     * @return  {boolean}
     * true or false.
     */
    bool: _bool,

    /**
     * @function
     * @param  {integer} length
     * length of string to output.
     * @param  {boolean} [isMaxLength=false]
     * When true, produces a string whose length lies in the interval [0, length].
     * When false, produces a string whose length is `length`l
     *
     * @return  {string}
     * A string as specified by the parameters.
     */
    string: _str,

    /**
     * @function
     * @param  {integer} length
     * length of resulting array.
     * @param  {number} a
     * upper bound for each float in the array
     * @param  {number} b
     * lower bound for each float in the array
     * @param  {boolean} [isMaxLength=false]
     * When true, produces an array whose length lies in the interval [0, length].
     * When false, produces an array of length `length`.
     *
     * @return  {float[]}
     * an array of floats in the interval [a, b].
     */
    floatArray: _floatArr,

    /**
     * @function
     * @param  {integer} length
     * length of resulting array.
     * @param  {number} a
     * upper bound for each integer in the array
     * @param  {number} b
     * lower bound for each integer in the array
     * @param  {boolean} [isMaxLength=false]
     * When true, produces an array whose length lies in the interval [0, length].
     * When false, produces an array of length `length`.
     *
     * @return  {integer[]}
     * an array of integers in the interval [a, b].
     */
    intArray: _intArr,

    /**
     * @function
     * @param  {integer} length
     * length of resulting array.
     * @param  {boolean} [isMaxLength=false]
     * When true, produces an array whose length lies in the interval [0, length].
     * When false, produces an array of length `length`.
     *
     * @return  {boolean[]}
     * an array of true/false values.
     */
    boolArray: _boolArr,

    /**
     * @function
     * @param  {integer} length
     * length of resulting array.
     * @param  {integer} stringLength
     * length of strings to generate.
     * @param  {boolean} [isMaxStringLength=false]
     * When true, produces strings whose length lies in the interval [0, length].
     * When false, produces strings whose length is `length`.
     * @param  {boolean} [isMaxArrayLength=false]
     * When true, produces an array whose length lies in the interval [0, length].
     * When false, produces an array of length `length`.
     *
     * @return  {string[]}
     * an array of strings.
     */
    stringArray: _strArr,

    /**
     * @function
     * @param  {(array|string)} seq
     *
     * @return  {unknown}
     * the value at a random index of seq.
     */
    seqValue: _seqValue,

    /**
     * @function
     * @param  {object} obj
     *
     * @return  {string}
     * A random key of obj.
     */
    key: _key,

    /**
     * @function
     * @param  {object} obj
     *
     * @return  {unknown}
     * A random value of obj.
     */
    objValue: _objValue,

    /**
     * @function
     * @param  {(array|string)} seq
     *
     * @return  {array}
     * A random, *in place* (irrelevant for strings) permutation of array.
     */
    shuffle: _shuffle,

    /**
     * @function
     * @param  {(array|string)} seq
     *
     * @return  {array}
     * Creates a pertmuted copy (same as shuffle for strins) of seq.
     */
    permutation: _permutation,

    /**
     * Provides generators whose `next` method generate random type instances
     * as per the other methods in this module.
     *
     * @param  {string} typeFn
     * The name of one of the random type instance methods, e.g. 'int', 'string',
     * 'stringArray'.
     * @param  {...args}
     * The arguments specified by typeFn's signature with the exception that
     * each argument may be replaced by a function that returns the appropriate
     * type.  At execution, each function intercepts the `next` methods arguments,
     * executes and provides it's value to the random instance method.
     *
     * @return {Gen}
     * A generator which returns random type instances as specified by the
     * previous arguments.
     */
    generator: function(type) {
      return traverse.generator({
        next: nextFns[type].apply(null, Array.prototype.slice.call(arguments, 1))
      });
    }
  };
})();

function _identity(fn) {
  return fn;
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
  var tmp, j, end = value.length - 1, max = end,
    isString = typeof value === 'string';

  value = isString ? value.split('') : value;


  for(var i = 0; i < end; i++) {
    j = _int(i, max);
    tmp = value[i];
    value[i] = value[j];
    value[j] = value[i];
  }

  return isString ? value.join('') : value;
}

function _permutation(value) {
  var j, ret = [], isString = typeof value === 'string';

  value = isString ? value.split('') : value;

  for(var i = 0, len = value.length; i < len; i++) {
    j = _int(0, i);

    if(j !== i) {
      ret[i] = ret[j];
    }

    ret[j] = value[i];
  }

  return isString ? ret.join('') : ret;
}
