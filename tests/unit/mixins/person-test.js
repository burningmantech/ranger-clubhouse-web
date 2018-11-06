import EmberObject from '@ember/object';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import { module, test } from 'qunit';

module('Unit | Mixin | person', function() {
  // Replace this with your real tests.
  test('it works', function(assert) {
    let PersonObject = EmberObject.extend(MeRouteMixin);
    let subject = PersonObject.create();
    assert.ok(subject);
  });
});
