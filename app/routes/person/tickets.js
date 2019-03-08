import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class PersonTicketsRoute extends Route {
  model() {
    const person = this.modelFor('person').person;
    return RSVP.hash({
      ticketingInfo: this.ajax.request('ticketing/info')
                .then((results) => results.ticketing_info ),
      ticketPackage: this.ajax.request(`ticketing/${person.id}/package`)
                .then((results) => results.package)
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setProperties(model);
    controller.set('person', this.modelFor('person'));
  }
}
