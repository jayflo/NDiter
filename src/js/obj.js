'use strict';

module.exports = (function() {
  return {

    /**
     * Convert an object of key-value pairs into an array of objects, each of
     * which has 'key' and 'value' properties.
     *
     * @param  {object}  obj
     * An object.
     * @param  {string}  [keyKey='key']
     * An optional string to use as the property name for keys.
     * @param  {string}  [valueKey='value']
     * An optional string to use as the property name for values.
     *
     * @return {object[]}
     * One object for each (enumerable) key-value pair in obj (having keyKey and
     * valueKey properties).
     */
    objToArray: _objToArray
  };
})();

function _objToArray(obj, keyKey, valueKey) {
  var tmp, keys = Object.keys(obj), ret = [];

  keyKey = keyKey || 'key';
  valueKey = valueKey || 'value';

  for(var i = 0, len = keys.length; i < len; i++) {
    tmp = {};
    tmp[keyKey] = keys[i];
    tmp[valueKey] = obj[keys[i]];
    ret.push(tmp);
  }

  return ret;
}
