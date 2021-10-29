
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:fa-icon', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it render icons', async function(assert) {
    await render(hbs`{{fa-icon 'clock'}}`);

    const simple = find('i');
    assert.ok(simple);
    assert.strictEqual(simple.className.trim(),'fas fa-clock');

    await render(hbs`{{fa-icon 'clock' size='lg'}}`);
    const withSize = find('i');
    assert.ok(withSize);
    assert.strictEqual(withSize.className.trim(),'fas fa-clock fa-lg');

  });
});
