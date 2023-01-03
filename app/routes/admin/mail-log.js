import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class AdminMailLogRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true },
    page: { refreshModel: true },
  };

  model(params) {
    const year = requestYear(params);
    const page = params.page ?? 1;

    return RSVP.hash({
      logs: this.ajax.request(`mail-log`, { data: { year, page } }),
      stats:this.ajax.request('mail-log/stats'),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('year', model.year);
    controller.set('logs', model.logs.mail_log);
    controller.set('meta', model.logs.meta);
    controller.set('stats', model.stats);

  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
      controller.set('page', null);
    }
  }
}
