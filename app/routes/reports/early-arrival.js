import ClubhouseRoute from 'clubhouse/routes/clubhouse-route'
import {ADMIN, TIMESHEET_MANAGEMENT} from "clubhouse/constants/roles";

export default class ReportsEarlyArrivalRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, TIMESHEET_MANAGEMENT];

  model() {
    return this.ajax.request('access-document/early-arrival');
  }

  setupController(controller, model) {
    controller.status = model.status;
    controller.arrivals = model.arrivals;
    controller.pre_event_start = model.pre_event_start;
    controller.pre_event_end = model.pre_event_end;
  }
}
