import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render, click} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {makePerson} from 'clubhouse/tests/helpers/factories';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | modal-confirm-multiple-enrollment', function (hooks) {
  setupRenderingTest(hooks);

  test('it lists the enrolled slot and fires the confirm and close callbacks', async function (assert) {
    this.set('dialog', {
      data: {
        person: makePerson(),
        slots: [
          {
            id: 1,
            description: 'hello',
            begins: '2020-01-01 12:00:00',
            position: {id: 2, title: 'a position'},
          },
        ],
      },
    });
    this.set('onClose', spy());
    this.set('onConfirm', spy());

    await render(hbs`<ModalConfirmMultipleEnrollment @dialog={{this.dialog}}
                                                     @onClose={{this.onClose}}
                                                     @onConfirm={{this.onConfirm}} />`);

    assert.dom('.modal-title').hasText('Confirm Multiple Enrollment Sign Up');
    // person is not the logged-in user, so the callsign branch renders.
    assert.dom('.modal-body').includesText('Hubcap');
    assert.dom('.modal-body').includesText('a position - hello');

    await click('button.btn-warning');
    assert.true(this.onConfirm.called, 'Force Sign-Up fired @onConfirm');

    await click('button.btn-link');
    assert.true(this.onClose.called, 'Cancel fired @onClose');
  });
});
