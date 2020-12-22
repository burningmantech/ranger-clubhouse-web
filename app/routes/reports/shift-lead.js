import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsShiftLeadRoute extends Route {
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
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
