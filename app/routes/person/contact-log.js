import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp'

export default class PersonContactLogRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const person_id = this.modelFor('person').person.id;
    const year = requestYear(params);

    return RSVP.hash({
      logs: this.ajax.request(`contact/log`, { data: { person_id, year } }),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties(this.modelFor('person'));
    controller.set('year', model.year);
    controller.set('received_logs', model.logs.received_logs);
    controller.set('sent_logs', model.logs.sent_logs);
  }
}
