import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {PAYROLL} from "clubhouse/constants/roles";
import EmberObject from '@ember/object';

export default class AdminPayrollRoute extends ClubhouseRoute {
  roleRequired = PAYROLL;

  model() {
    return this.ajax.request('position', {data: {has_paycode: 1, active: 1}});
  }

  setupController(controller, model) {
    controller.positionOptions = model.position.map((p) => [ `${p.title} (code ${p.paycode})`, p.id ]);
    controller.datesForm = EmberObject.create({
      start_time: '2022-08-17 00:00',
      end_time: '2022-08-20 23:59',
      break_duration: 60,
      position_ids: model.position.map((p) => p.id),
      hour_cap: 8,
    });
    controller.people = [];
    controller.reportWasRun = false;
  }
}
