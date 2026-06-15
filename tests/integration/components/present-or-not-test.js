import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | present-or-not', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a present value', async function(assert) {
    this.set('value', 'something');

    await render(hbs`<PresentOrNot @value={{this.value}} />`);

    // The component emits the bare value with no wrapping element.
    assert.strictEqual(this.element.textContent.trim(), 'something');
  });

  test('it renders a not-given placeholder for an empty value', async function(assert) {
    this.set('value', '');

    await render(hbs`<PresentOrNot @value={{this.value}} />`);

    assert.dom('i').exists().hasText('not given');
  });
});
