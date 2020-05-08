import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch box', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
     await render(hbs`<ChBox @title="box title">box body</ChBox>`);

    assert.dom('.card-header').hasText('box title');
    assert.dom('.card-body').hasText('box body');
  });
});
