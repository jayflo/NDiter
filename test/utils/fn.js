'use strict';

var assert = require('assert'),
  fnMod = require('../../src/utils/fn.js');

describe('pullback', function() {
  it('should do nothing to non-function arguments', function() {
    assert.strictEqual(fnMod.pullback(test, 1, 2)(), 3);
  });

  it('should execute function arguments first', function() {
    assert.strictEqual(fnMod.pullback(test, _shift(1), _shift(2))(1), 5);
  });

  it('work with mixed arguments', function() {
    assert.strictEqual(fnMod.pullback(test, 1, _shift(2))(1), 4);
  });

  function test(a, b) {
    return a + b;
  }

  function _shift(n) {
    return function(x) {
      return x + n;
    };
  }
});
