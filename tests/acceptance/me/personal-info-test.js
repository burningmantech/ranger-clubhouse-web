import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../../helpers/authenticate-user';

const SAVE_CONFIRMATION = 'Your personal information was successfully updated.';

module('Acceptance | me/personal info', function(hooks) {
  setupApplicationTest(hooks);

  test('update /me/personal-info persists and shows the saved value', async function(assert) {
    const person = this.server.create('person');
    await authenticateUser(person.id);

    const newName = 'my new name';
    await visit('/me/personal-info');
    // Open the "Name, Gender, and Pronouns" section for editing.
    await click('#section-general button');
    await fillIn('[name="first_name"]', newName);
    await click('button.btn-submit');

    // Persistence: the backend record was updated by model.save().
    person.reload();
    assert.strictEqual(person.first_name, newName,
      'the new first name is persisted to the backend record');

    // User-visible confirmation toast.
    assert.dom('.toast-container', document).includesText(SAVE_CONFIRMATION,
      'a success toast confirms the save');

    // The section returns to view mode and renders the saved name.
    assert.dom('#section-general').includesText(newName,
      'the section view shows the updated first name');
  });

  test('invalid email is rejected and the section stays in edit mode', async function(assert) {
    const person = this.server.create('person', { email: 'valid@example.com' });
    await authenticateUser(person.id);

    await visit('/me/personal-info');
    // Open the "Contact Information" section, which validates email format.
    await click('#section-contact button');
    await fillIn('[name="email"]', 'not-an-email');
    await click('#section-contact button.btn-submit');

    // The changeset email validation should block the save: the field is still
    // editable (section did not flip back to view mode) and the backend record
    // retains its original, valid email.
    assert.dom('#section-contact [name="email"]').exists(
      'the email field is still editable because the invalid value was rejected');

    person.reload();
    assert.strictEqual(person.email, 'valid@example.com',
      'the invalid email was not persisted to the backend record');
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
