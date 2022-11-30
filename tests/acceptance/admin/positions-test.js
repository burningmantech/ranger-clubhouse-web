import { module, test } from 'qunit';
import {visit} from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { Role } from 'clubhouse/constants/roles';
import { authenticateUser } from '../../helpers/authenticate-user';

module('Acceptance | admin/positions', function(hooks) {
  setupApplicationTest(hooks);

  test('visiting /admin/positions!', async function(assert) {
    const person = this.server.create('person', { roles: [ Role.ADMIN ]});
    await authenticateUser(person.id);
    await visit('/admin/positions');
    const numPositions = this.server.schema.positions.all().length;
    assert.dom('.position-line').exists({ count: numPositions }, `should render ${numPositions} lines`);
  });
});
