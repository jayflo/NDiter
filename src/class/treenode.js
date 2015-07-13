'use strict';

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new TreeNode(kwargs);
    },

    ctor: TreeNode
  };
})();

/**
 * Constructor
 */

function TreeNode(kwargs) {
  this.key = kwargs.key;
  this.value = kwargs.value;
  this.parent = kwargs.parent || null;
  this.left = kwargs.left || null;
  this.right = kwargs.right || null;
  this.next = kwargs.next || null;
  this.prev = kwargs.prev || null;
}

/**
 * Prototype
 */

/**
 * Private
 */
