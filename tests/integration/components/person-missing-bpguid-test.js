import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
module('Integration | Component | person-missing-bpguid', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<PersonMissingBpguid />`);
    assert.dom('p').hasText(/get your Burner Profile and Clubhouse account linked/);
  });
});
