import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | submitting-indicator', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<SubmittingIndicator />`);

    assert.ok(this.element.textContent.trim().indexOf('Submitting') > -1, 'Rendered default text');

    await render(hbs`<SubmittingIndicator @text="Reloading" />`);
    assert.ok(this.element.textContent.trim().indexOf('Reloading') > -1, 'Rendered alternative text');
  });
});
