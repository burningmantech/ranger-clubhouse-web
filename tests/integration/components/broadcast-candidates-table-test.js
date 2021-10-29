import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | broadcast-candidates-table', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
     await render(hbs`<BroadcastCandidatesTable />`);

    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
