import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { faker } from 'ember-cli-mirage';

module('Acceptance | me/emergency contact', function (hooks) {
  setupApplicationTest(hooks);

  test('rendered /me/emergency-contact', async function (assert) {
    const fields = [
      'em_first_name',
      'em_mi',
      'em_last_name',
      'em_handle',

      'em_home_phone',
      'em_alt_phone',
      'em_email',
      'em_camp_location',
    ];
    const data = {};

    fields.forEach((field) => {
      data[field] = faker.random.alphaNumeric(5);
    });
    const person = server.create('person', data);

    await authenticateSession({ person_id: person.id });

    await visit('/me/emergency-contact');

    fields.forEach((field) => {
      assert.dom(`[name="${field}"]`).hasValue(data[field]);
    });
  });

  test('update /me/emergency-contact', async function (assert) {
    const person = server.create('person', {
      em_first_name: 'no first name',
      em_last_name: 'no last name'
    });

    await authenticateSession({ person_id: person.id });

    await visit('/me/emergency-contact');

    await fillIn('[name="em_first_name"]', 'Rampartus');
    await fillIn('[name="em_last_name"]', 'Emergencius');
    await click('button.btn-submit');

    person.reload();
    assert.equal(person.em_first_name, 'Rampartus');
    assert.equal(person.em_last_name, 'Emergencius');

    assert.dom('#toast-container', document).includesText('Emergency contact info has been succesfully updated');
  });
});
