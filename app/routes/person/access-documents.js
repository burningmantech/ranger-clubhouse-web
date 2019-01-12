import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class PersonAccessDocumentsRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.EDIT_ACCESS_DOCS ]);
  }

  model() {
    const person = this.modelFor('person').person;
    return RSVP.hash({
      documents: this.store.query('access-document', { person_id: person.id }),
      ticketingInfo: this.ajax.request(`access-document/ticketing-info`).then((results) => results.ticketing_info)
    });
  }

  setupController(controller, model) {
    controller.setProperties(this.modelFor('person'));
    controller.setProperties(model);
  }
}
