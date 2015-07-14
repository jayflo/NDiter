'use strict';

var type = require('./type.js'),
  osTree = require('../class/ostree.js'),
  traverse = require('../class/traverse.js');

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new PDF(kwargs);
    },

    ctor: PDF
  };
})();

function PDF(kwargs) {
  this._osTree = osTree.get();
  this._lookup = {};
  this._rng = type.generator('int', 0, this._osTree.totalFreq);

  if(kwargs.outcomes) {
    this.add(kwargs.outcomes);
  }
}

PDF.prototype.add = function(keyObj, value, freq) {
  if(keyObj.hasOwnProperty('key')) {
    keyObj = [keyObj];
  } else if(!Array.isArray(keyObj)) {
    keyObj = [{ key: keyObj, value: value, freq: freq }];
  }

  for(var i = 0, len = keyObj.length; i < len; i++) {
    this._lookup[keyObj[i].key] = this._osTree.add(keyObj[i]);
  }
};

PDF.prototype.delete = function(key) {
  if(!this._lookup.hasOwnProperty(key)) {
    return false;
  }

  this._osTree.delete(this._lookup[key]);
  delete this._lookup[key];

  return true;
};

PDF.prototype.exec = function() {
  return this._osTree.freqSelect(this._rng.next());
};

PDF.prototype.generator = function() {
  return traverse.generator({
    next: function() {
      return this.exec();
    },
    clean: function(node) {
      return node.value;
    }
  }, this);
};

PDF.prototype.outcomeIterator = function() {
  return this._osTree.iterator();
};
