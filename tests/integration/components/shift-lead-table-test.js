import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | shift-lead-table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('title', 'A Title');
    this.set('people', []);
    await render(hbs`<ShiftLeadTable @title={{this.title}} @people={{this.people}} />`);

    assert.dom('table').exists();
  });
});
