import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | dashboard-group', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<DashboardGroup />`);

    assert.strictEqual(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      <DashboardGroup>
        template block text
      </DashboardGroup>
    `);

    assert.strictEqual(this.element.textContent.trim(), 'template block text');
  });
});
