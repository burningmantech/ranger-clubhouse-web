import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

const ALPHA = 1;

module('Integration | Component | mentor/shift-report-row', function (hooks) {
  setupRenderingTest(hooks);

  test('alpha position shows prior bonks as badges', async function (assert) {
    this.setProperties({
      person: { id: 10, callsign: 'Hubcap', bonks: [2018, 2021] },
      position: { id: ALPHA, title: 'Alpha' },
      alpha: ALPHA,
    });
    await render(hbs`<Mentor::ShiftReportRow @person={{this.person}} @position={{this.position}}
                       @alphaPosition={{this.alpha}} @began={{this.person.on_duty}} @duration={{60}} />`);

    assert.dom('.badge').exists({ count: 2 });
    assert.dom('tr').includesText('2018');
    assert.dom('tr').includesText('2021');
  });

  test('non-alpha position shows rangered events instead of bonks', async function (assert) {
    this.setProperties({
      person: { id: 11, callsign: 'Gnarly', years_as_ranger: [2019, 2020, 2021] },
      position: { id: 99, title: 'Green Dot' },
      alpha: ALPHA,
    });
    await render(hbs`<Mentor::ShiftReportRow @person={{this.person}} @position={{this.position}}
                       @alphaPosition={{this.alpha}} @began={{this.person.on_duty}} @duration={{60}} />`);

    assert.dom('tr').includesText('3 events');
    assert.dom('.badge').doesNotExist();
  });

  test('non-alpha position with no ranger history shows the fallback', async function (assert) {
    this.setProperties({
      person: { id: 12, callsign: 'Newbie', years_as_ranger: null },
      position: { id: 99, title: 'Green Dot' },
      alpha: ALPHA,
    });
    await render(hbs`<Mentor::ShiftReportRow @person={{this.person}} @position={{this.position}}
                       @alphaPosition={{this.alpha}} @began={{this.person.on_duty}} @duration={{60}} />`);

    assert.dom('tr').includesText('No Ranger experience');
  });
});
