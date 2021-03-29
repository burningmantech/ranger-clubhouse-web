import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Helper | year-format', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('date', '2018-09-01 10:12:00');

    await render(hbs`{{year-format this.date}}`);

    assert.dom(this.element).hasText('2018');
  });
});
