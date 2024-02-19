import { module, test } from 'qunit';
import { setupTest } from 'clubhouse/tests/helpers';

module('Unit | Controller | ops/teams/manage', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let controller = this.owner.lookup('controller:ops/teams/manage');
    assert.ok(controller);
  });
});
