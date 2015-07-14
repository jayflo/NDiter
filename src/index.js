'use strict';

var ostree = require('./class/ostree.js');

var tree,
  minKey = 1,
  size = 100,
  maxKey = size,
  keyArr = [];

for(var i = 1; i < size + 1; i ++) {
  keyArr.push({ key: i });
}

tree = ostree.get({ nodes: keyArr });
tree.delete(tree.minimum);
