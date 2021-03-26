import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';

export default class PersonTicketsRoute extends ClubhouseRoute {
  model() {
    const person = this.modelFor('person');
    return RSVP.hash({
      ticketingInfo: this.ajax.request('ticketing/info')
                .then((results) => results.ticketing_info ),
      ticketingPackage: this.ajax.request(`ticketing/${person.id}/package`)
                .then((results) => results.package)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
    controller.set('person', this.modelFor('person'));
  }
}
