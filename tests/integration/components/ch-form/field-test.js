import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import Object from '@ember/object';

module('Integration | Component | ch form/field', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    const model = Object.create({
      textfield: "Hi There"
    });

    this.set('model', model);
    await render(hbs`{{ch-form/field "textname" type="text" model=model label="A Label"}}`);

    const input = this.$('input[type="text"]');

    assert.ok(input, "Text field present");
    assert.dom('*').hasText('A Label', "label text should be present");

  });
});
