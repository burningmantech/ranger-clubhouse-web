import {DIRT_SHINY_PENNY} from 'clubhouse/constants/positions';

/*
  Shared normalization helpers for the Shift Lead Report (/reports/shift-lead).

  Both the scheduled report (slot/shift-lead-report) and the on-duty report
  (timesheet/on-duty-shift-lead-report) return loosely-typed payloads that need
  the same two transforms before rendering:

    1) re-attach slot/position object pointers that the API only references by id
    2) sort rows by a shared "shift lead" priority

  The two payloads differ only in HOW a row finds its position: the scheduled
  payload links people through a `slot_id` (slot -> position_id), while the
  on-duty payload carries `position_id` directly. The `useSlot` flag selects
  between the two. Keeping the logic here means a fix lands once, not four times.
*/

// Sort key that forces Shiny Pennies to the very end regardless of their title.
// '￿' collates after any real title, so it survives titles that start with
// digits (the previous '1111' sentinel did not).
const SHINY_PENNY_TITLE = '￿';

const safe = (value) => value ?? '';

/**
 * Build the shift-lead row comparator.
 *
 * Sort priority:
 *   1) Position title, DESCENDING — Shiny Pennies forced to the very end.
 *   2) (scheduled only) Shift start time, ascending.
 *   3) Years rangered, descending.
 *
 * @param {boolean} useSlot true for the scheduled payload (position via slot)
 * @returns {(a, b) => number}
 */
export function shiftLeadComparator(useSlot) {
  return (a, b) => {
    const positionIdA = useSlot ? a.slot?.position_id : a.position_id;
    const positionIdB = useSlot ? b.slot?.position_id : b.position_id;

    const titleA = positionIdA === DIRT_SHINY_PENNY ? SHINY_PENNY_TITLE : safe(a.position?.title);
    const titleB = positionIdB === DIRT_SHINY_PENNY ? SHINY_PENNY_TITLE : safe(b.position?.title);

    const titleCompare = -titleA.localeCompare(titleB);
    if (titleCompare) {
      return titleCompare;
    }

    if (useSlot) {
      const beginsCompare = safe(a.slot?.begins).localeCompare(safe(b.slot?.begins));
      if (beginsCompare) {
        return beginsCompare;
      }
    }

    return -((a.years ?? 0) - (b.years ?? 0));
  };
}

/**
 * Re-attach slot/position pointers to each signup row and return a new sorted
 * array. Rows whose slot or position cannot be resolved are skipped rather than
 * left to crash the render (the previous code dereferenced before guarding).
 *
 * @param {object[]} people raw signup rows from the API
 * @param {object} maps {slots, positions, useSlot}
 * @returns {object[]} the same row objects, hydrated and sorted
 */
export function rehydratePeople(people, {slots, positions, useSlot}) {
  const rows = (people ?? []).filter((person) => {
    if (useSlot) {
      const slot = slots[person.slot_id];
      if (!slot) {
        return false;
      }
      const position = positions[slot.position_id];
      if (!position) {
        return false;
      }
      person.slot = slot;
      person.position = position;
    } else {
      const position = positions[person.position_id];
      if (!position) {
        return false;
      }
      person.position = position;
    }
    return true;
  });

  return rows.sort(shiftLeadComparator(useSlot));
}

/**
 * Normalize the "below minimum staffing" rows. The two payloads have different
 * shapes:
 *   - scheduled (useSlot): an array of slot ids; each is looked up in `slots`
 *     and flattened into a display row.
 *   - on-duty: an array of objects that already carry the counts; we only need
 *     to resolve the position title.
 *
 * Rows that cannot resolve their slot/position are skipped. Result is sorted by
 * title ascending.
 *
 * @param {Array} rows raw below-min rows (slot ids or objects)
 * @param {object} maps {slots, positions, useSlot}
 * @returns {object[]}
 */
export function rehydrateBelowMin(rows, {slots, positions, useSlot}) {
  const out = (rows ?? []).map((row) => {
    if (useSlot) {
      const slot = slots[row];
      if (!slot) {
        return null;
      }
      const position = positions[slot.position_id];
      if (!position) {
        return null;
      }
      return {
        title: position.title,
        slot_begins: slot.begins,
        slot_ends: slot.ends,
        min: slot.min,
        max: slot.max,
        signed_up: slot.signed_up,
      };
    }

    const position = positions[row.position_id];
    return {...row, title: position?.title ?? `Position #${row.position_id}`};
  }).filter(Boolean);

  return out.sort((a, b) => a.title.localeCompare(b.title));
}
