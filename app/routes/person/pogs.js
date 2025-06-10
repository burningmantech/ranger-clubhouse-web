import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import requestYear from "clubhouse/utils/request-year";

export default class PersonPogsRoute extends ClubhouseRoute {
  queryParams = {
    year: {refreshModel: true}
  };

  model(params) {
    const year = requestYear(params);
    this.year = year;
    return this.store.query('person-pog', {person_id: this.modelFor('person').id, year});
  }

  setupController(controller, model) {
    controller.person = this.modelFor('person');
    controller.personPogs = model;
    controller.year = this.year;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.year = null;
    }
  }
}
