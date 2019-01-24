import { module, test } from 'qunit';
import { visit, fillIn, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';

module('Acceptance | me/emergency contact', function(hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({ person_id: 1 });
  });


  test('rendered /me/emergency-contact', async function(assert) {
    const person = this.server.schema.people.find(1);
    await visit('/me/emergency-contact');

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

    fields.forEach((field) => {
      assert.dom(`[name="${field}"]`).hasValue(person[field]);
    });
  });

  test('update /me/emergency-contact', async function(assert) {
    await visit('/me/emergency-contact');


    await fillIn('[name="em_first_name"]', 'Rampartus');
    await fillIn('[name="em_last_name"]', 'Emergencius');
    await click('button.btn-submit');

    const person = this.server.schema.people.find(1);
    assert.equal(person.em_first_name, 'Rampartus');
    assert.equal(person.em_last_name, 'Emergencius');

    assert.dom('#toast-container', document).includesText('Emergency contact info has been succesfully updated');
  });
});
