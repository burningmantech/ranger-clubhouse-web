import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-motd', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('motds', [
      {
        subject: 'RTFM',
        message: "Read the Ranger Manual!",
        has_read: false,
        created_at: '2020-08-25 12:34:56'
      }
    ]);
    await render(hbs`<DashboardMotd @motds={{this.motds}}/>`);

    assert.dom('.dashboard-step-title a').exists().hasText(/RTFM/);
    assert.dom('.dashboard-step-description').exists().hasText(/Read the Ranger Manual/);
  });
});
