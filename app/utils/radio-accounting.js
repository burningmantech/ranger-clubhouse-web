import {TYPE_RADIO} from 'clubhouse/models/asset';
import {
  HQ_TODO_COLLECT_RADIO,
  HQ_TODO_COLLECT_RADIO_IF_DONE,
  HQ_TODO_ISSUE_RADIO,
} from 'clubhouse/constants/hq-todo';

/**
 * Compute the radio checkout/collection accounting for a person.
 *
 * The logic mirrors (exactly) the radio getters that previously lived on
 * `controllers/hq/shift.js`:
 *
 *   shiftRadios          - checked out radios that are NOT permanently assigned
 *   eventRadios          - checked out radios that ARE permanently assigned
 *   collectAtShiftEnd    - event radios above the event radio_max limit, to be
 *                          collected at the end of the shift (0 when not over)
 *   collectCount         - total radios to collect now (shift radios + over-max
 *                          event radios)
 *   overMax              - event radios to collect when the person is finished
 *                          rangering the event (capped at radio_max)
 *
 * @param {Array} assetsCheckedOut the person's currently checked-out asset rows
 *   (each row has `.asset.type` and `.asset.perm_assign`)
 * @param {number} radioMax the event radio_max limit for the person
 * @returns {{shiftRadios: number, eventRadios: number, collectCount: number,
 *   collectAtShiftEnd: number, overMax: number, radioMax: number}}
 */
export function radioAccounting(assetsCheckedOut, radioMax) {
  const radios = assetsCheckedOut.filter((a) => a.asset.type === TYPE_RADIO);
  const shiftRadios = radios.filter((a) => !a.asset.perm_assign).length;
  const eventRadios = radios.filter((a) => a.asset.perm_assign).length;

  const collectAtShiftEnd = (eventRadios > radioMax) ? eventRadios - radioMax : 0;
  const collectCount = shiftRadios + collectAtShiftEnd;
  const overMax = (eventRadios > radioMax) ? radioMax : eventRadios;

  return {shiftRadios, eventRadios, collectCount, collectAtShiftEnd, overMax, radioMax};
}

/**
 * Decide which radio-related todo task (if any) a person should be nagged about,
 * based on their on/off duty state, whether they have any more scheduled shifts,
 * and their current radio accounting.
 *
 * This reproduces, exactly, the radio decision tree that previously lived inline
 * in `routes/hq/shift.js` `setupController`.
 *
 * @param {object} options
 * @param {boolean} options.isOffDuty true when the person is NOT currently on duty
 * @param {boolean} options.noMoreScheduled true when there are no more upcoming shifts
 * @param {object} options.accounting result of {@link radioAccounting}
 * @returns {string|null} an HQ_TODO_* radio task constant, or null when none applies
 */
export function computeRadioTodo({isOffDuty, noMoreScheduled, accounting}) {
  const {collectCount, eventRadios, radioMax} = accounting;

  if (!isOffDuty) {
    // Person is currently on duty.
    if (collectCount) {
      return HQ_TODO_COLLECT_RADIO;
    } else if (eventRadios && noMoreScheduled) {
      return HQ_TODO_COLLECT_RADIO_IF_DONE;
    }
    return null;
  }

  // Person is off duty / starting a shift.
  if (radioMax > 0) {
    if (collectCount) {
      // Person is above the event radio checkout limit and/or has a shift radio
      return HQ_TODO_COLLECT_RADIO;
    } else if (noMoreScheduled && eventRadios) {
      // Has radios, and has no more upcoming shifts.
      return HQ_TODO_COLLECT_RADIO_IF_DONE;
    } else if (eventRadios < radioMax) {
      // Below their event radio issue count,
      return HQ_TODO_ISSUE_RADIO;
    }
    // else, has an event radio, and still working - don't nag.
    return null;
  } else if (collectCount) {
    // Off duty with radios, and not event authorized?
    return HQ_TODO_COLLECT_RADIO;
  }
  // No radio - Give 'em one.
  return HQ_TODO_ISSUE_RADIO;
}
