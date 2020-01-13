import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-ranger', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { });
    this.set('milestones', { training: { status: 'pending' }, alpha_shift: { status: 'pending' }});
    this.set('photo', { });
    await render(hbs`<DashboardRanger @milestones={{this.milestones}} @person={{this.person}} @photo={{this.photo}} />`);

    assert.dom('div').hasText("Thank for stopping by. There are a few things to do here:");
  });
});
