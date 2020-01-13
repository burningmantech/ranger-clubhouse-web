import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-auditor', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { });
    this.set('milestones', { training: { status: 'pending' }, alpha_shift: { status: 'pending' }});
    await render(hbs`<DashboardAuditor @milestones={{this.milestones}} @person={{this.person}} />`);

    assert.dom('#hello-auditor').exists();
  });
});
