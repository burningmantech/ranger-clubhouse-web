import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../../helpers/authenticate-user';

module('Acceptance | me/personal info', function(hooks) {
  setupApplicationTest(hooks);

  test('rendered /me/personal-info', async function(assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id)
    await visit('/me/personal-info');
    assert.equal(document.title, 'Personal info | Me | Ranger Clubhouse');

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
    const person = this.server.create('person');
    await authenticateUser(person.id);

    const newEmail = 'another@example.com';
    await visit('/me/personal-info');
    await fillIn('[name="email"]', newEmail);
    await click('button.btn-submit');
    assert.dom('.toast-container', document).includesText('Your personal information was successfully updated');

    person.reload();
    assert.equal(person.email, newEmail);
    assert.true(person.has_reviewed_pi);
  });

  test('prevent space from being enter in email', async function(assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);

    const newEmail = 'another@example.com';
    await visit('/me/personal-info');
    await fillIn('[name="email"]', newEmail+' ');
    assert.dom('[name="email"]').hasValue(newEmail);
  });
});
