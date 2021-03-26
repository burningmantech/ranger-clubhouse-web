import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | bmid-edit', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    await render(hbs`<BmidEdit />`);

    assert.equal(this.element.textContent.trim(), '');

  });
});
