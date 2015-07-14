'use strict';

var assert = require('assert'),
  traverse = require('../../src/class/traverse.js');

describe('traverse', function() {
  describe('iterator', function() {
    var sum, arr, iter;

    beforeEach(function() {
      sum = 0;
      arr = [2, 8, 11];
      iter = traverse.iterator({
        hasNext: function(a, i) {
          return i < arr.length;
        },
        next: function() {
          return arr[this.iterations];
        }
      });
    });

    describe('hasNext', function() {
      it('should return true when elements remain', function() {
        assert.equal(iter.hasNext(), true);
      });

      it('should return false when no elements remain', function() {
        var i = arr.length;

        while(i-- > 0) {
          iter.next();
        }

        assert.equal(iter.hasNext(), false);
      });
    });

    describe('next', function() {
      it('should return the next item', function() {
        var i = 0;

        while(iter.hasNext()) {
          assert.strictEqual(iter.next(), arr[i++]);
        }
      });
    });

    it('should iterate through all elements', function() {
      while(iter.hasNext()) {
        sum += iter.next();
      }

      assert.strictEqual(sum, arr.reduce(function(p, c) { return p + c; }, 0));
    });
  });

  describe('generator', function() {
    var gen;

    beforeEach(function() {
      gen = traverse.generator({
        first: 0,
        next: function(c, i) {
          return c + i;
        }
      });
    });

    describe('next', function() {
      it('should always generate a new item', function() {
        for(var i = 0; i < 10; i++) {
          assert.strictEqual(gen.next(), (i * (i + 1)) / 2);
        }
      });
    });
  });
});
