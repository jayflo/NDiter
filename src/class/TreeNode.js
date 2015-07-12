'use strict';

var assert = require('assert');

function TreeNode(kwargs) {
  assert(kwargs.key !== undefined, 'Invalid node key.');

  this.key = kwargs.key;
  this.value = kwargs.value;
  this.parent = kwargs.parent || null;
  this.left = kwargs.left || null;
  this.right = kwargs.right || null;
}

/**
 * Exports
 */

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new TreeNode(kwargs);
    }
  };
})();
