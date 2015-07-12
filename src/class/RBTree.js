'use strict';

var assert = require('assert'),
  TreeNode = require('./TreeNode.js');

var COLOR = { red: 0, black: 1 };

// Cormen, pg. 308.
function RBTree(kwargs) {
  assert(typeof kwargs.hash === 'function', 'RBTree.hash must be of type function.');

  this.hash = kwargs.hash;
  this.root = kwargs.root ? kwargs.root :
    kwargs.rootValue ? this.Node(kwargs.rootValue) :
    undefined;
}

var _SENTINEL =  TreeNode.get({
  key: null,
  value: null
});

_SENTINEL.color = COLOR.black;
_SENTINEL.parent = _SENTINEL;
_SENTINEL.left = _SENTINEL;
_SENTINEL.right = _SENTINEL;

/**
 * Public
 */

RBTree.prototype.Node = function(value) {
  var n, key = this.hash(value);

  assert(key !== null, 'Invalid node key.');

  n = TreeNode.get({ key: key, value: value });
  n.color = COLOR.red;

  return n;
};

RBTree.prototype.search = function(key) {
  var m = _search(this.root, key);

  return m !== _SENTINEL ? m : null;
};

RBTree.prototype.insert = function(node) {
  assert(node, 'Node cannot be null or undefined.');

  var m = _SENTINEL, n = this.root;

  node.owner = this;

  while(n !== _SENTINEL) {
    m = n;
    n = node.key < n.key ? n.left : n.right;
  }

  node.parent = m;

  if(m === _SENTINEL) {
    this.root = node;
  } else if(node.key < m.key) {
    m.left = node;
  } else {
    m.right = node;
  }

  node.left = _SENTINEL;
  node.right = _SENTINEL;
  node.color = COLOR.red;
  _insertFixup(this, node);
};

RBTree.prototype.delete = function(node) {
  assert(node, 'Node cannot be null or undefined.');

  var m, n = node, nColor = n.color;

  node.owner = null;

  if(node.left === _SENTINEL) {
    m = node.right;
    _transplant(this, node, node.right);
  } else if(node.right === _SENTINEL) {
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

  if(nColor === COLOR.black) {
    _deleteFixup(this, m);
  }
};

RBTree.prototype.min = function() {
  return this.minAtNode(this.root);
};

RBTree.prototype.max = function() {
  return this.maxAtNode(this.root);
};

RBTree.prototype.minAtNode = function(node) {
  if(!node) {
    return null;
  }

  while(node.left !== _SENTINEL) {
    node = node.left;
  }

  return node;
};

RBTree.prototype.maxAtNode = function(node) {
  if(!node) {
    return null;
  }

  while(node.right !== _SENTINEL) {
    node = node.right;
  }

  return node;
};

RBTree.prototype.predecessor = function(node) {
  if(!node) {
    return null;
  }

  if(node.left !== _SENTINEL) {
    return this.maxAtNode(node.left);
  }

  var m = node.parent;

  while(m !== _SENTINEL && node === m.left) {
    node = m;
    m = m.parent;
  }

  return m;
};

RBTree.prototype.successor = function(node) {
  if(!node) {
    return null;
  }

  if(node.right !== _SENTINEL) {
    return this.minAtNode(node.right);
  }

  var m = node.parent;

  while(m !== _SENTINEL && node === m.right) {
    node = m;
    m = m.parent;
  }

  return m;
};

/**
 * Exports
 */

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new RBTree(kwargs);
    }
  };
})();

/**
 * Private
 */

function _search(node, key) {
  while(node !== _SENTINEL && node.key !== key) {
    node = key < node.key ? node.left : node.right;
  }

  return node;
}

function _leftRotate(tree, node) {
  var m = node.right;

  node.right = m.left;

  if(m.left !== _SENTINEL) {
    m.left.parent = node;
  }

  m.parent = node.parent;

  if(node.parent === _SENTINEL) {
    tree.root = m;
  } else if (node === node.parent.left) {
    node.parent.left = m;
  } else {
    node.parent.right = m;
  }

  m.left = node;
  node.parent = m;
}

function _rightRotate(tree, node) {
 var m = node.left;

 node.left = m.right;

 if(m.right !== _SENTINEL) {
   m.right.parent = node;
 }

 m.parent = node.parent;

 if(node.parent === _SENTINEL) {
   tree.root = m;
 } else if(node === node.parent.right) {
   node.parent.right = m;
 } else {
   node.parent.left = m;
 }

 m.right = node;
 node.parent = m;
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

function _deleteFixup(tree, node) {
  var m;

  while(node !== tree.root && node.color === COLOR.black) {
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
  }

  node.color = COLOR.black;
}

function _transplant(tree, m, n) {
  if(m.parent === _SENTINEL) {
    tree.root = n;
  } else if(m === m.parent.left) {
    m.parent.left = n;
  } else {
    m.parent.right = n;
  }

  n.parent = m.parent;
}
