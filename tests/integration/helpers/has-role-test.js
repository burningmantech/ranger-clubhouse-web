import { module,  test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import SessionService from 'clubhouse/services/session';
import { ADMIN, VC } from 'clubhouse/constants/roles';

class ServiceStub extends SessionService {
  user = { roles: [ ADMIN, VC ]}
}

module('Integration | Helper | has-role', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:session', ServiceStub);
  });

  test('user has the role', async function(assert) {
    await render(hbs`{{if (has-role "admin") "true" "false"}}`);

    assert.dom(this.element).hasText('true');
  });

  test('user does not have the role', async function(assert) {
    await render(hbs`{{if (has-role "manage") "true" "false"}}`);

    assert.dom(this.element).hasText('false');
  });

});
