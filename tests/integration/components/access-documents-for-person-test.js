import { module, skip /*test*/ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('Integration | Component | access-documents-for-person', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<AccessDocumentsForPerson />`);

    assert.strictEqual(this.element.textContent.trim(), '');
  });
});
