import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp'

export default class PersonBroadcastLogRoute extends ClubhouseRoute {
  queryParams = {
    year: { refreshModel: true }
  };

  model(params) {
    const person_id = this.modelFor('person').id;
    const year = requestYear(params);

    return RSVP.hash({
      messages: this.ajax.request(`broadcast/messages`, { data: { person_id, year } }).then((result) => result.messages),
      year,
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('person'));
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
