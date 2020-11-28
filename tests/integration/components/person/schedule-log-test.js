import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | person/schedule-log', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('person', { id: 1, callsign: 'hubcap'});
    await render(hbs`<Person::ScheduleLog @year={{2019}} @person={{this.person}} />`);

    assert.dom('a').exists().hasText('View Scheduling Log');
  });
});
