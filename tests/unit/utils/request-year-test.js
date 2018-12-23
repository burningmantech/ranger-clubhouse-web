import requestYear from 'clubhouse/utils/request-year';
import { module, test } from 'qunit';

module('Unit | Utility | requestYear', function(/*hooks*/) {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let thisYear = new Date().getFullYear();
    let empty = requestYear({});
    assert.equal(thisYear, empty);
    let specified = requestYear({foo: 'bar', year: '1992'});
    assert.equal(1992, specified);
    let junk = requestYear({year: 'notanumber'});
    assert.equal(thisYear, junk);
  });
});
