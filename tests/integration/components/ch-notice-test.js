import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch notice', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
     await render(hbs`<ChNotice @title="box title">box body</ChNotice>`);

    assert.dom('.notice-header').exists().hasText('box title');
    assert.dom('.notice-body').hasText('box body');
  });
});
