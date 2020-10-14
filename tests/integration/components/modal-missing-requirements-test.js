import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import {OT_MISSING} from 'clubhouse/constants/signup-requirements';

module('Integration | Component | modal-missing-requirements', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('dialog', {data: {
        person: { id: 1, callsign: 'hubcap' },
        requirements: [OT_MISSING],
        slot:  { id: 1, begins: '2020-01-01 10:00:00', position_id: 1 }
      }});
    this.set('nullAction', () => {});
    await render(hbs`<ModalMissingRequirements @dialog={{this.dialog}}  @onClose={{this.nullAction}}  />`);
    assert.dom('div.modal').exists();
  });
});
