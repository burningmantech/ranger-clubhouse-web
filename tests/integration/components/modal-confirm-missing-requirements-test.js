import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {OT_MISSING} from 'clubhouse/constants/signup-requirements';

module('Integration | Component | modal-confirm-missing-requirements', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('dialog', {data: {
      person: { id: 1, callsign: 'hubcap' },
      requirements: [OT_MISSING]
    }});
    this.set('nullAction', () => { })

    await render(hbs`<ModalConfirmMissingRequirements @dialog={{this.dialog}}  @onClose={{this.nullAction}} @onConfirm={{this.nullAction}} />`);
    assert.dom('div.modal').exists();
  });
});
