import { module, skip /* test */ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | login sidebar', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders the login sidebar', async function(assert) {
    await render(hbs`{{login-sidebar}}`);

    assert.ok(find('*').textContent.trim().indexOf('Register') !== -1);
  });
});
