import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, VC} from "clubhouse/constants/roles";
import dayjs from 'dayjs';

export default class PersonApplicationsRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, VC];

  model() {
    const person = this.modelFor('person');

    return this.store.query('prospective-application', {person_id: person.id});
  }

  setupController(controller, model) {
    const person = this.modelFor('person');

    controller.applications = model;
    controller.person = person;
    controller.createdPriorTo2015 = person.created_at ? (dayjs(person.created_at).year < 2015): true;
  }
}
