import setCookie from 'clubhouse/utils/set-cookie';
import { module, test } from 'qunit';

module('Unit | Utility | setCookie', function(/*hooks*/) {

  function makeCookieValue() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  test('should set a cookie', function(assert) {
    const cookie = makeCookieValue();

    setCookie('my-cookie', cookie, 1000);
    assert.strictEqual(document.cookie.split(';').filter((item) => item.includes('my-cookie='+cookie)).length, 1);
  });

  test('should delete a cookie', function(assert) {
    const cookie = makeCookieValue();

    setCookie('my-cookie', cookie, 1000);
    setCookie('my-cookie', '', 0);

    assert.strictEqual(document.cookie.split(';').filter((item) => item.includes('my-cookie')).length, 0);
  });

});
