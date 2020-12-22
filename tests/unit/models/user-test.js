import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';
import User from 'clubhouse/models/user';

module('Unit | Model | user', function (hooks) {
  setupTest(hooks);

  test('hasRole works', function (assert) {
    const user = new User({roles: [1, 2]});

    assert.equal(user.hasRole(1), true);
    assert.equal(user.hasRole(3), false);
  });

  test('hasAllRoles works', function (assert) {
    const user = new User({roles: [1, 2]});

    assert.equal(user.hasAllRoles([1, 2]), true);
    assert.equal(user.hasAllRoles([1, 2, 3]), false);
  });

});
