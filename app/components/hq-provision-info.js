import Component from '@glimmer/component';
import {EVENT_PERIOD_ROWS} from 'clubhouse/constants/event-periods';

/**
 * Displays meal-pog / BMID-meal-pass status per event period, and shower-pog status.
 *
 * @arg {Object} eventPeriods - {pre,event,post} each {current: boolean, hasPass: boolean}
 * @arg {boolean} showers - true when the person has Wet Spot Access BMID (no shower pogs)
 */
export default class HqProvisionInfoComponent extends Component {
  periodRows = EVENT_PERIOD_ROWS;

  /**
   * Safe lookup for a single event period; tolerates a missing/undefined eventPeriods.
   * @param {string} key - 'pre' | 'event' | 'post'
   * @returns {{current: boolean, hasPass: boolean}}
   */
  period = (key) => this.args.eventPeriods?.[key] ?? {current: false, hasPass: false};
}
