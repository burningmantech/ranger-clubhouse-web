import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ch form/submit', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{ch-form/submit submitAction='action' label="Submit It"}}`);
    const button = this.$('button');

    assert.equal(button.length, 1);
    assert.equal(button.attr('type'), 'submit');
    assert.equal(button.text(), 'Submit It')
  });
});
