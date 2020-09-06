import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-step', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('step', { result: 'completed', name: 'Do This Step', message: 'You did the thing'});
    await render(hbs`<DashboardStep @step={{this.step}} @isActive={{true}} />`);
    assert.dom('.dashboard-step-row').hasClass('dashboard-step-active').exists();
    assert.dom('.dashboard-step-title').hasText('Do This Step');
    assert.dom('.dashboard-step-description').hasText('Completed. You did the thing');
   });
});
