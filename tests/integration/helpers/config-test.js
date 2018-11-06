import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'clubhouse/config/environment';

module('helper:config', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it should find config', async function(assert) {
    if (!ENV['clientConfig'])
      ENV['clientConfig'] = {}

    ENV['clientConfig'].parent = 'rick';

    await render(hbs`{{config 'parent'}}`);

    assert.dom('*').hasText('rick');
  });

  test('it should not find config', async function(assert) {
    if (!ENV['clientConfig'])
      ENV['clientConfig'] = {}

    delete ENV['clientConfig']['parent'];

    await render(hbs`{{config 'parent'}}`);
    assert.dom('*').hasText('');
  });
});
