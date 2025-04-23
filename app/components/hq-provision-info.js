import Component from '@glimmer/component';
import {isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';
import {action} from '@ember/object';
import {htmlSafe} from '@ember/template';
import {EventPeriodLabels} from 'clubhouse/models/event-date';

export default class HqProvisionInfoComponent extends Component {
  @tracked periodLabel;

  constructor() {
    super(...arguments);

    const {period} = this.args;
    this.periodLabel = EventPeriodLabels[period] ?? `Unknown period ${period}`;
  }

  /**
   * Construct a table row indicating if the user has a meal pass or not for the specified period.
   *
   * HTML is
   * <tr><td>Human readable period</td><td>indicates if the person has a pass, or will be issued pogs</td></tr>
   * @param {string} label
   * @param {string }period
   * @returns {*}
   */

  @action
  periodRow(label, period) {
    const week = this.args.eventPeriods[period];
    const icon = week.current ? '<i class="fa-solid fa-arrow-right"></i>' : '';
    let eventPeriod = `<td>${label}`;
    if (week.current) {
      eventPeriod += ` (current period)`
    }
    eventPeriod += '</td>';
    const pogs = week.hasPass ? '<i class="fa-solid fa-ban ms-2"></i> NO POGS - HAS BMID MEAL PASS' : 'Pog for 6+ hours worked';
    const highlight = week.current ? ' class="table-warning fw-bold"' : ' class="text-muted"';

    return htmlSafe(`<tr${highlight}><td>${icon}</td>${eventPeriod}<td>${pogs}</td></tr>`);
  }

  /**
   * Is the person only to be issued pogs?
   *
   * @returns {*}
   */

  get onlyPogs() {
    const {meals} = this.args;
    return isEmpty(meals) || (!meals.pre && !meals.event && !meals.post);
  }
}
