import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | alert-group', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with empty group', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('heading', 'Test Heading');
    this.set('description', 'Test Description');
    this.set('group', []);

    await render(hbs`{{alert-group group=group heading=heading description=description}}`);

    assert.dom(this.element).hasText('Test Heading\nTest Description');
  });

  test('it renders with one alert', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });
    this.set('heading', 'Test Heading');
    this.set('description', 'Test Description');
    this.set('group', [{title: 'Alert Title', description: 'Alert Description', no_opt_out: true}]);

    await render(hbs`{{alert-group group=group heading=heading description=description}}`);

    assert.dom('tr:first-of-type').hasText('Test Heading\nTest Description');
    assert.dom('.alert-pref-desc').hasText('Alert Title\nAlert Description');
    assert.dom('.alert-pref-address').hasText('Cannot be opted out of');
  });
});
