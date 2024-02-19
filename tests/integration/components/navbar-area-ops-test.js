import { module, test } from 'qunit';
import { setupRenderingTest } from 'clubhouse/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | navbar-area-ops', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<NavbarAreaOps />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <NavbarAreaOps>
        template block text
      </NavbarAreaOps>
    `);

    assert.dom().hasText('template block text');
  });
});
