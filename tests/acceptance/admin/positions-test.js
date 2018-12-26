import { module, test } from 'qunit';
import {
  visit /*,
  currentURL,
  fillIn,
  click */
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | admin/positions', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /admin/positions', async function(assert) {
    await authenticateSession({ person_id: 1 });
    await visit('/admin/positions');
    assert.dom('.position-line').exists({ count: 4 }, 'should render 4 lines');
  });
});
