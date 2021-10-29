import requestYear from 'clubhouse/utils/request-year';
import { module, test } from 'qunit';

module('Unit | Utility | requestYear', function(/*hooks*/) {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let thisYear = new Date().getFullYear();
    let empty = requestYear({});
    assert.strictEqual(thisYear, empty);
    let specified = requestYear({foo: 'bar', year: '1992'});
    assert.strictEqual(specified, 1992);
    let junk = requestYear({year: 'notanumber'});
    assert.strictEqual(thisYear, junk);
  });
});
