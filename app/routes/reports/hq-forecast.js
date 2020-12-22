import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsHqForecastRoute extends Route {
  queryParams = {
    year: { refreshModel: true },
    interval: { refreshModel: true }
  }

  model(params) {
    const year = requestYear(params);
    const interval = params.interval || 60;

    this.year = year;
    this.interval = interval;

    return this.ajax.request('slot/hq-forecast-report', { data: { year, interval }});
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties({
      year: this.year,
      interval: this.interval,
      visits: model.visits,
      burns: model.burns,
      dayFilter: 'all',
      staffFilter: 'all'
    });
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('interval', null);
    }
  }
}
