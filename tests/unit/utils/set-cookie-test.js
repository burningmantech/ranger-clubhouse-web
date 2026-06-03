import setCookie from 'clubhouse/utils/set-cookie';
import { module, test } from 'qunit';

const COOKIE_NAME = 'my-cookie';
const COOKIE_VALUE = 'test-value-12345';

function readCookie(name) {
  const match = document.cookie
    .split('; ')
    .map((pair) => pair.split('='))
    .find(([key]) => key === name);

  return match ? match[1] : undefined;
}

module('Unit | Utility | set-cookie', function(hooks) {

  hooks.afterEach(function() {
    // Ensure the cookie never leaks into other tests.
    setCookie(COOKIE_NAME, '', 0);
  });

  test('it sets a cookie with the exact name and value', function(assert) {
    setCookie(COOKIE_NAME, COOKIE_VALUE, 1000);

    assert.strictEqual(readCookie(COOKIE_NAME), COOKIE_VALUE);
  });

  test('it deletes a cookie when the expiry is zero', function(assert) {
    setCookie(COOKIE_NAME, COOKIE_VALUE, 1000);
    assert.strictEqual(readCookie(COOKIE_NAME), COOKIE_VALUE, 'cookie is set first');

    setCookie(COOKIE_NAME, '', 0);
    assert.strictEqual(readCookie(COOKIE_NAME), undefined, 'cookie is removed');
  });
});
