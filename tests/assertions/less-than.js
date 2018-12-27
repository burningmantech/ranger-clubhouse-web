/**
 * QUnit assertion that the actual value is less than some value.
 * assert.lessThan(37, 42);
 * assert.lessThan(actualShouldBeNegative, 0);
 */
export default function(context, actual, expected, message) {
  message = message || `${actual} should be less than ${expected}`;
  let result = actual < expected;
  this.pushResult({result, actual, expected, message});
}
