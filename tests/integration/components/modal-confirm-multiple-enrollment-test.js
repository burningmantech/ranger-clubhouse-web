import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

module('Integration | Component | modal-confirm-multiple-enrollment', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('dialog', {
      data: {
        person: {id: 1, callsign: 'hubcap'},
        slots: []
      }
    });
    this.set('onClose', () => {});
    this.set('onConfirm', () => {});
    await render(hbs`<ModalConfirmMultipleEnrollment @dialog={{this.dialog}} @onClose={{this.onClose}} @onConfirm={{this.onConfirm}}/>`);
    assert.dom('div.modal').exists();
  });
});
