import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class AdminMailLogRoute extends ClubhouseRoute {
  queryParams = {
    page: {refreshModel: true},
  };

  async model(params) {
    const page = params.page ?? 1;

    return {
      logs: await this.ajax.request(`mail-log`, {data: {page}}),
      stats: await this.ajax.request('mail-log/stats'),
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('logs', model.logs.mail_log);
    controller.set('meta', model.logs.meta);
    controller.set('stats', model.stats);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('page', null);
    }
  }
}
