import { module, skip /*test*/ } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('Integration | Component | person/emergency-contact', function(hooks) {
  setupRenderingTest(hooks);

  skip('it renders', async function(assert) {
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Person::EmergencyContact />`);

    assert.dom(this.element).hasText('');
  });
});
