import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | json-format', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('json', '{ "abc": "def" }');
    await render(hbs`<JsonFormat @json={{this.json}} />`);
    assert.ok(this.element.querySelector('.json-formatter-row'));
  });
});
