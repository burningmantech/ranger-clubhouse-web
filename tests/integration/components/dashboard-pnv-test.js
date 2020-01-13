import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-pnv', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { });
    this.set('milestones', { training: { status: 'pending' }, alpha_shift: { status: 'pending' }});
    this.set('photo', { });
    await render(hbs`<DashboardPnv @milestones={{this.milestones}} @person={{this.person}} @photo={{this.photo}} />`);

    assert.dom('#hello-ranger').exists();
  });
});
