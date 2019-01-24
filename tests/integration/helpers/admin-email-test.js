import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'clubhouse/config/environment';

module('Integration | Helper | admin-email', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    ENV['clientConfig'] = { AdminEmail: 'admin@rangers.dev '};

    await render(hbs`{{admin-email}}`);

    assert.dom('a').hasText('admin@rangers.dev');
  });
});
