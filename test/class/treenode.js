'use strict';

var assert = require('assert'),
  treenode = require('../../src/class/treenode.js');

describe('treenode', function() {
  var tn = treenode.get({
    key: 'nodekey',
    value: 'something'
  });

  describe('get', function() {
    it('should return a TreeNode instance', function() {
      assert.strictEqual(tn.key, 'nodekey');
      assert.strictEqual(tn.value, 'something');
    });
  });
});
