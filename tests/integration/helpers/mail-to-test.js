
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:mail-to', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    this.set('email', 'dangerranger@ranger.bm');

    await render(hbs`{{mail-to email}}`);

    assert.equal(this.element.innerHTML, '<a href="mailto:dangerranger@ranger.bm">dangerranger@ranger.bm</a>');
  });
});
