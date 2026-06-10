import {module, test} from 'qunit';
import {setupTest} from 'ember-qunit';
import EmberObject from '@ember/object';

// Build a fresh set each test so mutations (set on tracked flags) don't leak.
function buildPositions() {
  return [
    EmberObject.create({id: 1, title: 'A', type: 'A Type', active: true, all_rangers: true, count_hours: true}),
    EmberObject.create({id: 2, title: 'B', type: 'A Type', active: false, all_rangers: false, count_hours: true}),
    EmberObject.create({id: 3, title: 'C', type: 'Training', active: true, all_rangers: true, count_hours: false}),
    EmberObject.create({id: 4, title: 'D', type: 'Training', active: false, all_rangers: false, count_hours: false}),
  ];
}

module('Unit | Controller | admin/positions', function (hooks) {
  setupTest(hooks);

  function setup(context) {
    const controller = context.owner.lookup('controller:admin/positions');
    controller.set('positions', buildPositions());
    return controller;
  }

  test('viewPositions returns everything with the default filters', function (assert) {
    const controller = setup(this);

    // Defaults: typeFilter 'All', activeFilter 'all', allRangersFilter 'all', no attrs.
    const view = controller.viewPositions;
    assert.strictEqual(view.length, 4, 'all positions shown with default filters');
  });

  test('typeFilter restricts to a single position type', function (assert) {
    const controller = setup(this);
    controller.set('typeFilter', 'A Type');

    const view = controller.viewPositions;
    assert.strictEqual(view.length, 2, 'only A Type positions shown');
    assert.deepEqual(view.map((p) => p.id), [1, 2], 'the A Type positions are 1 and 2');
  });

  test('activeFilter "active" keeps only active positions', function (assert) {
    const controller = setup(this);
    controller.set('activeFilter', 'active');

    const view = controller.viewPositions;
    assert.deepEqual(view.map((p) => p.id), [1, 3], 'only active positions shown');
  });

  test('activeFilter "inactive" keeps only inactive positions', function (assert) {
    const controller = setup(this);
    controller.set('activeFilter', 'inactive');

    const view = controller.viewPositions;
    assert.deepEqual(view.map((p) => p.id), [2, 4], 'only inactive positions shown');
  });

  test('allRangersFilter "all-rangers" keeps only all_rangers positions', function (assert) {
    const controller = setup(this);
    controller.set('allRangersFilter', 'all-rangers');

    const view = controller.viewPositions;
    assert.deepEqual(view.map((p) => p.id), [1, 3], 'only all_rangers positions shown');
  });

  test('allRangersFilter "all" does not filter at all', function (assert) {
    const controller = setup(this);
    controller.set('allRangersFilter', 'all');

    const view = controller.viewPositions;
    assert.strictEqual(view.length, 4, 'the "all" sentinel leaves the list untouched');
  });

  test('allRangersFilter "not" keeps only non-all_rangers positions', function (assert) {
    const controller = setup(this);
    controller.set('allRangersFilter', 'not');

    const view = controller.viewPositions;
    assert.deepEqual(view.map((p) => p.id), [2, 4], 'only non-all_rangers positions shown');
  });

  test('a single attrFilter keeps positions that have the flag set', function (assert) {
    const controller = setup(this);
    controller.set('attrFilters', ['count_hours']);

    const view = controller.viewPositions;
    assert.deepEqual(view.map((p) => p.id), [1, 2], 'only positions with count_hours shown');
  });

  test('multiple attrFilters are ANDed together', function (assert) {
    const controller = setup(this);
    // Only position 1 has BOTH all_rangers and count_hours.
    controller.set('attrFilters', ['all_rangers', 'count_hours']);

    const view = controller.viewPositions;
    assert.deepEqual(view.map((p) => p.id), [1], 'only the position with all attr flags shown');
  });

  test('all filter dimensions combine with AND semantics', function (assert) {
    const controller = setup(this);
    controller.set('typeFilter', 'A Type');     // -> 1, 2
    controller.set('activeFilter', 'active');   // of those, active -> 1
    controller.set('allRangersFilter', 'all-rangers'); // 1 is all_rangers
    controller.set('attrFilters', ['count_hours']);    // 1 has count_hours

    const view = controller.viewPositions;
    assert.deepEqual(view.map((p) => p.id), [1], 'AND of every filter dimension narrows to position 1');
  });

  test('combined filters can produce an empty result set', function (assert) {
    const controller = setup(this);
    controller.set('typeFilter', 'Training');   // -> 3, 4
    controller.set('allRangersFilter', 'all-rangers'); // 3 only
    controller.set('activeFilter', 'inactive'); // 3 is active, so none remain

    const view = controller.viewPositions;
    assert.strictEqual(view.length, 0, 'contradictory filters yield no positions');
  });

  test('updateAttrFilters replaces the attrFilters list', function (assert) {
    const controller = setup(this);
    controller.updateAttrFilters(['all_rangers']);

    assert.deepEqual(controller.attrFilters, ['all_rangers'], 'attrFilters updated');
    assert.deepEqual(controller.viewPositions.map((p) => p.id), [1, 3], 'view reflects the new attr filter');
  });

  test('resetFilters restores every filter to its default', function (assert) {
    const controller = setup(this);
    controller.set('typeFilter', 'Training');
    controller.set('activeFilter', 'active');
    controller.set('allRangersFilter', 'not');
    controller.set('viewAs', 'teams');
    controller.set('attrFilters', ['count_hours']);

    controller.resetFilters();

    assert.strictEqual(controller.typeFilter, 'All', 'typeFilter reset');
    assert.strictEqual(controller.activeFilter, 'all', 'activeFilter reset');
    assert.strictEqual(controller.allRangersFilter, 'all', 'allRangersFilter reset');
    assert.strictEqual(controller.viewAs, 'list', 'viewAs reset');
    assert.deepEqual(controller.attrFilters, [], 'attrFilters reset');
    assert.strictEqual(controller.viewPositions.length, 4, 'view shows everything again');
  });

  function buildTeamPositions() {
    return [
      EmberObject.create({id: 1, title: 'A', type: 'A Type', active: true, team_id: 10}),
      EmberObject.create({id: 2, title: 'B', type: 'Training', active: true, team_id: 10}),
      EmberObject.create({id: 3, title: 'C', type: 'A Type', active: true, team_id: null}),
      EmberObject.create({id: 4, title: 'D', type: 'Training', active: true, team_id: 99}), // team no longer exists
    ];
  }

  test('viewByTeams groups by team and routes teamless & orphaned positions to the general bucket', function (assert) {
    const controller = setup(this);
    controller.set('positions', buildTeamPositions());
    controller.set('teams', [{id: 10, title: 'Team Ten'}]);

    const view = controller.viewByTeams;
    assert.strictEqual(view.length, 2, 'general bucket plus one team');
    assert.deepEqual(view[0].team_positions.map((p) => p.id), [3, 4],
      'teamless and orphaned-team positions land in the general bucket');
    assert.strictEqual(view[1].id, 10, 'team section present');
    assert.deepEqual(view[1].team_positions.map((p) => p.id), [1, 2], 'team positions grouped under their team');
  });

  test('viewByTeams general bucket respects the active filters', function (assert) {
    const controller = setup(this);
    controller.set('positions', buildTeamPositions());
    controller.set('teams', [{id: 10, title: 'Team Ten'}]);
    controller.set('typeFilter', 'A Type');

    const view = controller.viewByTeams;
    assert.deepEqual(view[0].team_positions.map((p) => p.id), [3],
      'filtered-out positions do not leak into the general bucket');
    assert.deepEqual(view[1].team_positions.map((p) => p.id), [1], 'team section is filtered too');
  });
});
