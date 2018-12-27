import _ from 'lodash';

/**
 * QUnit assertion to check if a string, array, or object is empty.
 * Strings are only empty if they have no characters; whitespace does
 * not count as empty.
 * Arrays and arraylike objects are empty if they have 0 length.
 * Non-arraylike objects are empty if they have no own properties.
 * Booleans and numbers are not empty (including 0/false).
 * undefined and null are empty.
 *
 * assert.empty(null); // true
 * assert.empty(undefined); // true
 * assert.empty(true); // false
 * assert.empty(false); // false
 * assert.empty(1); // false
 * assert.empty(0); // false
 * assert.empty(''); // true
 * assert.empty('word'); // false
 * assert.empty(' '); // false
 * assert.empty([]); // true
 * assert.empty([0]); // false
 * assert.empty({}); // true
 * assert.empty({foo: null}); // false
 * (function() { assert.empty(arguments); })(); // true
 * (function() { assert.empty(arguments); })('foo'); // false
 */
export default function(context, actual, message) {
  let result, expected;
  switch (typeof actual) {
    case 'undefined':
      message = message || 'undefined is empty';
      result = actual === undefined;
      expected = undefined;
      break;
    case 'string':
      message = message || 'string should be empty';
      result = actual === '';
      expected = '';
      break;
    case 'object':
      if (_.isArray(actual)) {
        message = message || 'array should be empty';
        expected = [];
      } else if (_.isArrayLike(actual)) {
        message = message || 'arraylike should be empty';
        expected = [];
      } else {
        message = message || 'object should be empty'
        expected = {};
      }
      result = _.isEmpty(actual);
      break;
    default:
      expected = `WARNING: ${typeof actual} values are never empty`;
      message = message || expected;
      result = false;
  }
  this.pushResult({result, actual, expected, message});
}
