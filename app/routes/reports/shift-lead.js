import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsShiftLeadRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  }

  model(params) {
      const year = requestYear(params);

      this.year = year;
      return this.ajax.request(`slot/dirt-shift-times`, { data: { year }});
  }

  setupController(controller, model) {
    controller.set('dirtShiftTimes', model.shifts);
    controller.set('year', this.year);
    controller.set('shiftSelect', null);
    controller.set('isOnDuty', false);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
