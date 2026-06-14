import _, {filter, isEmpty} from 'lodash';

/**
 * Slots view: filter (active / day / description) + sort the slot list.
 * Render-free and Ember-free for plain-data unit testing. Shares the
 * filter→sort shape with bmid-view; a shared seam isn't pulled out because the
 * shared surface is just Array filter/sort — the fields differ entirely.
 *
 * @param {Object[]} slots the full slot list
 * @param {Object} filters the active selections
 * @returns {Object[]} a new, filtered + sorted array (sorted by `begins`)
 */

export function filterAndSortSlots(slots, {activeFilter = 'all', dayFilter, filterByDescription} = {}) {
  let result = slots;

  if (activeFilter === 'active') {
    result = result.filter((s) => s.active);
  } else if (activeFilter === 'inactive') {
    result = result.filter((s) => !s.active);
  }

  if (dayFilter) {
    if (dayFilter === 'upcoming') {
      result = result.filter((s) => s.has_started);
    } else if (dayFilter !== 'all') {
      result = result.filter((s) => s.slotDay === dayFilter);
    }
  }

  if (!isEmpty(filterByDescription)) {
    const needle = filterByDescription.toLowerCase();
    result = filter(result, (slot) => slot.description.toLowerCase().indexOf(needle) !== -1);
  }

  return _.sortBy(result, 'begins');
}
