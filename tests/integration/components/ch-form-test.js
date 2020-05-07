import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | ch form', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a basic form', async function(assert) {
    // Template block usage:

    const formModel = EmberObject.create({ field1: 'some value' });

    this.set('formModel', formModel);
    await render(hbs`
      <ChForm @formId="someform" @originalModel={{this.formModel}} as |f|>
        Some form text
        <f.input @name="field1" @type="text" />
      </ChForm>
    `);

    assert.dom('form').hasText('Some form text');
    const input = assert.dom('input[type="text"]');
    input.hasAttribute('name', 'field1');
    input.hasValue('some value');
  });
});
