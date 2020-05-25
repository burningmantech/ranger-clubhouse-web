import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | person-address-edit', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const person = server.create('person');
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('person', person);
    this.set('submitAction', () => { });
    await render(hbs`
    <ChForm @form="person" @formFor={{this.person}} @onSubmit={{this.submitAction}} as |f|>
        <PersonAddressEdit @f={{f}} />
      </ChForm>
    `);

    const fields = [
      'street1', 'street2', 'apt', 'city', 'state', 'country',
    ];

    fields.forEach((field) => {
      assert.dom(`[name="${field}"]`).hasValue(person[field]);
    });
  });
});
