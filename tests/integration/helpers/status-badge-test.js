
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('helper:status-badge', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders active status', async function(assert) {
    this.set('status', 'active');

    await render(hbs`{{status-badge status}}`);

    assert.equal(find('*').innerHTML.trim(), '<span class="badge badge-success">active</span>');
  });

  test('it renders bonked status', async function(assert) {
    this.set('status', 'bonked');

    await render(hbs`{{status-badge status}}`);

    assert.equal(find('*').innerHTML.trim(), '<span class="badge badge-danger">bonked</span>');
  });
});
