import {filterAndSortSlots} from 'clubhouse/utils/slots-view';
import {module, test} from 'qunit';

function slot(begins, props = {}) {
  return {begins, active: true, has_started: false, slotDay: '2026-08-25', description: '', ...props};
}

module('Unit | Utility | slots-view', function () {
  test('no filters: sorted by begins', function (assert) {
    const slots = [slot('2026-08-25 18:00'), slot('2026-08-25 06:00'), slot('2026-08-25 12:00')];
    assert.deepEqual(
      filterAndSortSlots(slots).map((s) => s.begins),
      ['2026-08-25 06:00', '2026-08-25 12:00', '2026-08-25 18:00']
    );
  });

  test('active filter keeps active or inactive', function (assert) {
    const slots = [slot('1', {active: true}), slot('2', {active: false})];
    assert.deepEqual(filterAndSortSlots(slots, {activeFilter: 'active'}).map((s) => s.begins), ['1']);
    assert.deepEqual(filterAndSortSlots(slots, {activeFilter: 'inactive'}).map((s) => s.begins), ['2']);
  });

  test('day filter: a specific day, upcoming, and all', function (assert) {
    const slots = [
      slot('1', {slotDay: '2026-08-25', has_started: true}),
      slot('2', {slotDay: '2026-08-26', has_started: false}),
    ];
    assert.deepEqual(filterAndSortSlots(slots, {dayFilter: '2026-08-26'}).map((s) => s.begins), ['2'], 'specific day');
    assert.deepEqual(filterAndSortSlots(slots, {dayFilter: 'upcoming'}).map((s) => s.begins), ['1'], 'upcoming = has_started');
    assert.deepEqual(filterAndSortSlots(slots, {dayFilter: 'all'}).map((s) => s.begins), ['1', '2'], 'all = no day filter');
  });

  test('description filter is a case-insensitive substring', function (assert) {
    const slots = [slot('1', {description: 'Dirt Patrol'}), slot('2', {description: 'Gate Greeter'})];
    assert.deepEqual(filterAndSortSlots(slots, {filterByDescription: 'dirt'}).map((s) => s.begins), ['1']);
  });
});
