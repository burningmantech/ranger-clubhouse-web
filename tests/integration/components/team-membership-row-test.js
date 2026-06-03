import {module, test} from 'qunit';
import {setupRenderingTest} from 'ember-qunit';
import {render} from '@ember/test-helpers';
import {hbs} from 'ember-cli-htmlbars';

// The row takes three position lists (all-members / optional / public) that
// drive the per-position columns. The last-shift column shows the single most
// recent year worked across the person's granted positions (or "NS").
module('Integration | Component | team-membership-row', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // One all-members position (Dirt, id 10); no optional or public positions.
    this.set('allMembersPositions', [{id: 10, title: 'Dirt'}]);
    this.set('optionalPositions', []);
    this.set('publicPositions', []);
  });

  async function renderRow() {
    await render(hbs`<table><tbody><TeamMembershipRow @person={{this.person}}
        @allMembersPositions={{this.allMembersPositions}}
        @optionalPositions={{this.optionalPositions}}
        @publicPositions={{this.publicPositions}} /></tbody></table>`);
  }

  test('renders the callsign, status and member badge for a member', async function (assert) {
    this.set('person', {
      id: 1,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [{id: 10, worked_on: '2025-08-30 09:00:00'}],
    });

    await renderRow();

    assert.dom('.roster-col-callsign').includesText('TestCall');
    assert.dom('.roster-col-callsign').includesText('active');
    assert.dom('.roster-col-member').includesText('member');
  });

  test('non-members render the "not member" badge', async function (assert) {
    this.set('person', {
      id: 2,
      callsign: 'TestCall',
      status: 'active',
      is_member: false,
      positions: [{id: 10, worked_on: '2025-08-30 09:00:00'}],
    });

    await renderRow();

    assert.dom('.roster-col-member').includesText('not member');
  });

  test('shows the most recent year worked across multiple grants regardless of order', async function (assert) {
    // The newer grant (2025) is listed before the older one (2023) on purpose:
    // the result must be deterministic and not depend on array order.
    this.set('person', {
      id: 3,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [
        {id: 10, worked_on: '2025-08-30 09:00:00'},
        {id: 10, worked_on: '2023-06-01 12:00:00'},
      ],
    });

    await renderRow();

    assert.dom('.roster-col-last-shift .roster-last-worked').hasText('2025');
  });

  test('ignores null worked_on when computing the most recent year', async function (assert) {
    this.set('person', {
      id: 4,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [
        {id: 10, worked_on: '2022-04-15 18:30:00'},
        {id: 10, worked_on: null},
        {id: 10, worked_on: '2024-09-10 07:45:00'},
      ],
    });

    await renderRow();

    assert.dom('.roster-col-last-shift .roster-last-worked').hasText('2024');
  });

  test('shows NS when every grant has a null worked_on', async function (assert) {
    this.set('person', {
      id: 5,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [{id: 10, worked_on: null}],
    });

    await renderRow();

    assert.dom('.roster-col-last-shift .roster-status-never-worked').hasText('NS');
    assert.dom('.roster-col-last-shift .roster-last-worked').doesNotExist();
  });

  test('shows NS when the person has no positions', async function (assert) {
    this.set('person', {
      id: 6,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [],
    });

    await renderRow();

    assert.dom('.roster-col-last-shift .roster-status-never-worked').hasText('NS');
  });
});
