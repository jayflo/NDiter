'use strict';

var assert = require('assert'),
  rand = require('../../src/js/rand.js');

var _lowerCase = 'abcdefghijklmnopqrstuvwxyz';

describe('random type generators', function() {
  var tmp, a = 10, b = 20, l = 10;

  describe('float', function() {
    it('should generate a random float', function() {
      randFloatTest(rand.float(a, b), a, b);
    });
  });

  describe('int', function() {
    it('should generate a random int', function() {
      randIntTest(rand.int(a, b), a, b);
    });
  });

  describe('char', function() {
    it('should generate a random char', function() {
      tmp = rand.char();
      assert(_lowerCase.indexOf(tmp) > -1);
    });
  });

  describe('boolean', function() {
    it('should generate a random boolean', function() {
      assert(typeof rand.bool() === 'boolean');
    });
  });

  describe('string', function() {
    it('should generate a random string', function() {
      randStringTest(rand.string(l), l, l);
      randStringTest(rand.string(l, true), 0, l);
    });
  });

  describe('floatArr', function() {
    it('should generate a random floatArr', function() {
      randArrayTest(
        rand.floatArray(l, a, b),
        randFloatTest,
        l, a, b
      );
    });
  });

  describe('intArray', function() {
    it('should generate a random intArray', function() {
      randArrayTest(
        rand.intArray(l, a, b),
        randIntTest,
        l, a, b
      );
    });
  });

  describe('stringArray', function() {
    it('should generate a random stringArray', function() {
      randArrayTest(
        rand.stringArray(l, l, true),
        randStringTest,
        l, l, l
      );

      randArrayTest(
        rand.stringArray(l, l, false),
        randStringTest,
        l, 0, l
      );
    });
  });

  describe('sequence value', function() {
    it('should generate a random sequence value', function() {
      var arr = rand.stringArray(l, l);
      tmp = rand.seqValue(arr);

      assert(arr.indexOf(tmp) > -1);

      arr = rand.string(l);
      tmp = rand.seqValue(arr);

      assert(arr.indexOf(tmp) > -1);
    });
  });

  describe('object key/value', function() {
    it('should generate a random object key/value', function() {
      tmp = { a: 1, b: 2, c: 3 };

      var key = rand.key(tmp);

      assert(tmp.hasOwnProperty(key));
      assert([1,2,3].indexOf(rand.objValue(tmp) > -1));
    });
  });

  describe('generator generates random', function() {
    var span = 5;

    describe('floats', function() {
      it('with fixed endpoints', function() {
        tmp = rand.generator('float', a, b);

        for(var i = 0; i < l; i++) {
          randFloatTest(tmp.next(), a, b);
        }
      });

      it('with function endpoints', function() {
        tmp = rand.generator('float', left, right);

        for(var i = 0; i < l; i++) {
          randFloatTest(tmp.next(), tmp.iterations - 1, tmp.iterations + span - 1);
        }
      });
    });

    describe('ints', function() {
      it('with fixed endpoints', function() {
        tmp = rand.generator('int', a, b);

        for(var i = 0; i < l; i++) {
          randIntTest(tmp.next(), a, b);
        }
      });

      it('with function endpoints', function() {
        tmp = rand.generator('int', left, right);

        for(var i = 0; i < l; i++) {
          randIntTest(tmp.next(), left(0, tmp.iterations - 1), right(0, tmp.iterations- 1));
        }
      });
    });

    describe('chars', function() {
      it('', function() {
        tmp = rand.generator('char');

        for(var i = 0; i < l; i++) {
          assert(_lowerCase.indexOf(tmp.next()) > -1);
        }
      });
    });

    describe('bools', function() {
      it('', function() {
        tmp = rand.generator('bool');

        for(var i = 0; i < l; i++) {
          assert(typeof tmp.next() === 'boolean');
        }
      });
    });

    describe('strings', function() {
      it('with fixed length', function() {
        tmp = rand.generator('string', l);

        for(var i = 0; i < l; i++) {
          randStringTest(tmp.next(), l, l);
        }

        tmp = rand.generator('string', l, true);

        for(i = 0; i < l; i++) {
          randStringTest(tmp.next(), 0, l);
        }
      });

      it('with function length', function() {
        tmp = rand.generator('string', right);

        for(var i = 0; i < l; i++) {
          randStringTest(tmp.next(), right(0, tmp.iterations - 1), right(0, tmp.iterations - 1));
        }

        tmp = rand.generator('string', right, true);

        for(i = 0; i < l; i++) {
          randStringTest(tmp.next(), 0, right(0, tmp.iterations - 1));
        }
      });
    });

    describe('float array', function() {
      it('with fixed length', function() {
        tmp = rand.generator('floatArray', l, a, b);

        for(var i = 0; i < l; i++) {
          randArrayTest(
            tmp.next(),
            randFloatTest,
            l, a, b
          );
        }
      });

      it('with function length', function() {
        tmp = rand.generator('floatArray', l, 0, right);

        for(var i = 0; i < l; i++) {
          randArrayTest(
            tmp.next(),
            randFloatTest,
            l, 0, right(0, tmp.iterations - 1)
          );
        }
      });
    });

    describe('int array', function() {
      it('with fixed length', function() {
        tmp = rand.generator('intArray', l, a, b);

        for(var i = 0; i < l; i++) {
          randArrayTest(
            tmp.next(),
            randIntTest,
            l, a, b
          );
        }
      });

      it('with function length', function() {
        tmp = rand.generator('intArray', l, 0, right);

        for(var i = 0; i < l; i++) {
          randArrayTest(
            tmp.next(),
            randIntTest,
            l, 0, right(0, tmp.iterations - 1)
          );
        }
      });
    });

    describe('string array', function() {
      it('with fixed string length', function() {
        tmp = rand.generator('stringArray', l, b);

        for(var i = 0; i < l; i++) {
          randArrayTest(
            tmp.next(),
            randStringTest,
            l, b, b
          );
        }
      });

      it('with function string length', function() {
        tmp = rand.generator('stringArray', l, 0, right);

        for(var i = 0; i < l; i++) {
          randArrayTest(
            tmp.next(),
            randStringTest,
            l, 0, right(0, tmp.iterations - 1)
          );
        }
      });
    });

    function left(c, i) {
      return i;
    }

    function right(c, i) {
      return i + span;
    }
  });
});

function randArrayTest(arr, fn, l, a, b) {
  assert(Array.isArray(arr));
  assert(arr.length === l);

  it('each entry should be random float', function() {
    arr.forEach(function(x) {
      fn(x, a, b);
    });
  });
}

function randStringTest(x, a, b) {
  assert(typeof x === 'string');
  assert(a <= x.length && x.length <= b);
}

function randFloatTest(x, a, b) {
  assert(a <= x && x <= b);
  assert(typeof x === 'number');
}

function randIntTest(x, a, b) {
  randFloatTest(x, a, b);
  assert.strictEqual(Math.floor(x), x);
}
