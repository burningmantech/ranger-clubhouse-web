import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | print-instruction', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('backAction', () => { });
    this.set('backLabel', 'Baby Got Back');

    await render(hbs`{{print-instruction backAction=backAction backLabel=backLabel}}`);
    assert.dom('div').exists();

  });
});
