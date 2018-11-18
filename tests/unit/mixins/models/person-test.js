import EmberObject from '@ember/object';
import ModelsPersonMixin from 'clubhouse/mixins/models/person';
import { module, test } from 'qunit';

module('Unit | Mixin | models/person', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ModelsPersonObject = EmberObject.extend(ModelsPersonMixin);
    let subject = ModelsPersonObject.create();
    assert.ok(subject);
  });
});
