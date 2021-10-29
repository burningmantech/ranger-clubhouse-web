import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | document-show', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`<DocumentShow @tag="tag-test"/>`);
    assert.strictEqual(this.element.textContent.trim(), 'a body');
  });

  test('it did not find document', async function(assert) {
     await render(hbs`<DocumentShow @tag="does-not-exist"/>`);
    assert.strictEqual(this.element.textContent.trim(), 'Document tag [does-not-exist] not found.');
  });

});
