import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | timesheet-summary', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('summary', {});
    await render(hbs`<TimesheetSummary @summary={{summary}} />`);

    assert.dom('table').exists();
  });
});
