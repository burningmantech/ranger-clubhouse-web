import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { MISSING_BPGUID} from 'clubhouse/constants/dashboard-steps';

module('Integration | Component | schedule-requirements', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('requirements', [ MISSING_BPGUID]);
    this.set('person', { id: 1, callsign: 'hubcap'});

    await render(hbs`<ScheduleRequirements @requirements={{this.requirements}} @person={{this.person}}/>`);
    assert.dom('ul').exists();
    assert.dom('li').exists();
  });
});
