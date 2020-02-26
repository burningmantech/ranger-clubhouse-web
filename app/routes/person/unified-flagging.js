import Route from '@ember/routing/route';
import {Role} from 'clubhouse/constants/roles';

export default class PersonUnifiedFlaggingRoute extends Route {
  beforeModel() {
    this.house.roleCheck(Role.INTAKE);

  }

  model() {
    const year = this.house.currentYear();
    const personId = this.modelFor('person').id;

    this.year = year;
    return this.ajax.request(`intake/${personId}/history`, {data: {year}});
  }

  setupController(controller, model) {
    controller.set('person', this.modelFor('person'));
    controller.set('history', model.person);
    controller.set('year', this.year);
  }
}
