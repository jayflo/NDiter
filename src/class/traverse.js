'use strict';

module.exports = (function() {
  return {
    iterator: function(kwargs, thisArg) {
      return new Iter(kwargs, thisArg);
    },

    iterCtor: Iter,

    generator: function(kwargs, thisArg) {
      return new Gen(kwargs, thisArg);
    },

    genCtor: Gen
  };
})();

function Iter(kwargs, thisArg) {
  this._thisArg = thisArg || null;
  this._hasNext = kwargs.hasNext.bind(thisArg);
  this._next = kwargs.next.bind(thisArg);
  this._clean = (kwargs.clean || _identity).bind(thisArg);
  this._curr = kwargs.pre;

  this.iterations = 0;
}

Iter.prototype.hasNext = function() {
  return this._hasNext(this._curr, this.iterations);
};

Iter.prototype.next = function() {
  this._curr = this._next.apply(null, arguments);
  this.iterations++;

  return this._clean(this._curr);
};

function Gen(obj, thisArg) {
  Iter.call(this, typeof obj === 'function' ? { next: obj } : obj, thisArg);
  this._hasNext = _true;
}

Gen.prototype = Object.create(Iter.prototype);

function _true() { return true; }
function _identity(value) { return value; }
