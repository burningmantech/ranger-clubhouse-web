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
    await render(hbs`{{ch-form/field "textfield" type="text" model=model label="A Label"}}`);

    const input = assert.dom('input[type="text"]');

    assert.ok(input, 'Text field present');
    input.hasValue('Hi There');
    assert.dom('label').hasText('A Label', 'Label text should be present');

  });

  test('it renders a select field', async function(assert) {
    const model = EmberObject.create({
      selectField: 2
    });

    const fieldOptions = [
      [ 'Value 1', 1 ],
      [ 'Value 2', 2 ],
      [ 'Value 3', 3 ],
    ];

    this.setProperties({ model, fieldOptions });
    await render(hbs`{{ch-form/field "selectField" type="select" model=model label="A Select Label" options=fieldOptions}}`);

    const selectElement = assert.dom('select');
    selectElement.exists('select field present');
    assert.dom('option[value="2"]').hasAttribute('selected', true);
  });
});
