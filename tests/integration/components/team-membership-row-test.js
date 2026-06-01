import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | team-membership-row', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('amp', [{id: 10, title: 'Dirt'}]);
    this.set('op', []);
    this.set('pp', []);
  });

  test('shows the most recent year worked across multiple positions', async function(assert) {
    this.set('person', {
      id: 1,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [
        {id: 10, worked_on: '2023-06-01 12:00:00'},
        {id: 10, worked_on: '2025-08-30 09:00:00'},
      ],
    });

    await render(hbs`<table><tbody><TeamMembershipRow @person={{this.person}} @allMembersPositions={{this.amp}} @optionalPositions={{this.op}} @publicPositions={{this.pp}} /></tbody></table>`);

    assert.dom('.roster-col-last-shift .roster-last-worked').hasText('2025');
  });

  test('ignores null worked_on when computing the most recent year', async function(assert) {
    this.set('person', {
      id: 2,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [
        {id: 10, worked_on: '2022-04-15 18:30:00'},
        {id: 10, worked_on: null},
        {id: 10, worked_on: '2024-09-10 07:45:00'},
      ],
    });

    await render(hbs`<table><tbody><TeamMembershipRow @person={{this.person}} @allMembersPositions={{this.amp}} @optionalPositions={{this.op}} @publicPositions={{this.pp}} /></tbody></table>`);

    assert.dom('.roster-col-last-shift .roster-last-worked').hasText('2024');
  });

  test('shows NS when a member has never worked any position', async function(assert) {
    this.set('person', {
      id: 3,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [
        {id: 10, worked_on: null},
      ],
    });

    await render(hbs`<table><tbody><TeamMembershipRow @person={{this.person}} @allMembersPositions={{this.amp}} @optionalPositions={{this.op}} @publicPositions={{this.pp}} /></tbody></table>`);

    assert.dom('.roster-col-last-shift .roster-status-never-worked').hasText('NS');
    assert.dom('.roster-col-last-shift .roster-last-worked').doesNotExist();
  });

  test('shows NS when the person has no positions', async function(assert) {
    this.set('person', {
      id: 4,
      callsign: 'TestCall',
      status: 'active',
      is_member: true,
      positions: [],
    });

    await render(hbs`<table><tbody><TeamMembershipRow @person={{this.person}} @allMembersPositions={{this.amp}} @optionalPositions={{this.op}} @publicPositions={{this.pp}} /></tbody></table>`);

    assert.dom('.roster-col-last-shift .roster-status-never-worked').hasText('NS');
  });
});
