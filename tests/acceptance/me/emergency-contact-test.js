import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../../helpers/authenticate-user';
import {faker} from '@faker-js/faker';

module('Acceptance | me/emergency contact', function (hooks) {
  setupApplicationTest(hooks);

  test('rendered /me/emergency-contact', async function (assert) {
    const person = this.server.create('person', {
      emergency_contact: faker.random.alphaNumeric(100)
    });

    await authenticateUser(person.id);

    await visit('/me/emergency-contact');

    assert.dom(`[name="emergency_contact"]`).hasValue(person.emergency_contact);
    assert.strictEqual(document.title, 'Emergency contact | Me | Ranger Clubhouse');
  });

  test('update /me/emergency-contact', async function (assert) {
    const person = this.server.create('person', { emergency_contact: '' });

    await authenticateUser(person.id);

    await visit('/me/emergency-contact');

    await fillIn('[name="emergency_contact"]', 'Rampartus Emergencius');
    await click('button.btn-submit');

    person.reload();
    assert.strictEqual(person.emergency_contact, 'Rampartus Emergencius');

    assert.dom('.toast-container', document).includesText('Emergency contact info successfully updated.');
  });
});
