import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateUser } from '../../helpers/authenticate-user';

// Deterministic values so persistence assertions are exact rather than
// comparing against a random string generated at test time.
const EXISTING_CONTACT = 'Pat Doe, sibling, 555-0100, pat@example.com';
const UPDATED_CONTACT = 'Rampartus Emergencius, friend, 555-0199, ramp@example.com';

module('Acceptance | me/emergency contact', function (hooks) {
  setupApplicationTest(hooks);

  test('rendered /me/emergency-contact', async function (assert) {
    const person = this.server.create('person', {
      emergency_contact: EXISTING_CONTACT
    });

    await authenticateUser(person.id);

    await visit('/me/emergency-contact');

    assert.dom(`[name="emergency_contact"]`).hasValue(person.emergency_contact);
    assert.strictEqual(document.title, 'Emergency contact | Me | Ranger Clubhouse');
  });

  test('update /me/emergency-contact persists and shows the saved state', async function (assert) {
    const person = this.server.create('person', { emergency_contact: '' });

    await authenticateUser(person.id);

    await visit('/me/emergency-contact');

    await fillIn('[name="emergency_contact"]', UPDATED_CONTACT);
    await click('button.btn-submit');

    // Authoritative persistence check: the Mirage-backed record now holds the
    // value the API received from model.save().
    person.reload();
    assert.strictEqual(person.emergency_contact, UPDATED_CONTACT,
      'the new contact info is persisted to the backend record');

    // User-visible confirmation: the component flips on its saved-state check
    // mark. This is asserted instead of (only) the transient toast to avoid
    // toast-timer flakiness.
    assert.dom('[data-test-saved]').exists('the saved-state indicator is shown after a successful save');

    // The field still reflects the saved value after the round-trip.
    assert.dom('[name="emergency_contact"]').hasValue(UPDATED_CONTACT);
  });
});
