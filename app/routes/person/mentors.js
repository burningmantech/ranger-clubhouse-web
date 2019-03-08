import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class PersonMentorsRoute extends Route {
  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.VC, Role.MENTOR ]);
  }

  model() {
    const person = this.modelFor('person').person;

    return this.ajax.request(`person/${person.id}/mentors`)
          .then((result) => result.mentors);
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('mentors', model);
  }
}
