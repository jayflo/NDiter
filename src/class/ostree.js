'use strict';

/**
 * @module ostree
 */

var treeNode = require('./treenode.js'),
  traverse = require('./traverse.js');

module.exports = (function() {
  return {
    /**
     * Getter for OSTree class.
     * @see {@link module:ostree~OSTree}
     *
     * @param  {object}  kwargs
     * See {@link module:ostree~OSTree}
     *
     * @return {OSTree}
     */
    get: function(kwargs) {
      return new OSTree(kwargs || {});
    },

    /**
     * @see {@link module:ostree~OSTree}
     * @function
     */
    ctor: OSTree
  };
})();

/**
 * @readonly
 * @enum {number}
 */
var COLOR = { red: 0, black: 1 };

/**
 * An augmented red-black tree that supports the following operations:
 *
 * - Search, Insert, Delete: O(log(n))
 *
 * - Minimum, Maximum, Successor, Predecessor: O(1)
 *
 * - Rank, WeightedRank: O(log(n))
 *
 * @class
 *
 * @param {object}  kwargs
 * @param {(object|object[])}  kwargs.nodes
 * An object or array of objects used to intialize nodes of the tree.  See
 * {@link OSTree~add}.
 */
function OSTree(kwargs) {
  /**
   * "Nil" node for tree.
   * @access private
   * @type {TreeNode}
   */
  this._SENTINEL_ = _getSentinel();

  /**
   * Node with minimum TreeNode.key.
   * @access public
   * @type {TreeNode}
   */
  this.minimum = this._SENTINEL_;

  /**
   * Node with maximum TreeNode.key.
   * @access public
   * @type {object}
   */
  this.maximum = this._SENTINEL_;

  /**
   * Root node of tree.
   * @access private
   * @type {TreeNode}
   */
  this.root = this._SENTINEL_;

  if(kwargs.nodes) {
    kwargs.nodes = Array.isArray(kwargs.nodes) ? kwargs.nodes : [kwargs.nodes];

    for(var i = 0, len = kwargs.nodes.length; i < len; i++) {
      this.add(kwargs.nodes[i]);
    }
  }
}

/**
 * Create a node (which is not added to the tree).
 *
 * @param  {(string|number|object)} keyObj
 * An object with key, value and weight properties or an element corresponding
 * to the key.
 * @param  {anything} [value=key]
 * The nodes value.
 * @param  {number} [weight=1]
 * Used for selecting nodes from the tree non-uniformly.  The higher a node's
 * weight, the more likely it is to be selected.  See
 * {@link module:ostree~OSTree~weightSelect}.
 * @return {TreeNode}
 * A TreeNode decorated with additional properties used to computing rank and
 * weighted rank.
 */
OSTree.prototype.Node = function(keyObj, value, weight) {
  var n, key;

  if(keyObj.hasOwnProperty('key')) {
    key = keyObj.key;
    value = keyObj.value !== undefined ? keyObj.value : value;
    weight = typeof keyObj.weight === 'number' ? keyObj.weight : weight;
  } else {
    key = keyObj;
  }

  if(value === undefined) {
    value = key;
  }

  n = treeNode.get({
    key: key,
    value: value,
    left: this._SENTINEL_,
    right: this._SENTINEL_,
    next: this._SENTINEL_,
    prev: this._SENTINEL_
  });

  n.color = COLOR.red;
  _osNodeDefaults(n, weight);

  return n;
};

/**
 * Public way to check if node is the sentinel node.
 *
 * @param  {TreeNode} node
 *
 * @return {boolean}
 * true when node is sentinel.
 */
OSTree.prototype.isNil = function(node) {
  return node === this._SENTINEL_;
};

/**
 * Combines OSTree.Node with OSTree.insert.
 *
 * @param  {(Comparable|object)} keyObj
 * See OSTree.Node
 * @param  {anything} value
 * See OSTree.Node
 * @param  {number} weight
 * See OSTree.Node
 *
 * @return {TreeNode}
 */
OSTree.prototype.add = function(keyObj, value, weight) {
  var m = this.Node(keyObj, value, weight);

  this.insert(m);

  return m;
};

/**
 * Return node with specified key.
 *
 * @param  {Comparable} key
 *
 * @return {(TreeNode|null)}
 */
OSTree.prototype.search = function(key) {
  var node = this.root;

  while(node !== this._SENTINEL_ && node.key !== key) {
    node = key < node.key ? node.left : node.right;
  }

  return node !== this._SENTINEL_ ? node : null;
};

/**
 * Insert a node into the tree.
 *
 * @param  {TreeNode} node
 *
 * @return {nothing}
 */
OSTree.prototype.insert = function(node) {
  var l, m = this._SENTINEL_, n = this.root;

  while(n !== this._SENTINEL_) {
    _statFixupDesc(n, node);
    m = n;
    n = node.key < n.key ? n.left : n.right;
  }

  node.parent = m;

  if(m === this._SENTINEL_) {
    this.root = node;
  } else {
    if (node.key === m.key) {
      l = Math.round(Math.random()) === 0;
    }

    if (node.key < m.key || l) {
      m.left = node;
    } else {
      m.right = node;
    }

    _setNextPrev(m, node);
  }

  node.left = this._SENTINEL_;
  node.right = this._SENTINEL_;
  node.color = COLOR.red;
  _setStats(node);
  _fixupMinMaxInsert(this, node);
  _insertFixup(this, node);
};

/**
 * Delete a node from the tree.
 *
 * @param  {TreeNode} node
 *
 * @return {nothing}
 */
OSTree.prototype.delete = function(node) {
  var m, n = node, nColor = n.color;

  if(node.left === this._SENTINEL_) {
    m = node.right;
    _transplant(this, node, node.right);
  } else if(node.right === this._SENTINEL_) {
    m = node.left;
    _transplant(this, node, node.left);
  } else {
    n = this.minAtNode(node.right);
    nColor = n.color;
    m = n.right;

    if(n.parent === node) {
      m.parent = n;
    } else {
      _transplant(this, n, n.right);
      n.right = node.right;
      n.right.parent = n;
    }

    _transplant(this, node, n);
    n.left = node.left;
    n.left.parent = n;
    n.color = node.color;
  }

  _fixupNextPrev(this, node);
  _fixupMinMaxDelete(this, node);
  _deleteFixup(this, m, nColor === COLOR.black);
};

/**
 * Find TreeNode with minimum key in subtree rooted at node.
 *
 * @param  {TreeNode} node
 * Root of subtree
 *
 * @return {TreeNode}
 * Node with minimum key.
 */
OSTree.prototype.minAtNode = function(node) {
  if(!node) {
    return null;
  }

  while(node.left !== this._SENTINEL_) {
    node = node.left;
  }

  return node;
};

/**
 * Find TreeNode with maximum key in subtree rooted at node.
 *
 * @param  {TreeNode} node
 * Root of subtree
 *
 * @return {TreeNode}
 * Node with maximum key.
 */
OSTree.prototype.maxAtNode = function(node) {
  if(!node) {
    return null;
  }

  while(node.right !== this._SENTINEL_) {
    node = node.right;
  }

  return node;
};

/**
 * Get node with specified rank (when ordered w.r.t. keys).
 *
 * @param  {integer} i
 * Desired rank.
 *
 * @return {(TreeNode|null)}
 * Node with rank i.
 */
OSTree.prototype.rankSelect = function(i) {
  var rank, node = this.root;

  while(node !== this._SENTINEL_) {
    rank = node.left.size + 1;

    if(i === rank) {
      return node;
    } else if(i < rank) {
      node = node.left;
    } else {
      node = node.right;
      i -= rank;
    }
  }

  return null;
};

/**
 * Similar to OSTree.rankSelect except that TreeNode.weight values are used to
 * compute a weighted rank.  Used to select TreeNodes from OSTree non-uniformly.
 *
 * @param  {number} wRank
 * A value in the interval [0, OSTree.totalWeight()]
 *
 * @return {(TreeNode|null)}
 * The TreeNode whose "rank interval" contains wRank.
 */
OSTree.prototype.weightSelect = function(wRank) {
  var weightL, weightR, node = this.root;

  while(node !== this._SENTINEL_) {
    weightL = node.left.totalWeight;
    weightR = weightL + node.weight;

    if(weightL < wRank && wRank <= weightR) {
      return node;
    } else if(wRank < weightL) {
      node = node.left;
    } else {
      node = node.right;
      wRank -= weightR;
    }
  }

  return null;
};

/**
 * @return {integer}
 * Total number of nodes in the tree.
 */
OSTree.prototype.count = function() {
  return this.root.size;
};

/**
 * @return {number}
 * Total weight of nodes in tree.
 */
OSTree.prototype.totalWeight = function() {
  return this.root.totalWeight;
};

/**
 * Executes `fn` for every TreeNode between `node` and OSTree.root, inclusively.
 *
 * @param  {TreeNode}   node
 * A node in the tree.
 * @param  {Function} fn
 * Callback function to execute on every node.
 *
 * @return {nothing}
 */
OSTree.prototype.forBranch = function(node, fn) {
  while(node !== this._SENTINEL_) {
    fn(node);
    node = node.parent;
  }
};

/**
 * Obtain an iterator that iterates over every node in key sorted order.
 * @see {@link module:traverse~Iter}
 *
 * @return {Iter}
 */
OSTree.prototype.iterator = function(ccb) {
  var args = {
    first: { next: this.minimum },
    hasNext: function(curr) {
      return curr.next !== this._SENTINEL_;
    },
    next: function(curr) {
      return curr.next;
    }
  };

  if(ccb) {
    args.clean = ccb;
  }

  return traverse.iterator(args, this);
};


function _osNodeDefaults(node, weight) {
  node.size = 0;
  node.weight = typeof weight !== 'number' ? 1 : weight;
  node.totalWeight = node.weight;
}

function _getSentinel() {
  var s = treeNode.get({
    key: null,
    value: null
  });

  s.parent = s;
  s.left = s;
  s.right = s;
  s.next = s;
  s.prev = s;
  s.color = COLOR.black;
  _osNodeDefaults(s, 0);

  return s;
}

function _leftRotate(tree, node) {
  var m = node.right;

  node.right = m.left;

  if(m.left !== tree._SENTINEL_) {
    m.left.parent = node;
  }

  m.parent = node.parent;

  if(node.parent === tree._SENTINEL_) {
    tree.root = m;
  } else if (node === node.parent.left) {
    node.parent.left = m;
  } else {
    node.parent.right = m;
  }

  m.left = node;
  node.parent = m;
  _statFixupRotate(m, node);
}

function _rightRotate(tree, node) {
 var m = node.left;

 node.left = m.right;

 if(m.right !== tree._SENTINEL_) {
   m.right.parent = node;
 }

 m.parent = node.parent;

 if(node.parent === tree._SENTINEL_) {
   tree.root = m;
 } else if(node === node.parent.right) {
   node.parent.right = m;
 } else {
   node.parent.left = m;
 }

 m.right = node;
 node.parent = m;
 _statFixupRotate(m, node);
}

function _insertFixup(tree, node) {
  var m;

  while(node.parent.color === COLOR.red) {
    if(node.parent === node.parent.parent.left) {
      m = node.parent.parent.right;

      if(m.color === COLOR.red) {
        node.parent.color = COLOR.black;
        m.color = COLOR.black;
        node.parent.parent.color = COLOR.red;
        node = node.parent.parent;
      } else {
        if(node === node.parent.right) {
          node = node.parent;
          _leftRotate(tree, node);
        }

        node.parent.color = COLOR.black;
        node.parent.parent.color = COLOR.red;
        _rightRotate(tree, node.parent.parent);
      }
    } else {
      m = node.parent.parent.left;

      if(m.color === COLOR.red) {
        node.parent.color = COLOR.black;
        m.color = COLOR.black;
        node.parent.parent.color = COLOR.red;
        node = node.parent.parent;
      } else {
        if(node === node.parent.left) {
          node = node.parent;
          _rightRotate(tree, node);
        }

        node.parent.color = COLOR.black;
        node.parent.parent.color = COLOR.red;
        _leftRotate(tree, node.parent.parent);
      }
    }
  }

  tree.root.color = COLOR.black;
}

function _deleteFixup(tree, node, fixupColor) {
  var isBlack, foundRed = false;

  while(node !== tree.root) {
    isBlack = node.color === COLOR.black;

    if(node !== tree._SENTINEL_) {
      _setStats(node);
    }

    if(fixupColor) {
      if(isBlack && !foundRed) {
        _colorFixup(tree, node);
      } else if(!isBlack && !foundRed) {
        node.color = COLOR.back;
        foundRed = true;
      }
    }

    node = node.parent;
  }

  _setStats(node);

  if(!foundRed) {
    node.color = COLOR.black;
  }
}

function _colorFixup(tree, node) {
  var m;

  if(node === node.parent.left) {
    m = node.parent.right;

    if(m.color === COLOR.red) {
      m.color = COLOR.black;
      node.parent.color = COLOR.red;
      _leftRotate(tree, node.parent);
      m = node.parent.right;
    }

    if(m.left.color === COLOR.black && m.right.color === COLOR.black) {
      m.color = COLOR.red;
      node = node.parent;
    } else {
      if(m.right.color === COLOR.black) {
        m.left.color = COLOR.black;
        m.color = COLOR.red;
        _rightRotate(tree, m);
        m = node.parent.right;
      }

      m.color = node.parent.color;
      node.parent.color = COLOR.black;
      m.right.color = COLOR.black;
      _leftRotate(tree, node.parent);
      node = tree.root;
    }
  } else {
    m = node.parent.left;

    if(m.color === COLOR.red) {
      m.color = COLOR.black;
      node.parent.color = COLOR.red;
      _rightRotate(tree, node.parent);
      m = node.parent.left;
    }

    if(m.right.color === COLOR.black && m.left.color === COLOR.black) {
      m.color = COLOR.red;
      node = node.parent;
    } else {
      if(m.left.color === COLOR.black) {
        m.right.color = COLOR.black;
        m.color = COLOR.red;
        _leftRotate(tree, m);
        m = node.parent.left;
      }

      m.color = node.parent.color;
      node.parent.color = COLOR.black;
      m.left.color = COLOR.black;
      _rightRotate(tree, node.parent);
      node = tree.root;
    }
  }

  return node;
}

function _statFixupDesc(m, n) {
  m.totalWeight += n.totalWeight;
  m.size += 1;
}

function _setStats(n) {
  n.size = n.left.size + n.right.size + 1;
  n.totalWeight = n.left.totalWeight + n.right.totalWeight + n.weight;
}

function _statFixupRotate(p, m) {
  _setStats(m);
  _setStats(p);
}

function _fixupMinMaxInsert(tree, node) {
  if((node.parent === tree.minimum && node === node.parent.left) || tree.minimum === tree._SENTINEL_) {
    tree.minimum = node;
  }

  if((node.parent === tree.maximum && node === node.parent.right) || tree.maximum === tree._SENTINEL_) {
    tree.maximum = node;
  }
}

function _fixupMinMaxDelete(tree, node) {
  if(node === tree.minimum) {
    tree.minimum = node.right === tree._SENTINEL_ ? node.parent : tree.minAtNode(node.right);
  }

  if(node === tree.maximum) {
    tree.maximum = node.left === tree._SENTINEL_ ? node.parent : tree.maxAtNode(node.left);
  }
}

function _transplant(tree, m, n) {
  if(m.parent === tree._SENTINEL_) {
    tree.root = n;
  } else if(m === m.parent.left) {
    m.parent.left = n;
  } else {
    m.parent.right = n;
  }

  n.parent = m.parent;
}

function _fixupNextPrev(tree, m) {
  if(m.next !== tree._SENTINEL_) {
    m.next.prev = m.prev;
  }

  if(m.prev !== tree._SENTINEL_) {
    m.prev.next = m.next;
  }
}

function _setNextPrev(p, node) {
  if(node === p.left) {
    p.prev.next = node;
    node.prev = p.prev;
    node.next = p;
    p.prev = node;
  } else {
    p.next.prev = node;
    node.next = p.next;
    node.prev = p;
    p.next = node;
  }
}
