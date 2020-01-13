import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | behavioral-agreement-modal', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    this.set('closeAgreement', () => { return true });
    this.set('signAgreement', () => { return true });

    await render(hbs`<BehavioralAgreementModal @closeAgreement={{this.closeAgreement}} @signAgreement={{this.signAgreement}} />`);

    assert.dom('#dialog-box').exists();
  });
});
