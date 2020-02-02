import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class PersonPhotosRoute extends Route {
  beforeModel() {
    super.beforeModel(...arguments);
    this.house.roleCheck([Role.ADMIN, Role.VC]);
  }

  model() {
    const person_id = this.modelFor('person').id;

    this.store.unloadAll('person-photo');

    return this.store.query('person-photo', { person_id });
  }

  setupController(controller, model) {
    super.setupController(...arguments);

    controller.set('person', this.modelFor('person'));
    controller.set('photos', model);
    controller.set('photo', null);
  }
}
