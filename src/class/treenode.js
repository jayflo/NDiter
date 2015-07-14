'use strict';

/**
 * @module treenode
 */

module.exports = (function() {
  return {
    /**
     * Getter for TreeNode class.
     * @see {@link module:treenode~TreeNode}
     * @memberof module:treenode
     *
     * @param  {object} kwargs
     * See {@link module:treenode~TreeNode}
     *
     * @return {TreeNode}
     */
    get: function(kwargs) {
      return new TreeNode(kwargs);
    },

    /**
     * @see {@link module:treenode~TreeNode}
     * @memberof module:treenode
     * @function
     */
    ctor: TreeNode
  };
})();

/**
 * Basic structure of a binary tree node.
 * @class
 *
 * @param {object} kwargs
 * @param  {(string|number)} kwargs.key
 * @param  {object} [kwargs.value=undefined]
 * @param  {TreeNode} [kwargs.parent=null]
 * @param  {TreeNode} [kwargs.left=null]
 * @param  {TreeNode} [kwargs.right=null]
 * @param  {TreeNode} [kwargs.next=null]
 * @param  {TreeNode} [kwargs.prev=null]
 */
function TreeNode(kwargs) {

  /**
   * Key used to store node in tree.
   * @access public
   * @type {(string | number)}
   */
  this.key = kwargs.key;

  /**
   * Value stored by node.
   * @access public
   *
   * @type {anything}
   */
  this.value = kwargs.value;

  /**
   * @access public
   * @type {TreeNode}
   */
  this.parent = kwargs.parent || null;

  /**
   * @access public
   * @type {TreeNode}
   */
  this.left = kwargs.left || null;

  /**
   * @access public
   * @type {TreeNode}
   */
  this.right = kwargs.right || null;

  /**
   * Successor to current node.
   * @access public
   * @type {TreeNode}
   */
  this.next = kwargs.next || null;

  /**
   * Predecessor to current node.
   * @access public
   * @type {TreeNode}
   */
  this.prev = kwargs.prev || null;
}
