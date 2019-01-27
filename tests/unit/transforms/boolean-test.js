import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | boolean', function(hooks) {
  setupTest(hooks);

  test('it works', function(assert) {
    let transform = this.owner.lookup('transform:boolean');
    assert.ok(transform);

    assert.equal(transform.serialize("false"), false);
    assert.equal(transform.serialize(false), false);

    assert.equal(transform.serialize("true"), true);
    assert.equal(transform.serialize(true), true);
  });
});
