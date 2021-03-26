import { module,test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | read-more', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('text', '012345678901234567890123456789')
    await render(hbs`<ReadMore @text={{this.text}} />`);

    assert.dom('a').exists().hasText(/\[\+more]/);
  });
});
