import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp'

export default class PersonMailLogRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true },
    page: { refreshModel: true },
  };

  model(params) {
    const person_id = this.modelFor('person').id;
    const year = requestYear(params);
    const page = params.page ?? 1;

    return RSVP.hash({
      logs: this.ajax.request(`mail-log`, { data: { person_id, year, page } }),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('person'));
    controller.set('year', model.year);
    controller.set('logs', model.logs.mail_log);
    controller.set('meta', model.logs.meta);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('mailLog', null);
      controller.set('year', null);
      controller.set('page', null);
    }
  }
}
