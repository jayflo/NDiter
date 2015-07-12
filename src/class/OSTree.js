'use strict';

var TreeNode = require('./TreeNode.js');

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new OSTree(kwargs);
    },

    ctor: OSTree
  };
})();

var COLOR = { red: 0, black: 1 };

/**
 * Constructor (ref Cormen, pg. 308)
 */

function OSTree(kwargs) {
  this._SENTINEL_ = _getSentinel();
  this.minimum = this._SENTINEL_;
  this.maximum = this._SENTINEL_;
  this.root = kwargs.root === undefined ? this._SENTINEL_ :
    this.add(kwargs.root);
}

/**
 * Prototype
 */

OSTree.prototype.Node = function(keyObj, value, freq) {
  var n, key;

  if(keyObj.hasOwnProperty('key')) {
    key = keyObj.key;
    value = keyObj.value;
    freq = keyObj.freq;
  } else if(value === null || value === undefined) {
    value = keyObj;
  }

  n = TreeNode.get({ key: key, value: value });
  n.color = COLOR.red;
  _osNodeDefaults(n, freq);

  return n;
};

OSTree.prototype.add = function(keyObj, value, freq) {
  var m = this.Node(keyObj, value, freq);

  this.insert(m);

  return m;
};

OSTree.prototype.search = function(key) {
  var node = this.root;

  while(node !== this._SENTINEL_ && node.key !== key) {
    node = key < node.key ? node.left : node.right;
  }

  return node !== this._SENTINEL_ ? node : null;
};

OSTree.prototype.insert = function(node) {
  var m = this._SENTINEL_, n = this.root;

  while(n !== this._SENTINEL_) {
    _statFixupDesc(n, node);
    m = n;
    n = node.key < n.key ? n.left : n.right;
  }

  node.parent = m;

  if(m === this._SENTINEL_) {
    this.root = node;
  } else {
    if(node.key < m.key) {
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

OSTree.prototype.delete = function(node) {
  var m, n = node, nColor = n.color;

  if(node.left === this._SENTINEL_) {
    m = node.right;
    _transplant(this, node, node.right);
    _fixupNextPrev(this, node, node.right);
  } else if(node.right === this._SENTINEL_) {
    m = node.left;
    _transplant(this, node, node.left);
    _fixupNextPrev(this, node, node.left);
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
    _fixupNextPrev(this, node, n);
  }

  _fixupMinMaxDelete(node);
  _deleteFixup(this, m);
};

OSTree.prototype.minAtNode = function(node) {
  if(!node) {
    return null;
  }

  while(node.left !== this._SENTINEL_) {
    node = node.left;
  }

  return node;
};

OSTree.prototype.maxAtNode = function(node) {
  if(!node) {
    return null;
  }

  while(node.right !== this._SENTINEL_) {
    node = node.right;
  }

  return node;
};

OSTree.prototype.rankSelect = function(i) {
  var rank, node = this.root;

  while(node !== this._SENTINEL) {
    rank = node.size;

    if(i === rank) {
      return node;
    }

    node = i < rank ? node.left : node.right;
  }

  return null;
};

OSTree.prototype.freqSelect = function(f) {
  var freqL, freqR, node = this.root;

  while(node !== this._SENTINEL) {
    freqL = node.left.freqSize;
    freqR = freqL + node.freq;

    if(freqL < f && f <= freqR) {
      return node;
    }

    node = f <= freqL ? node.left : node.right;
  }

  return null;
};

/**
 * Private
 */

function _osNodeDefaults(node, freq) {
  node.size = 0;
  node.freq = isNaN(freq) ? 1 : freq;
  node.freqSize = 0;
}

function _getSentinel() {
  var s = TreeNode.get({
    key: null,
    value: null,
    parent: s,
    left: s,
    right: s,
    next: s,
    prev: s
  });

  s.color = COLOR.black;
  _osNodeDefaults(s);
  s.freq = 0;

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

function _deleteFixup(tree, node) {
  var foundRed, setBlack = true;

  while(node !== tree.root) {
    foundRed = node.color === COLOR.red;
    _setStats(node);

    if(!foundRed) {
      _colorFixup(node);
    } else if(foundRed && setBlack) {
      node.color = COLOR.black;
      setBlack = false;
    }
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
}

function _statFixupDesc(m, n) {
  m.freqSize += n.freqSize;
  m.size += 1;
}

function _setStats(n) {
  n.size = n.left.size + n.right.size + 1;
  n.freqSize = n.left.freqSize + n.right.freqSize + n.freqSize;
}

function _statFixupRotate(p, m) {
  _setStats(m);
  _setStats(p);
}

function _fixupMinMaxInsert(tree, node) {
  if(node.parent === tree.minimum && node === node.parent.left) {
    tree.minimum = node;
  } else if(node.parent === tree.maximum && node === node.parent.right) {
    tree.maximum = node;
  }
}

function _fixupMinMaxDelete(tree, node) {
  if(node === tree.minimum) {
    tree.minimum = node.right === tree._SENTINEL_ ? node.parent : tree.minAtNode(node.right);
  } else if(node === tree.maximum) {
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

function _fixupNextPrev(tree, m, n) {
  if(m.right !== tree._SENTINEL_) {
    m.prev.next = n;
    n.prev = m.prev;
  }

  if(m.left !== tree._SENTINEL_) {
    m.next.prev = n;
    n.next = m.next;
  }
}

function _setNextPrev(p, m) {
  if(m === p.left) {
    m.prev = p.prev;
    m.next = p;
    p.prev = m;
  } else {
    m.next = p.next;
    m.prev = p;
    p.next = m;
  }
}
