import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch-alert', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders type warning', async function(assert) {
    // Template block usage:
    await render(hbs`
      {{#ch-alert "warning"}}
        template block text
      {{/ch-alert}}
    `);

    assert.dom(this.element).includesText('template block text');
    assert.dom('div.alert.alert-warning').exists();
  });

  test('it renders type danger', async function(assert) {
    // Template block usage:
    await render(hbs`
      {{#ch-alert "danger"}}
        template block text
      {{/ch-alert}}
    `);

    assert.dom('div.alert.alert-danger').exists();
  });

});
