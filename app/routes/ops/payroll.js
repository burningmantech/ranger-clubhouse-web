import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {PAYROLL} from "clubhouse/constants/roles";
import EmberObject from '@ember/object';
import _ from 'lodash';
import dayjs from 'dayjs';

export default class OpsPayrollRoute extends ClubhouseRoute {
  roleRequired = PAYROLL;

  model() {
    return this.ajax.request('position', {data: {has_paycode: 1, active: 1}});
  }

  setupController(controller, model) {
    controller.positions = model.position;
    const paycodes = _.uniq(model.position.map((p) => p.paycode));
    paycodes.sort();
    controller.paycodeOptions = paycodes;
    controller.positionOptions = model.position.map((p) => [ `${p.title} (code ${p.paycode})`, p.id ]);
    const today = dayjs(), payrollWeekEnd = today.startOf('w');
    const payrollWeekStart = payrollWeekEnd.subtract(1, 'week');

    controller.payrollWeekStart = this._buildWeek(payrollWeekStart);
    controller.payrollWeekEnd = this._buildWeek(payrollWeekEnd);
    controller.defaultWeekLabel = `${payrollWeekStart.format('ddd MMM D')} 00:00 to ${payrollWeekEnd.format('ddd MMM D')} @ 00:00`;

    controller.datesForm = EmberObject.create({
      start_time: controller.payrollWeekStart,
      end_time: controller.payrollWeekEnd,
      break_duration: 60,
      position_ids: model.position.map((p) => p.id),
      hour_cap: 8,
      break_after: 4,
    });
    controller.people = [];
    controller.reportWasRun = false;
  }

  _buildWeek(week) {
    return `${week.format('YYYY-MM-DD')} 00:00`;
  }
}
