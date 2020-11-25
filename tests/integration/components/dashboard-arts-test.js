import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-arts', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('step', {  });
    await render(hbs`<DashboardArts @step={{this.step}}/>`);
    assert.dom('div.dashboard-art-table').exists();
  });
});
