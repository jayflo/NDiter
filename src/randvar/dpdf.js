'use strict';

var type = require('./type.js'),
  osTree = require('../class/ostree.js'),
  traverse = require('../class/traverse.js');

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new Dpdf(kwargs);
    },

    ctor: Dpdf
  };
})();

function Dpdf(kwargs) {
  this._osTree = osTree.get();
  this._lookup = {};
  this._rng = type.generator('int', 0, this._osTree.totalWeight);

  if(kwargs.outcomes) {
    this.add(kwargs.outcomes);
  }
}

Dpdf.prototype.add = function(keyObj, value, weight) {
  if(keyObj.hasOwnProperty('key')) {
    keyObj = [keyObj];
  } else if(!Array.isArray(keyObj)) {
    keyObj = [{ key: keyObj, value: value, weight: weight }];
  }

  for(var i = 0, len = keyObj.length; i < len; i++) {
    this._lookup[keyObj[i].key] = this._osTree.add(keyObj[i]);
  }
};

Dpdf.prototype.addOrUpdate = function(keyObj, increment) {
  if(this._lookup.hasOwnProperty(keyObj.key)) {
    (increment ? this.increment : this.setWeight)(keyObj.key, keyObj.weight);
  } else {
    this.add(keyObj);
  }
};

Dpdf.prototype.delete = function(key) {
  if(!this._lookup.hasOwnProperty(key)) {
    return false;
  }

  this._osTree.delete(this._lookup[key]);
  delete this._lookup[key];

  return true;
};

Dpdf.prototype.setWeight = function(key, weight) {
  if(!this._lookup.hasOwnProperty(key)) {
    return false;
  }

  var node = this._lookup[key],
    dw = weight - node.weight;

  node.weight = weight;
  this._osTree.forBranch(node, function(n) {
    n.totalWeight += dw;
  });
};

Dpdf.prototype.increment = function(key, dw) {
  if(!this._lookup.hasOwnProperty(key)) {
    return false;
  }

  this.setWeight(this._lookup[key].weight + dw);
};

Dpdf.prototype.poll = function() {
  return this._osTree.weightSelect(this._rng.next());
};

Dpdf.prototype.generator = function() {
  return traverse.generator({
    next: function() {
      return this.poll();
    },
    clean: function(node) {
      return node.value;
    }
  }, this);
};

Dpdf.prototype.outcomeIterator = function() {
  return this._osTree.iterator();
};
