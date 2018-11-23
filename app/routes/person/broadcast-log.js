import Route from '@ember/routing/route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp'

export default class PersonBroadcastLogRoute extends Route {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const person_id = this.modelFor('person').person.id;
    const year = requestYear(params);

    return RSVP.hash({
      messages: this.ajax.request(`broadcast/messages`, { data: { person_id, year } }).then((result) => result.messages),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.setProperties(this.modelFor('person'));
    controller.setProperties(model);
  }
}
