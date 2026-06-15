import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render, click} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {OC_MISSING} from 'clubhouse/constants/signup-requirements';
import {makePerson} from 'clubhouse/tests/helpers/factories';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | modal-confirm-missing-requirements', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the requirement and fires the confirm and close callbacks', async function (assert) {
    this.set('dialog', {
      data: {
        person: makePerson({status: 'alpha'}),
        requirements: [OC_MISSING],
        training_signups_allowed: true,
      },
    });
    this.set('onClose', spy());
    this.set('onConfirm', spy());

    await render(hbs`<ModalConfirmMissingRequirements @dialog={{this.dialog}}
                                                      @onClose={{this.onClose}}
                                                      @onConfirm={{this.onConfirm}} />`);

    assert.dom('.modal-title').hasText('Signup requirements have not been met');
    assert.dom('.modal-body').includesText('The Online Course has not been completed.');
    assert.dom('button.btn-warning').hasText('Force Sign Up');

    await click('button.btn-warning');
    assert.true(this.onConfirm.called, 'Force Sign Up fired @onConfirm');

    await click('button.btn-link');
    assert.true(this.onClose.called, 'Cancel fired @onClose');
  });
});
