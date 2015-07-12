'use strict';

module.exports = (function() {

  return {
    binarySearch: binarySearch
  };

})();

function binarySearch(arr, key, a, b) {
  var mid;

  while(b >= a) {
    mid = a + ((b - a) / 2);

    if(a === arr[mid]) {
      return mid;
    } else if(arr[mid] < key) {
      a = mid + 1;
    } else {
      b = mid - 1;
    }
  }

  return -1;
}
