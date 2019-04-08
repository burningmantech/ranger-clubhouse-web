import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | me/personal info', function(hooks) {
  setupApplicationTest(hooks);

  test('rendered /me/personal-info', async function(assert) {
    const person = server.create('person');
    await authenticateSession({ person_id: person.id });
    await visit('/me/personal-info');

    const fields = [
      'first_name', 'mi', 'last_name',
      'email', 'home_phone', 'alt_phone', 'gender',
      'camp_location',
      'street1', 'street2', 'apt', 'city', 'state', 'country',
      'teeshirt_size_style', 'longsleeveshirt_size_style'
    ];

    fields.forEach((field) => {
      assert.dom(`[name="${field}"]`).hasValue(person[field]);
    });

  });

  test('update /me/personal-info', async function(assert) {
    const person = server.create('person');
    await authenticateSession({ person_id: person.id });

    const newEmail = 'another@example.com';
    await visit('/me/personal-info');
    await fillIn('[name="email"]', newEmail);
    await click('button.btn-submit');

    person.reload();
    assert.equal(person.email, newEmail);
    assert.dom('#toast-container', document).includesText('Your personal information was successfully updated');
  });

  test('prevent space from being enter in email', async function(assert) {
    const person = server.create('person');
    await authenticateSession({ person_id: person.id });

    const newEmail = 'another@example.com';
    await visit('/me/personal-info');
    await fillIn('[name="email"]', newEmail+' ');
    assert.dom('[name="email"]').hasValue(newEmail);
  });
});
