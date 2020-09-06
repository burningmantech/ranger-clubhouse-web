import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-links', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<DashboardLinks />`);
    assert.dom('div.dashboard-group-title-text').exists().hasText('Links & Things');
  });
});
