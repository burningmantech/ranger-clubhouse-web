import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | sum-column', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('rows',[ { a: 1, b: 2}, { a: 1, b: 3}]);
    this.set('column', 'b');

    await render(hbs`{{sum-column this.rows this.column}}`);

    assert.dom(this.element).hasText('5');
  });
});
