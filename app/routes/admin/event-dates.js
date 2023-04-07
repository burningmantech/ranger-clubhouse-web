import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_SLOTS, TECH_NINJA} from 'clubhouse/constants/roles';

export default class AdminEventDatesRoute extends ClubhouseRoute {
  // Allow Edit Slots to see a read only view.
  roleRequired = [ ADMIN, TECH_NINJA, EDIT_SLOTS  ];

  model() {
    return this.store.query('event-date', {});
  }

  setupController(controller, model) {
    controller.set('eventDates', model);
  }
}
