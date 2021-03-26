import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsScheduleByPositionRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const year = requestYear(params);

    this.year = year;
    return this.ajax.request('slot/position-schedule-report', { data: { year }});
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    super.setupController(...arguments);

    controller.set('positions', model.positions);
    controller.set('isExpanding', false);
    controller.set('expandAll', false);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
