import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | person message', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it isDictated works', function(assert) {
    let store = this.owner.lookup('service:store');
    let model = run(() => store.createRecord('person-message', {}));
    assert.ok(model);

    // Test isDictated is true. The creator (who wrote the message)
    // and sender (who actually sent the message) are different.
    run(() => {
      model.set('creator_person_id', 1);
      model.set('sender_person_id', 2);
    });

    assert.true(model.isDictated);

    // Test isDictated is flse for the creator
    // and sender are the same

    run(() => {
      model.set('creator_person_id', 1);
      model.set('sender_person_id', 1);
    });
    assert.false(model.isDictated);
  });
});
