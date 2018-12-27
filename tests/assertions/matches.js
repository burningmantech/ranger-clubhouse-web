/**
 * QUnit assertion to match a string against a pattern.
 * assert.matches('Hello world', 'world');
 * assert.matches('Hello world', /el{2}/, 'has an E and two Ls');
 */
export default function(context, actual, pattern, message) {
  message = message || `${actual} should match pattern /${pattern}/`;
  let result = actual !== null && actual !== undefined &&
    actual.match(pattern);
  this.pushResult({result, actual, pattern, message});
}
