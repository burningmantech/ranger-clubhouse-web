import EmberObject from '@ember/object';
// eslint-disable-next-line ember/no-mixins
import ModelsPersonMixin from 'clubhouse/mixins/models/person';
import { module, skip /* test */ } from 'qunit';

module('Unit | Mixin | models/person', function() {
  // Replace this with your real tests.
  skip('it works', function (assert) {
    let ModelsPersonObject = EmberObject.extend(ModelsPersonMixin); // eslint-disable-line ember/no-new-mixins
    let subject = ModelsPersonObject.create();
    assert.ok(subject);
  });
});
