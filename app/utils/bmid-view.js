import {isEmpty} from '@ember/utils';

/**
 * BMID roster view: filter + sort the BMID list, and build the title/team
 * filter options. Render-free and Ember-free so it can be unit-tested with
 * plain row objects (see tests/unit/utils/bmid-view-test). The controller owns
 * tracked state and rendering; this owns the data shaping it used to inline.
 */

export const TEXT_FILTER_FIELDS = [
  'sortCallsign',
  'title1',
  'title2',
  'title3',
  'team',
  'notes'
];

/**
 * Filter a BMID list by a case-insensitive text match across the given fields.
 * Render-free and shared by the roster and print controllers. Supports both
 * Ember models (bmid.get(field)) and plain objects (bmid[field]).
 *
 * @param {Object[]} bmids the list to filter
 * @param {string} text the search text (empty returns the list unchanged)
 * @param {string[]} [fields] the fields to search
 * @returns {Object[]} the matching bmids
 */

export function filterByText(bmids, text, fields = TEXT_FILTER_FIELDS) {
  if (isEmpty(text)) {
    return bmids;
  }
  const regexp = new RegExp(text, 'i');
  return bmids.filter((bmid) =>
    fields.some((field) => {
      const v = bmid.get ? bmid.get(field) : bmid[field];
      return !isEmpty(v) && regexp.test(v);
    })
  );
}

/**
 * Filter and sort the BMID roster.
 *
 * @param {Object[]} bmids the full roster
 * @param {Object} filters the active filter/sort selections
 * @returns {Object[]} a new, filtered + sorted array (input is not mutated)
 */

export function filterAndSortBmids(bmids, {
  titleFilter = 'All',
  teamFilter = 'All',
  wantFilter = '',
  qualifiedFilter = 'all',
  textFilter = '',
  sortColumn = 'callsign',
} = {}) {
  let result = [...bmids];
  let key;

  if (titleFilter !== 'All') {
    result = result.filter((bmid) => (bmid.title1 === titleFilter || bmid.title2 === titleFilter || bmid.title3 === titleFilter));
  }

  if (teamFilter !== 'All') {
    result = result.filter((bmid) => (!isEmpty(bmid.team) && bmid.team.indexOf(teamFilter) !== -1));
  }

  switch (wantFilter) {
    case 'all_eat':
      result = result.filter((bmid) => (bmid.meals_granted.pre && bmid.meals_granted.event && bmid.meals_granted.post));
      break;
    case 'event_week':
      result = result.filter((bmid) => (!bmid.meals_granted.pre && bmid.meals_granted.event && !bmid.meals_granted.post));
      break;
    case 'any_eat':
      result = result.filter((bmid) => (bmid.meals_granted.pre && bmid.meals_granted.event && bmid.meals_granted.post)
        || (!bmid.meals_granted.pre && bmid.meals_granted.event && !bmid.meals_granted.post)
      );
      break;
    case 'showers':
      result = result.filter((bmid) => bmid.showers_granted);
      break;
  }

  switch (qualifiedFilter) {
    case 'qualified':
      result = result.filter((bmid) => !bmid.notQualifiedToPrint);
      break;
    case 'unqualified':
      result = result.filter((bmid) => bmid.notQualifiedToPrint);
      break;
  }

  result = filterByText(result, textFilter);

  switch (sortColumn) {
    case 'callsign':
      // Sort by callsign
      result.sort((a, b) => a.sortCallsign.localeCompare(b.sortCallsign));
      break;

    case 'status':
    case 'title1':
    case 'title2':
    case 'title3':
    case 'team':
    case 'notes':
    case 'meals':
      key = sortColumn;
      if (key === 'meals') {
        key = 'mealsShortLabel';
      }
      result.sort((a, b) => {
        const aCol = a[key], bCol = b[key];

        // Have empty values appear at the end
        if (isEmpty(aCol)) {
          return 1;
        }
        if (isEmpty(bCol)) {
          return -1;
        }

        const cmp = aCol.toLowerCase().localeCompare(bCol.toLowerCase());
        if (cmp) {
          return cmp;
        }
        return a.sortCallsign.localeCompare(b.sortCallsign);
      });
      break;

    case 'mvr':
      // With Insurance first
      result.sort((a, b) => {
        const cmp = b.org_vehicle_insurance - a.org_vehicle_insurance;
        if (cmp) {
          return cmp;
        }

        return a.sortCallsign.localeCompare(b.sortCallsign);
      });
      break;

    case 'showers_granted':
      // With showers first
      result.sort((a, b) => {
        const cmp = b.showers_granted - a.showers_granted
        return cmp ? cmp : a.sortCallsign.localeCompare(b.sortCallsign);
      });
      break;

    case 'wap':
      result.sort((a, b) => {
        const cmp = a.access_date_sortable - b.access_date_sortable;
        if (cmp) {
          return cmp;
        }
        return a.sortCallsign.localeCompare(b.sortCallsign);
      });
      break;
  }

  return result;
}

/**
 * Build the title filter options from the roster (sorted, 'All' first).
 */

export function bmidTitleFilterOptions(bmids) {
  const titles = {};

  bmids.forEach((bmid) => {
    if (!isEmpty(bmid.title1)) {
      titles[bmid.title1] = true;
    }
    if (!isEmpty(bmid.title2)) {
      titles[bmid.title2] = true;
    }
    if (!isEmpty(bmid.title3)) {
      titles[bmid.title3] = true;
    }
  });

  const options = Object.keys(titles).sort();
  options.unshift('All');

  return options;
}

/**
 * Build the team filter options. Split out combined teams if a '+' or '/' is in
 * the field (e.g., Pre/Post becomes two teams [Pre, Post]). Sorted, 'All' first.
 */

export function bmidTeamFilterOptions(bmids) {
  const teams = {};

  bmids.forEach((bmid) => {
    if (!isEmpty(bmid.team)) {
      bmid.team.split(/(\+|\/)/).forEach((word) => {
        if (word !== '+' && word !== '/')
          teams[word] = true;
      });
    }
  });

  const options = Object.keys(teams).sort();
  options.unshift('All');

  return options;
}
