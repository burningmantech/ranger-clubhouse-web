import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { OT_MISSING } from 'clubhouse/constants/signup-requirements';

module('Integration | Component | schedule-blocked', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {

    this.set('person', { id: 1, callsign: 'hubcap'});
    this.set('requirements', [ OT_MISSING ]);
    this.set('overrideAction', () => { });

    await render(hbs`<ScheduleBlocked @person={{this.person}}
                                    @requirements={{this.requirements}}
                                    @overrideAction={{this.overrideAction}}
                                    @isAdmin={{false}}
                                    @isMe={{true}}
                        />`);

    assert.dom('div.alert').exists();
  });
});
