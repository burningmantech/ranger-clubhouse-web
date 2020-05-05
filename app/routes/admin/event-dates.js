import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';

export default class AdminEventDatesRoute extends Route {
  beforeModel() {
    this.house.roleCheck(Role.ADMIN);
  }

  model() {
    return this.store.query('event-date', {});
  }

  setupController(controller, model) {
    controller.set('eventDates', model);
  }
}
