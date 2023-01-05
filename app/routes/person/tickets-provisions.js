import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_ACCESS_DOCS} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class PersonTicketsProvisionsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ACCESS_DOCS];

  model() {
    const person = this.modelFor('person');
    const data = { person_id: person.id };

    this.store.unloadAll('access-document');
    this.store.unloadAll('provision');

    return RSVP.hash({
      documents: this.store.query('access-document', data),
      provisions: this.store.query('provision', data),
      ticketingInfo: this.ajax.request(`ticketing/info`).then(({ticketing_info}) => ticketing_info),
    });
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('year', this.house.currentYear());
    controller.setProperties(model);
  }
}
