'use strict';

module.exports = (function() {
  return {
    get: function(kwargs) {
      return new Heap(kwargs);
    },

    ctor: Heap
  };
})();

function Heap(kwargs) {
  this._nodes = kwargs.nodes || [];
  this._gt = kwargs.gt || _gt;
  this._size = this._nodes.length;

  _buildHeap(this);
}

Heap.prototype.extractHead = function() {
  if(this._size < 0) {
    return null;
  }

  var head = this._nodes[0];

  this._nodes[0] = this._nodes[this._size];
  this._size--;
  _heapify(this, 0);

  return head;
};

Heap.prototype.head = function() {
  return this._size > 0 ? this._nodes[0] : null;
};

function _buildHeap(hp) {
  var i = hp._size / 2;

  while(i-- > 0) {
    _heapify(hp, i);
  }
}

function _heapify(hp, i) {
  var l = _left(i), r = _right(i),
    max = l <= hp._size && hp._gt(hp._nodes[l], max) ? l : i;

  max = r <= hp._size && hp._gt(hp._nodes[r], max) ? r : max;

  if(max !== i) {
    _swap(hp._nodes, i, max);
    _heapify(hp, max);
  }
}

function _swap(arr, i, j) {
  var tmp = arr[i];

  arr[i] = arr[j];
  arr[j] = tmp;
}

function _gt(a, b) {
  return a > b;
}

function _left(i) {
  return 2 * i + 1;
}

function _right(i) {
  return 2 * i + 2;
}

function _parent(i) {
  return i / 2;
}
