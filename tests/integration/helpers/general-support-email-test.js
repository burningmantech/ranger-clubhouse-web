import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import ENV from 'clubhouse/config/environment';

module('Integration | Helper | general-support-email', function(hooks) {
  setupRenderingTest(hooks);

  // Replace this with your real tests.
  test('it renders', async function(assert) {
    ENV['clientConfig'] = { GeneralSupportEmail: 'support@rangers.dev'};

    await render(hbs`{{general-support-email}}`);

    assert.dom('a').hasText('support@rangers.dev');
  });
});
