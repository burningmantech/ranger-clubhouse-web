import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {NotFoundError} from '@ember-data/adapter/error';
import {ADMIN, EDIT_ACCESS_DOCS} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';
import {DELIVERY_WILL_CALL} from 'clubhouse/models/access-document-delivery';

export default class PersonAccessDocumentsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ACCESS_DOCS];

  model() {
    const person = this.modelFor('person');
    const year = this.house.currentYear();

    this.store.unloadAll('access-document');
    this.store.unloadAll('access-document-delivery');

    return RSVP.hash({
      documents: this.store.query('access-document', {person_id: person.id}),
      delivery: this.store.findRecord('access-document-delivery', `${person.id}:${year}`)
        .catch((response) => {
          if (!(response instanceof NotFoundError)) {
            this.house.handleErrorResponse(response);
          }
          return this.store.createRecord('access-document-delivery', {
            person_id: person.id,
            year,
            method: DELIVERY_WILL_CALL
          });
        }),
      ticketingInfo: this.ajax.request(`ticketing/info`).then((results) => results.ticketing_info)
    });
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('year', this.house.currentYear());
    controller.setProperties(model);
    controller.set('isShowingAll', false);
  }
}
