import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsShiftCoverageRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true },
    type: { refreshModel: true },
  };

  model(params) {
    const year = requestYear(params);
    const type = params.type || ((this.house.currentYear() === 2021) ? 'one' : 'command');

    this.year = year;
    this.type = type;
    return this.ajax.request('slot/shift-coverage-report', { data: { year, type }});
  }

  setupController(controller, model) {
    controller.set('periods', model.periods);
    controller.set('columns', model.columns);
    controller.set('year', this.year);
    controller.set('type', this.type);
    controller.set('dayFilter', 'all');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('type', null);
    }
  }
}
