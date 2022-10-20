import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';

export default class ReportsEventStatsRoute extends ClubhouseRoute {
  queryParams = {year: {refreshModel: true}}

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.ajax.request('timesheet/event-stats', { data: { year }});
  }

  setupController(controller, model) {
    controller.set('year', this.year);
    controller.set('stats', model.stats);
  }
}
