import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | ch form/field', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a text field', async function(assert) {
    const model = EmberObject.create({
      textfield: 'Hi There'
    });

    this.set('model', model);

    await render(hbs`<ChForm::Field @name="textfield"
                        @type="text" @label="A Label"
                        @model={{this.model}} @formId="myform" />`);

    const input = assert.dom('input[type="text"]');

    assert.ok(input, 'Text field present');
    input.hasValue('Hi There');
    assert.dom('label').hasText('A Label', 'Label text should be present');
  });
});
