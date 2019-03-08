import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import DS from 'ember-data';
import RSVP from 'rsvp';

export default class PersonAccessDocumentsRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.EDIT_ACCESS_DOCS ]);
  }

  model() {
    const person = this.modelFor('person');
    const year  = (new Date()).getFullYear();

    return RSVP.hash({
      documents: this.store.query('access-document', { person_id: person.id }),
      delivery: this.store.findRecord('access-document-delivery', `${person.id}:${year}`)
                .catch((response) => {
                  if (!(response instanceof DS.NotFoundError)) {
                    this.house.handleErrorResponse(response);
                  }
                  return null;
                }),
      ticketingInfo: this.ajax.request(`ticketing/info`).then((results) => results.ticketing_info)
    });
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.setProperties(model);
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('year', null);
    }
  }
}
