import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | personal info', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({ person_id: 1 });
  });

  test('rendered /me/personal-info', async function(assert) {
    await visit('/me/personal-info');

    const person = this.server.schema.people.find(1);

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
    const newEmail = 'another@example.com';
    await visit('/me/personal-info');


    await fillIn('[name="email"]', newEmail);
    await click('button.btn-submit');
    const person = this.server.schema.people.find(1);

    assert.equal(person.email, newEmail);

    assert.dom('#toast-container', document).includesText('Your personal information was successfully updated');
  });
});
