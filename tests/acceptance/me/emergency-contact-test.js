import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import faker from 'faker';

module('Acceptance | me/emergency contact', function (hooks) {
  setupApplicationTest(hooks);

  test('rendered /me/emergency-contact', async function (assert) {
    const person = server.create('person', {
      emergency_contact: faker.random.alphaNumeric(100)
    });

    await authenticateSession({ person_id: person.id });

    await visit('/me/emergency-contact');

    assert.dom(`[name="emergency_contact"]`).hasValue(person.emergency_contact);
  });

  test('update /me/emergency-contact', async function (assert) {
    const person = server.create('person', { emergency_contact: '' });

    await authenticateSession({ person_id: person.id });

    await visit('/me/emergency-contact');

    await fillIn('[name="emergency_contact"]', 'Rampartus Emergencius');
    await click('button.btn-submit');

    person.reload();
    assert.equal(person.emergency_contact, 'Rampartus Emergencius');

    assert.dom('#toast-container', document).includesText('Emergency contact info has been succesfully updated');
  });
});
