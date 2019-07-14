import { module, test } from 'qunit';
import {
  visit /*,
  currentURL,
  fillIn,
  click */
} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { Role } from 'clubhouse/constants/roles';

module('Acceptance | admin/positions', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /admin/positions', async function(assert) {
    const person = server.create('person', { roles: [ Role.ADMIN ]});
    await authenticateSession({ person_id: person.id });
    await visit('/admin/positions');
    const numPositions = this.server.schema.positions.all().length;
    assert.dom('.position-line')
      .exists({ count: numPositions }, `should render ${numPositions} lines`);
    assert.equal(document.title, 'Positions | Admin | Ranger Clubhouse');
  });
});
