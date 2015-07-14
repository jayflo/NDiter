'use strict';

var assert = require('assert'),
  ostree = require('../../src/class/ostree.js');

describe('ostree - integer keys', function() {
  var RED = 0, BLACK = 1;

  var tree,
    minKey = 1,
    size = 100,
    maxKey = size,
    keyArr = [];

  for(var i = 1; i < size + 1; i ++) {
    keyArr.push({ key: i });
  }

  beforeEach(function() {
    tree = ostree.get({ nodes: keyArr });
  });

  describe('structure', function() {
    it('should have black root', function() {
      assert.strictEqual(tree.root.color, BLACK);
    });

    it('red nodes should have black children', function() {
      var tmp, iter = tree.iterator();

      while(iter.hasNext()) {
        tmp = iter.next();

        if(tmp.color === RED) {
          assert.strictEqual(tmp.left.color, BLACK);
          assert.strictEqual(tmp.right.color, BLACK);
        }
      }
    });

    it('should have the same number of black nodes in each branch', function() {
      var tmp, c, counts = [], iter = tree.iterator();

      while(iter.hasNext()) {
        tmp = iter.next();

        if(tree.isNil(tmp.left) && tree.isNil(tmp.right)) {
          c = 0;

          tree.forBranch(tmp, function(node) {
            c += node.color === BLACK ? 1 : 0;
          }); // jshint ignore:line

          counts.push(c);
        }
      }

      assert(counts.every(function(v) { return v === counts[0]; }));
    });

    it('should have correct max', function() {
      assert.strictEqual(tree.maximum.key, maxKey);
    });

    it('should have correct min', function() {
      assert.strictEqual(tree.minimum.key, minKey);
    });

    it('should have correct sizes and weights', function() {
      var tmp, iter = tree.iterator();

      while(iter.hasNext()) {
        tmp = iter.next();

        assert.strictEqual(tmp.size, tmp.right.size + tmp.left.size + 1);
        assert.strictEqual(
          tmp.totalWeight, tmp.right.totalWeight + tmp.left.totalWeight + tmp.weight
        );
      }
    });

    it('should have correct successors/predecessors', function() {
      var tmp, iter = tree.iterator();

      while(iter.hasNext()) {
        tmp = iter.next();

        if(tmp.prev.key !== null) {
          assert.strictEqual(tmp.prev.key, tmp.key - 1);
        }

        if(tmp.next.key !== null) {
          assert.strictEqual(tmp.next.key, tmp.key + 1);
        }
      }
    });
  });

  describe('Node', function() {
    it('should have correct default properties', function() {
      var node = tree.Node({ key: 'a', weight: 3 });

      assert.strictEqual(node.key, 'a');
      assert.strictEqual(node.value, 'a');
      assert.strictEqual(node.weight, 3);
      assert.strictEqual(node.totalWeight, 3);
    });
  });

  describe('isNil', function() {
    it('should be correct', function() {
      assert(tree.isNil(tree._SENTINEL_));
      assert(!tree.isNil(tree.root));
    });
  });

  describe('add/insert', function() {
    it('should work', function() {
      var k = tree.minimum.key + 0.5;

      var node = tree.add(k);

      assert.notStrictEqual(tree.search(k), null);
      assert.strictEqual(node.prev.key, tree.minimum.key);
      assert.strictEqual(node.next.key, tree.minimum.key + 1);
    });
  });

  describe('search', function() {
    it('should find an existing node', function() {
      assert.strictEqual(tree.search(tree.minimum.key), tree.minimum);
      assert.strictEqual(tree.search(tree.maximum.key), tree.maximum);
      assert.strictEqual(tree.search(tree.root.key), tree.root);
    });

    it('should not find a non-existant node', function() {
      assert.strictEqual(tree.search(tree.maximum + 1), null);
    });
  });

  describe('delete', function() {
    it('should remove the node', function() {
      var min = tree.minimum;

      tree.delete(min);

      assert.notStrictEqual(tree.minimum, min);
    });
  });

  describe('min/maxAtNode', function() {
    it('should work at root', function() {
      assert.strictEqual(tree.minAtNode(tree.root), tree.minimum);
      assert.strictEqual(tree.maxAtNode(tree.root), tree.maximum);
    });
  });

  describe('rank select', function() {
    it('tree min should have rank 1', function() {
      assert.strictEqual(tree.minimum, tree.rankSelect(1));
    });

    it('tree max should have rank count', function() {
      assert.strictEqual(tree.maximum, tree.rankSelect(tree.count()));
    });

    it('should work', function() {
      var tmp, iter = tree.iterator();

      while(iter.hasNext()) {
        tmp = iter.next();

        assert.strictEqual(tmp, tree.rankSelect(tmp.key));
      }
    });
  });

  describe('weight select', function() {
    it('should work', function() {
      var tmp, iter = tree.iterator();

      while(iter.hasNext()) {
        tmp = iter.next();

        assert.strictEqual(tmp.key, tree.weightSelect(tmp.key - 0.5).key);
      }
    });
  });

  describe('totalWeight', function() {
    it('should be the sum of node weights', function() {
      var tw = 0, iter = tree.iterator();

      while(iter.hasNext()) {
        tw += iter.next().weight;
      }

      assert.strictEqual(tw, tree.totalWeight());
    });
  });
});
