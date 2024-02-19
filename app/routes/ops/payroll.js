import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {PAYROLL} from "clubhouse/constants/roles";
import EmberObject from '@ember/object';
import _ from 'lodash';

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
    controller.datesForm = EmberObject.create({
      start_time: '',
      end_time: '',
      break_duration: 60,
      position_ids: model.position.map((p) => p.id),
      hour_cap: 8,
      break_after: 4,
    });
    controller.people = [];
    controller.reportWasRun = false;
  }
}
