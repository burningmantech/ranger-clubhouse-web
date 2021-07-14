import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | boolean', function(hooks) {
  setupTest(hooks);

  test('it works', function(assert) {
    let transform = this.owner.lookup('transform:boolean');
    assert.ok(transform);

    assert.false(transform.serialize("false"));
    assert.false(transform.serialize(false));

    assert.true(transform.serialize("true"));
    assert.true(transform.serialize(true));
  });
});
