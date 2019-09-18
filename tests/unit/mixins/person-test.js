import EmberObject from '@ember/object';
import MeRouteMixin from 'clubhouse/mixins/route/me';
import { module, skip /* test */ } from 'qunit';

module('Unit | Mixin | person', function() {
  // Replace this with your real tests.
  skip('it works', function(assert) {
    let PersonObject = EmberObject.extend(MeRouteMixin); // eslint-disable-line ember/no-new-mixins
    let subject = PersonObject.create();
    assert.ok(subject);
  });
});
