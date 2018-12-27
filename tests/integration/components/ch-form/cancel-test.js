import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch-form/cancel', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{ch-form/cancel}}`);

    assert.dom(this.element).hasText('Cancel');
  });

  test('it accepts a label', async function(assert) {
    this.set('label', 'Give up!');
    await render(hbs`{{ch-form/cancel label=label}}`);

    assert.dom(this.element).hasText('Give up!');
  });
});
