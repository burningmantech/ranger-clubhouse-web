import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../../helpers/authenticate-user';

module('Acceptance | me/personal info', function(hooks) {
  setupApplicationTest(hooks);

  test('update /me/personal-info', async function(assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);

    const newName = 'my new name';
    await visit('/me/personal-info');
    await click('#section-general button');
    await fillIn('[name="first_name"]', newName);
    await click('button.btn-submit');

    person.reload();
    assert.strictEqual(person.first_name, newName);
  });

  test('prevent space from being enter in email', async function(assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);

    const newEmail = 'another@example.com';
    await visit('/me/personal-info');
    await click('#section-contact button');
    await fillIn('[name="email"]', newEmail+' ');
    assert.dom('[name="email"]').hasValue(newEmail);
  });
});
