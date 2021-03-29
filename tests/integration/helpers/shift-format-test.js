import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | shift-format', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('shiftTime', '2018-08-31 23:55:00');

    await render(hbs`{{shift-format this.shiftTime}}`);

    assert.dom(this.element).hasText('Fri Aug 31 @ 23:55');
  });
});
