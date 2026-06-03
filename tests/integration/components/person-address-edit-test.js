import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | person-address-edit', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the address fields populated from the model', async function (assert) {
    // Set deterministic address values so select fields (state/country) match
    // valid option values for a US address.
    const person = this.server.create('person', {
      country: 'US',
      state: 'CA',
      city: 'Black Rock City',
      street1: '123 Esplanade',
      street2: 'Center Camp',
      apt: '7',
      zip: '94000',
    });

    this.set('person', person);
    this.set('submitAction', spy());

    await render(hbs`
    <ChForm @formId="person" @formFor={{this.person}} @onSubmit={{this.submitAction}} as |f|>
        <PersonAddressEdit @f={{f}} />
      </ChForm>
    `);

    // For a US country the component renders state as a <select>, all others as inputs.
    const fields = ['street1', 'street2', 'apt', 'city', 'state', 'country', 'zip'];

    fields.forEach((field) => {
      assert.dom(`[name="${field}"]`).exists(`the ${field} field is rendered`).hasValue(person[field]);
    });
  });
});
