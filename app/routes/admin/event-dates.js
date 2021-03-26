import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminEventDatesRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    return this.store.query('event-date', {});
  }

  setupController(controller, model) {
    controller.set('eventDates', model);
  }
}
