import {filterAndSortBmids, bmidTitleFilterOptions, bmidTeamFilterOptions} from 'clubhouse/utils/bmid-view';
import {module, test} from 'qunit';

// Plain rows carrying just the properties the view logic reads — no Ember, no model.
function bmid(callsign, props = {}) {
  return {
    sortCallsign: callsign.toLowerCase(),
    title1: null, title2: null, title3: null,
    team: null, notes: null,
    mealsShortLabel: null,
    meals_granted: {pre: false, event: false, post: false},
    showers_granted: false,
    org_vehicle_insurance: 0,
    access_date_sortable: 0,
    notQualifiedToPrint: false,
    ...props,
  };
}

module('Unit | Utility | bmid-view', function () {
  test('default callsign sort, input not mutated', function (assert) {
    const rows = [bmid('Zulu'), bmid('Alpha'), bmid('Mike')];
    const out = filterAndSortBmids(rows);

    assert.deepEqual(out.map((b) => b.sortCallsign), ['alpha', 'mike', 'zulu'], 'sorted by callsign');
    assert.deepEqual(rows.map((b) => b.sortCallsign), ['zulu', 'alpha', 'mike'], 'source array untouched');
  });

  test('title filter matches any of title1/2/3', function (assert) {
    const rows = [
      bmid('A', {title1: 'Shift Lead'}),
      bmid('B', {title3: 'Shift Lead'}),
      bmid('C', {title1: 'Dirt'}),
    ];
    const out = filterAndSortBmids(rows, {titleFilter: 'Shift Lead'});
    assert.deepEqual(out.map((b) => b.sortCallsign), ['a', 'b'], 'keeps rows with the title in any slot');
  });

  test('team filter is a substring match', function (assert) {
    const rows = [bmid('A', {team: 'Pre/Post'}), bmid('B', {team: 'Gate'})];
    const out = filterAndSortBmids(rows, {teamFilter: 'Post'});
    assert.deepEqual(out.map((b) => b.sortCallsign), ['a'], 'Post matches inside Pre/Post');
  });

  test('want=showers keeps only granted showers', function (assert) {
    const rows = [bmid('A', {showers_granted: true}), bmid('B')];
    assert.deepEqual(filterAndSortBmids(rows, {wantFilter: 'showers'}).map((b) => b.sortCallsign), ['a']);
  });

  test('qualified filter splits on notQualifiedToPrint', function (assert) {
    const rows = [bmid('A', {notQualifiedToPrint: true}), bmid('B')];
    assert.deepEqual(filterAndSortBmids(rows, {qualifiedFilter: 'qualified'}).map((b) => b.sortCallsign), ['b']);
    assert.deepEqual(filterAndSortBmids(rows, {qualifiedFilter: 'unqualified'}).map((b) => b.sortCallsign), ['a']);
  });

  test('text filter is a case-insensitive regex over callsign/title/notes', function (assert) {
    const rows = [bmid('A', {notes: 'needs MVR'}), bmid('B', {title1: 'Dirt'})];
    assert.deepEqual(filterAndSortBmids(rows, {textFilter: 'mvr'}).map((b) => b.sortCallsign), ['a']);
    assert.deepEqual(filterAndSortBmids(rows, {textFilter: 'a'}).map((b) => b.sortCallsign), ['a'], 'matches by callsign');
  });

  test('mvr sort puts insured first, then callsign', function (assert) {
    const rows = [bmid('Zulu', {org_vehicle_insurance: 1}), bmid('Alpha'), bmid('Bravo', {org_vehicle_insurance: 1})];
    const out = filterAndSortBmids(rows, {sortColumn: 'mvr'});
    assert.deepEqual(out.map((b) => b.sortCallsign), ['bravo', 'zulu', 'alpha'], 'insured (callsign-ordered) then uninsured');
  });

  test('title options are sorted unique with All first', function (assert) {
    const rows = [bmid('A', {title1: 'Shift Lead', title2: 'Dirt'}), bmid('B', {title1: 'Dirt'})];
    assert.deepEqual(bmidTitleFilterOptions(rows), ['All', 'Dirt', 'Shift Lead']);
  });

  test('team options split combined teams on + and /', function (assert) {
    const rows = [bmid('A', {team: 'Pre/Post'}), bmid('B', {team: 'Gate+Greeters'})];
    assert.deepEqual(bmidTeamFilterOptions(rows), ['All', 'Gate', 'Greeters', 'Post', 'Pre']);
  });
});
