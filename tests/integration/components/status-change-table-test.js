import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | status-change-table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('people', []);
    this.set('newStatus', 'inactive')
    await render(hbs`<StatusChangeTable @people={{this.people}} @newStatus={{this.newStatus}}/>`);

    assert.dom('table').exists();
  });
});
