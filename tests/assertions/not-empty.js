import _ from 'lodash';

/**
 * QUnit assertion to check if a string, array, or object is not empty.
 * Strings are only empty if they have no characters; whitespace does
 * not count as empty.
 * Arrays and arraylike objects are empty if they have 0 length.
 * Non-arraylike objects are empty if they have no own properties.
 * Booleans and numbers are not empty (including 0/false).
 * undefined and null are empty.
 *
 * assert.empty(null); // false
 * assert.empty(undefined); // false
 * assert.empty(true); // true
 * assert.empty(false); // true
 * assert.empty(1); // true
 * assert.empty(0); // true
 * assert.empty(''); // false
 * assert.empty('word'); // true
 * assert.empty(' '); // true
 * assert.empty([]); // false
 * assert.empty([0]); // true
 * assert.empty({}); // false
 * assert.empty({foo: null}); // true
 * (function() { assert.empty(arguments); })(); // false
 * (function() { assert.empty(arguments); })('foo'); // true
 */
export default function(context, actual, message) {
  let result, expected;
  switch (typeof actual) {
    case 'undefined':
      expected = 'undefined is not empty';
      message = message || expected;
      result = actual !== undefined;
      break;
    case 'string':
      message = message || 'string should not be empty';
      result = actual !== '';
      expected = 'non-empty string';
      break;
    case 'object':
      if (_.isArray(actual)) {
        message = message || 'array should not be empty';
        expected = ['non-empty array'];
      } else if (_.isArrayLike(actual)) {
        message = message || 'arraylike should not be empty';
        expected = ['non-empty arraylike'];
      } else {
        message = message || 'object should not be empty'
        expected = {_: 'non-empty object'};
      }
      result = !_.isEmpty(actual);
      break;
    default:
      expected = `WARNING: ${typeof actual} values are never empty`;
      message = message || expected;
      result = true;
  }
  this.pushResult({result, actual, expected, message});
}
