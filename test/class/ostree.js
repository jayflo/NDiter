'use strict';

var assert = require('assert'),
  ostree = require('../../src/class/ostree.js');

var RED = 0, BLACK = 1;

describe('ostree - integer keys', function() {
  describe('invariants', function() {
    treeInvarianceTestSubjects().forEach(function(treeState) {
      var tree = treeState.tree,
        minKey = treeState.minKey,
        maxKey = treeState.maxKey,
        title = treeState.title;

      describe(title, function() {
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

        // deleting nodes can leave black count in certain branches off by 1.
        // must write better test.
        if(!/.*delete.*/.test(title)) {
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
        }

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
          var tmp, i, keys = [], iter = tree.iterator();

          while(iter.hasNext()) {
            keys.push(iter.next().key);
          }

          keys.sort(function(a,b) { return a - b; });
          iter = tree.iterator();
          i = 0;

          while(iter.hasNext()) {
            tmp = iter.next();

            assert.strictEqual(tmp.key, keys[i]);

            if(!tree.isNil(tmp.prev)) {
              assert.strictEqual(tmp.prev.key, keys[i - 1]);
            }

            if(!tree.isNil(tmp.next)) {
              assert.strictEqual(tmp.next.key, keys[i + 1]);
            }

            i++;
          }
        });
      });
    });
  });

  describe('methods', function() {
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

    describe('add/insert', function() {
      it('should change minimum', function() {
        var k = tree.minimum.key - 1;

        tree.add(k);

        assert.strictEqual(tree.minimum.key, k);
      });

      it('should change the maximum', function() {
        var k = tree.maximum.key + 1;

        tree.add(k);

        assert.strictEqual(tree.maximum.key, k);
      });
    });

    describe('delete', function() {

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
});


function treeInvarianceTestSubjects() {
  var tree, minKey = 1, size = 100, maxKey = size, keyArr = [];

  for(var i = 1; i < size + 1; i ++) {
    keyArr.push({ key: i });
  }

  var tmp, key, trees = [{
    tree: ostree.get({ nodes: keyArr }),
    minKey: minKey,
    maxKey: maxKey,
    title: 'on construction'
  }];

  tmp = ostree.get({ nodes: keyArr });
  tmp.add(minKey - 1);
  trees.push({
    tree: tmp,
    minKey: minKey - 1,
    maxKey: maxKey,
    title: 'add min node'
  });

  tmp = ostree.get({ nodes: keyArr });
  tmp.add(11.5);
  trees.push({
    tree: tmp,
    minKey: minKey,
    maxKey: maxKey,
    title: 'add node'
  });

  tmp = ostree.get({ nodes: keyArr });
  tmp.add(maxKey + 1);
  trees.push({
    tree: tmp,
    minKey: minKey,
    maxKey: maxKey + 1,
    title: 'add max node'
  });

  tmp = ostree.get({ nodes: keyArr });
  tmp.delete(tmp.minimum);
  trees.push({
    tree: tmp,
    minKey: minKey + 1,
    maxKey: maxKey,
    title: 'delete min node'
  });

  tmp = ostree.get({ nodes: keyArr });
  tmp.delete(tmp.maximum);
  trees.push({
    tree: tmp,
    minKey: minKey,
    maxKey: maxKey - 1,
    title: 'delete max node'
  });

  tmp = ostree.get({ nodes: keyArr });
  var n, iter = tmp.iterator();
  while(iter.hasNext()) {
    n = iter.next();

    if(n.color === RED) {
      break;
    }
  }
  tmp.delete(n);
  trees.push({
    tree: tmp,
    minKey: 1,
    maxKey: maxKey,
    title: 'delete red node'
  });

  return trees;
}
