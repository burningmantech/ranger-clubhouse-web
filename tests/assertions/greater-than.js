/**
 * QUnit assertion that the actual value is greater than some value.
 * assert.lessThan(42, 37);
 * assert.greaterThan(actualShouldBePositive, 0);
 */
export default function(context, actual, expected, message) {
  message = message || `${actual} should be greater than ${expected}`;
  let result = actual > expected;
  this.pushResult({result, actual, expected, message});
}
