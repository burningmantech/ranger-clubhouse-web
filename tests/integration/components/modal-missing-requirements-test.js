import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render, click} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';
import {OC_MISSING} from 'clubhouse/constants/signup-requirements';
import {makePerson} from 'clubhouse/tests/helpers/factories';
import {spy} from 'clubhouse/tests/helpers/spy';

module('Integration | Component | modal-missing-requirements', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders the requirement list and fires the close callback', async function (assert) {
    this.set('dialog', {
      data: {
        person: makePerson({status: 'alpha'}),
        requirements: [OC_MISSING],
        slot: {id: 1, begins: '2020-01-01 10:00:00', position_id: 1},
      },
    });
    this.set('onClose', spy());

    await render(hbs`<ModalMissingRequirements @dialog={{this.dialog}} @onClose={{this.onClose}} />`);

    assert.dom('.modal-title').hasText('Sign Up Requirements Not Met');
    assert.dom('.modal-body ul li').includesText('The Online Course has not been completed.');
    assert.dom('button.btn').hasText('Close');

    await click('button.btn');
    assert.true(this.onClose.called, 'Close fired @onClose');
  });
});
