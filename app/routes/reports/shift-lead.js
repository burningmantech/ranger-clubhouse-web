import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import {ADMIN, MANAGE} from 'clubhouse/constants/roles';

export default class ReportsShiftLeadRoute extends ClubhouseRoute {
  // The Shift Lead Report exposes rosters, callsigns, gender, and vehicle
  // status. Gate it to the same audience as the Reports menu (admin / manage)
  // so it cannot be loaded by direct URL.
  roleRequired = [ADMIN, MANAGE];

  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    return this.ajax.request(`slot/dirt-shift-times`, {data: {year}})
      .then((result) => ({year, shifts: result.shifts}));
  }

  setupController(controller, model) {
    controller.set('dirtShiftTimes', model.shifts);
    controller.set('year', model.year);
    controller.set('shiftSelect', null);
    controller.set('isOnDuty', false);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
