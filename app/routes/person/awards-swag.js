import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import shirtOptions from 'clubhouse/utils/shirt-options';

export default class PersonAwardsRoute extends ClubhouseRoute {
  model() {
    const person_id = this.modelFor('person').id;
    return RSVP.hash({
      awards: this.ajax.request('award').then(({award}) => award),
      personAwards: this.store.query('person-award', {person_id}),
      swags: this.ajax.request('swag').then(({swag}) => swag),
      personSwag: this.store.query('person-swag', {person_id}),
    });
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.setProperties(shirtOptions(model.swags, false));
    controller.setProperties(model);
  }
}
